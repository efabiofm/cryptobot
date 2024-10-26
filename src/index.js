import Binance from './services/binance';
import {
  calcularIndicadores,
  cargarDatosHistoricos,
  enviarNotificacion,
  imprimirIndicadores,
  verificarCondiciones,
} from './util';

const symbol = 'BTCUSDT';
const interval = '15m';

const { altos, bajos, cierres } = await cargarDatosHistoricos({ symbol, interval });

Binance.ws.candles(symbol, interval, (candle) => {
  if (candle.isFinal) {
    altos.push(parseFloat(candle.high));
    bajos.push(parseFloat(candle.low));
    cierres.push(parseFloat(candle.close));

    const indicadores = calcularIndicadores({ cierres, altos, bajos }); // adx, bb, rsi
    const resultado = verificarCondiciones({ cierres, altos, bajos, ...indicadores });

    imprimirIndicadores(indicadores);

    if (resultado) {
      enviarNotificacion(resultado);
    }
  }
});

console.log(`Señales de entrada de ${interval} para ${symbol}...`);
