import Binance from './services/binance.js';
import Bybit from './services/bybit.js';
import get from 'lodash/get.js';
import * as estrategias from './estrategias/index.js';
import * as util from './util/index.js';
import './services/express.js';

const symbol = process.env.SYMBOL;
const interval = process.env.INTERVAL;
const strategy = process.env.STRATEGY;

const data = await util.cargarDatosHistoricos({ symbol, interval });
const { altos, bajos, cierres, volumenes } = data;
const estrategia = estrategias[strategy];

const watchCandles = process.env.TESTNET === 'true' ? Bybit.ws.update : Binance.ws.candles;

watchCandles(symbol, interval, (value) => {
  const candle = get(value, 'data[0]', value);
  if (candle.isFinal || candle.confirm) {
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
