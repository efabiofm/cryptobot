import Binance from './services/binance';
import cargarDatosHistoricos from './util/cargar-datos-historicos';
import calcularIndicadores from './util/calcular-indicadores';
import verificarCondiciones from './util/verificar-condiciones';

const symbol = 'BTCUSDT';
const interval = '15m';

const { altos, bajos, cierres } = await cargarDatosHistoricos({ symbol, interval });

Binance.ws.candles(symbol, interval, (candle) => {
  if (candle.isFinal) {
    altos.push(parseFloat(candle.high));
    bajos.push(parseFloat(candle.low));
    cierres.push(parseFloat(candle.close));

    const { closePrice, bollingerBands, rsi, adx } = calcularIndicadores({ cierres, altos, bajos });

    console.log('------------------------------------');
    console.log(`Precio de cierre: ${closePrice}`);
    console.log(`Bollinger Bands (20, 2): [${bollingerBands.upper}, ${bollingerBands.lower}]`);
    console.log(`RSI (14): ${rsi}`);
    console.log(`ADX (14): ${adx}`);

    const resultado = verificarCondiciones({ cierres, altos, bajos, bollingerBands, rsi, adx });

    if (resultado) {
      console.log('------------------------------------');
      console.log(`SEÑAL DE ${resultado.signalType}`);
      console.log(`Precio de Entrada: ${resultado.entryPrice}`);
      console.log(`Stop-Loss: ${resultado.stopLoss}`);
      console.log(`Take-Profit: ${resultado.takeProfit}`);
      console.log(`Cantidad a Invertir: ${resultado.lotSize.toFixed(2)} USDT`);
    }
  }
});

console.log(`Señales de entrada de ${interval} para ${symbol}...`);
