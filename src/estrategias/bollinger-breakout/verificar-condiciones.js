import { obtenerStopLoss, calcularCantidadInvertir } from '../../util/index.js';

export default function verificarCondiciones({
  cierres,
  altos,
  bajos,
  ultimaBollinger,
  ultimoRSI,
  ultimoADX,
  adxAnterior,
  rsiAnterior,
  volumenActual,
  volumenPromedio
}) {
  const rewardRiskRatio = 1.5;
  const cierreActual = cierres[cierres.length - 1];
  let entryPrice, stopLoss, takeProfit, lotSize, signalType;

  // Condiciones para BUY
  if (
    ultimoADX > 20
    // && ultimoADX > adxAnterior
    && ultimoRSI >= 60 && ultimoRSI <= 70
    && rsiAnterior <= 70
    && cierreActual > ultimaBollinger.upper
    && volumenActual > volumenPromedio
  ) {
    signalType = 'BUY';
    entryPrice = cierreActual;
    stopLoss = obtenerStopLoss({
      array: bajos,
      tipo: 'low',
      valorReferencia: ultimaBollinger.middle,
      cierreActual
    });
    takeProfit = entryPrice + (entryPrice - stopLoss) * rewardRiskRatio;
    lotSize = calcularCantidadInvertir(entryPrice, stopLoss);
  }

  // Condiciones para SELL
  if (
    ultimoADX > 20
    // && ultimoADX > adxAnterior
    && ultimoRSI <= 40 && ultimoRSI >= 30
    && rsiAnterior >= 30
    && cierreActual < ultimaBollinger.lower
    && volumenActual > volumenPromedio
  ) {
    signalType = 'SELL';
    entryPrice = cierreActual;
    stopLoss = obtenerStopLoss({
      array: altos,
      tipo: 'high',
      valorReferencia: ultimaBollinger.middle,
      cierreActual
    });
    takeProfit = entryPrice - (stopLoss - entryPrice) * rewardRiskRatio;
    lotSize = calcularCantidadInvertir(entryPrice, stopLoss);
  }

  if (signalType) {
    return {
      signalType,
      entryPrice,
      stopLoss,
      takeProfit,
      lotSize
    };
  }
}
