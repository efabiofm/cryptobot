import Binance from './services/binance.js';
import bollingerBreakout from './estrategias/bollinger-breakout/index.js';
import * as Util from './util/index.js';
import './services/express.js';

const symbol = process.env.SYMBOL || 'BTCUSDT';
const interval = process.env.INTERVAL || '15m';
const strategy = process.env.STRATEGY || 'bollinger-breakout';

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

    let resultado;

    switch(strategy) {
      case 'bollinger-breakout':
        resultado = bollingerBreakout({ cierres, altos, bajos, volumenes });
        break;
      case 'ema-cross':
        // TBD
        break;
      default:
        console.error('Debe seleccionar una estrategia');
    }

    if (resultado) {
      Util.enviarNotificacion(resultado);
    }
  }
});

console.log(`Enviando señales de ${interval} para ${symbol}...`);
