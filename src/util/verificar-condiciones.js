import obtenerSwing from './obtener-swing';
import calcularCantidadInvertir from './calcular-cantidad-invertir';

export default function verificarCondiciones(
  cierres,
  altos,
  bajos,
  ultimaBollinger,
  ultimoRSI,
  ultimoADX
) {
  const rewardRiskRatio = 1.5;
  const cierreActual = cierres[cierres.length - 1];
  let entryPrice, stopLoss, takeProfit, lotSize, signalType;

  // Condiciones para BUY
  if (
    ultimoADX.adx > 25 &&
    ultimoRSI >= 60 && ultimoRSI <= 70 &&
    cierreActual > ultimaBollinger.upper
  ) {
    signalType = 'BUY';
    entryPrice = cierreActual;
    stopLoss = obtenerSwing(bajos, 'low');
    takeProfit = entryPrice + (entryPrice - stopLoss) * rewardRiskRatio;
    lotSize = calcularCantidadInvertir(entryPrice, stopLoss);
  }

  // Condiciones para SELL
  if (
    ultimoADX.adx > 25 &&
    ultimoRSI <= 30 && ultimoRSI >= 20 &&
    cierreActual < ultimaBollinger.lower
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
