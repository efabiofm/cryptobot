import binance from './services/binance.js';
import * as estrategias from './estrategias/index.js';
import * as util from './util/index.js';
import './services/express.js';

const symbol = process.env.SYMBOL;
const interval = process.env.INTERVAL;
const strategy = process.env.STRATEGY;

const data = await util.cargarDatosHistoricos({ symbol, interval });
const estrategia = estrategias[strategy];

const { altos, bajos, cierres, volumenes } = data;

binance.ws.candles(symbol, interval, (candle) => {
  if (candle.isFinal) {
    altos.push(parseFloat(candle.high));
    bajos.push(parseFloat(candle.low));
    cierres.push(parseFloat(candle.close));
    volumenes.push(parseFloat(candle.volume));

    const resultado = estrategia({ cierres, altos, bajos, volumenes });

    if (resultado) {
      util.enviarNotificacion(resultado);
    }
  }
});

console.log(`Symbol: ${symbol} | Interval: ${interval} | Strategy: ${strategy}`);
