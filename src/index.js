import Binance from './services/binance.js';
import * as Util from './util/index.js';
import './services/express.js';

const symbol = process.env.SYMBOL || 'BTCUSDT';
const interval = process.env.INTERVAL || '15m';
const { altos, bajos, cierres } = await Util.cargarDatosHistoricos({ symbol, interval });

Binance.ws.candles(symbol, interval, (candle) => {
  if (candle.isFinal) {
    altos.push(parseFloat(candle.high));
    bajos.push(parseFloat(candle.low));
    cierres.push(parseFloat(candle.close));

    const indicadores = Util.calcularIndicadores({ cierres, altos, bajos }); // adx, bb, rsi
    const resultado = Util.verificarCondiciones({ cierres, altos, bajos, ...indicadores });

    Util.imprimirIndicadores(indicadores);

    if (resultado) {
      Util.enviarNotificacion(resultado);
    }
  }
});

console.log(`Enviando señales de ${interval} para ${symbol}...`);
