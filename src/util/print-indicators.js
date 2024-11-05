export default function printIndicators(params) {
  if (process.env.LOGGER_ENABLED !== 'true') return;

  const time = new Date().toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' });
  let log = `---------------------------------------
Time: ${time}`;

  switch(process.env.STRATEGY) {
    case 'bollingerBreakout':
      log += `
Price: ${params.lastPrice}
RSI: [${params.prevRSI}, ${params.lastRSI}]
ADX: [${params.prevADX}, ${params.lastADX}]
Volume: ${params.lastVolume}
Avg. Volume: ${params.avgVolume}
Bollinger Bands:
├─ Upper: ${params.lastBollinger.upper}
├─ Middle: ${params.lastBollinger.middle}
└─ Lower: ${params.lastBollinger.lower}`;
      break;
    case 'emaCross':
      log += `
Price: ${params.lastPrice}
RSI: [${params.prevRSI}, ${params.lastRSI}]
EMA 9: [${params.prevEMA9}, ${params.lastEMA9}]
EMA 21: [${params.prevEMA21}, ${params.lastEMA21}]
EMA 200: ${params.lastEMA200}
Volume: ${params.lastVolume}
Avg. Volume: ${params.avgVolume}`;
      break;
    default:
  }

  if (params.signalType) {
    log += `
Position: ${params.signalType}
├─ Price: ${params.lastPrice}
├─ Stop-loss: ${params.stopLoss}
├─ Take-profit: ${params.takeProfit}
└─ Size: ${params.orderSize}`;
  }
  console.log(log);
}
