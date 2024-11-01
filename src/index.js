import Binance from './services/binance.js';
import * as BBB from './estrategias/bollinger-breakout/index.js';
import * as Util from './util/index.js';
import './services/express.js';

const symbol = process.env.SYMBOL || 'BTCUSDT';
const interval = process.env.INTERVAL || '15m';

const {
  altos,
  bajos,
  cierres,
  volumenes
} = await Util.cargarDatosHistoricos({ symbol, interval });

Binance.ws.candles(symbol, interval, (candle) => {
  if (candle.isFinal) {
    altos.push(parseFloat(candle.high));
    bajos.push(parseFloat(candle.low));
    cierres.push(parseFloat(candle.close));
    volumenes.push(parseFloat(candle.volume));

    const indicadores = BBB.calcularIndicadores({ cierres, altos, bajos, volumenes });
    const resultado = BBB.verificarCondiciones({ cierres, altos, bajos, ...indicadores });

    if (resultado) {
      Util.enviarNotificacion(resultado);
    }
  }
});

console.log(`Enviando señales de ${interval} para ${symbol}...`);
