export default function imprimirIndicadores({ closePrice, bollingerBands, rsi, adx }) {
  console.log('=========================================');
  console.log(`Precio: ${closePrice}
RSI (14):  ${rsi}
ADX (14): ${adx}
Bollinger Bands (20, 2):
├─ Upper: ${bollingerBands.upper}
├─ Middle: ${bollingerBands.middle}
└─ Lower: ${bollingerBands.lower}`);
}
