export default function imprimirIndicadores({
  cierreActual,
  ultimaBollinger,
  rsiAnterior,
  ultimoRSI,
  adxAnterior,
  ultimoADX,
  volumenActual,
  volumenPromedio,
  signalType,
  entryPrice,
  stopLoss,
  takeProfit,
  lotSize
}) {
  const hora = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
  let log = `---------------------------------------
Hora: ${hora}
Precio: ${cierreActual}
RSI (ultimo): ${ultimoRSI}
RSI (anterior): ${rsiAnterior}
ADX (ultimo): ${ultimoADX}
ADX (anterior): ${adxAnterior}
Volumen (actual): ${volumenActual}
Volumen (promedio): ${volumenPromedio}
Bollinger Bands:
├─ Upper: ${ultimaBollinger.upper}
├─ Middle: ${ultimaBollinger.middle}
└─ Lower: ${ultimaBollinger.lower}`;
  if (signalType) {
    log += `Señal: ${signalType}
├─ Precio: ${entryPrice}
├─ Stop-loss: ${stopLoss}
├─ Take-profit: ${takeProfit}
└─ Tamaño: ${lotSize}`;
  }
  console.log(log);
}
