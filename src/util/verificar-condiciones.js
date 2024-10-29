import obtenerStopLoss from './obtener-stop-loss.js';
import calcularCantidadInvertir from './calcular-cantidad-invertir.js';

export default function verificarCondiciones({
  cierres,
  altos,
  bajos,
  bollingerBands,
  rsi,
  adx
}) {
  const rewardRiskRatio = 1.5;
  const cierreActual = cierres[cierres.length - 1];
  let entryPrice, stopLoss, takeProfit, lotSize, signalType;

  // Condiciones para BUY
  if (
    adx > 20 &&
    rsi >= 60 && rsi <= 70 &&
    cierreActual > bollingerBands.upper
  ) {
    signalType = 'BUY';
    entryPrice = cierreActual;
    stopLoss = obtenerStopLoss({
      array: bajos,
      tipo: 'low',
      bollingerMiddle: bollingerBands.middle,
      cierres
    });
    takeProfit = entryPrice + (entryPrice - stopLoss) * rewardRiskRatio;
    lotSize = calcularCantidadInvertir(entryPrice, stopLoss);
  }

  // Condiciones para SELL
  if (
    adx > 20 &&
    rsi <= 30 && rsi >= 20 &&
    cierreActual < bollingerBands.lower
  ) {
    signalType = 'SELL';
    entryPrice = cierreActual;
    stopLoss = obtenerStopLoss({
      array: altos,
      tipo: 'high',
      bollingerMiddle: bollingerBands.middle,
      cierres
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
