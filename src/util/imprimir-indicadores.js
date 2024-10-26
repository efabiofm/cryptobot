export default function imprimirIndicadores({ closePrice, bollingerBands, rsi, adx }) {
  console.log('----------------------------------------');
  console.log(`Precio de cierre: ${closePrice}`);
  console.log(`Bollinger Bands (20, 2): [${bollingerBands.upper}, ${bollingerBands.lower}]`);
  console.log(`RSI (14): ${rsi}`);
  console.log(`ADX (14): ${adx}`);
}
