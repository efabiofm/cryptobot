export default function imprimirIndicadores({
  lastPrice,
  lastBollinger,
  lastRSI,
  lastADX,
  lastVolume,
  signalType,
  stopLoss,
  takeProfit,
  orderSize
}) {
  const hora = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
  let log = `---------------------------------------
Time: ${hora}
Price: ${lastPrice}
RSI: ${lastRSI}
ADX: ${lastADX}
Volume: ${lastVolume}
Bollinger Bands:
├─ Upper: ${lastBollinger.upper}
├─ Middle: ${lastBollinger.middle}
└─ Lower: ${lastBollinger.lower}`;
  if (signalType) {
    log += `Position: ${signalType}
├─ Price: ${lastPrice}
├─ Stop-loss: ${stopLoss}
├─ Take-profit: ${takeProfit}
└─ Size: ${orderSize}`;
  }
  console.log(log);
}
