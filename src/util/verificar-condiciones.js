import obtenerSwing from './obtener-swing';
import calcularCantidadInvertir from './calcular-cantidad-invertir';

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
    adx > 25 &&
    rsi >= 60 && rsi <= 70 &&
    cierreActual > bollingerBands.upper
  ) {
    signalType = 'BUY';
    entryPrice = cierreActual;
    stopLoss = obtenerSwing(bajos, 'low');
    takeProfit = entryPrice + (entryPrice - stopLoss) * rewardRiskRatio;
    lotSize = calcularCantidadInvertir(entryPrice, stopLoss);
  }

  // Condiciones para SELL
  if (
    adx > 25 &&
    rsi <= 30 && rsi >= 20 &&
    cierreActual < bollingerBands.lower
  ) {
    signalType = 'SELL';
    entryPrice = cierreActual;
    stopLoss = obtenerSwing(altos, 'high');
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
