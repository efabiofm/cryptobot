export default function imprimirIndicadores({ closePrice, bollingerBands, rsi, adx }) {
  const hora = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
  const log = `---------------------------------------
Hora: ${hora}
Precio: ${closePrice}
RSI (14): ${rsi}
ADX (14): ${adx}
Bollinger Bands (20, 2):
├─ Upper: ${bollingerBands.upper}
├─ Middle: ${bollingerBands.middle}
└─ Lower: ${bollingerBands.lower}`;
  console.log(log);
}
