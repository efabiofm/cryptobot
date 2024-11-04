import TI from 'technicalindicators';
import imprimirIndicadores from './imprimir-indicadores.js';
import { calcularCantidadInvertir, obtenerStopLoss } from '../../util/index.js';

const periodoRSI = 14;
const periodoADX = 14;
const periodoVolumenPromedio = 20;
const configuracionBollinger = { period: 20, stdDev: 2 };
const rewardRiskRatio = 1.5;

function bollingerBreakout({ cierres, altos, bajos, volumenes }) {
  if (cierres.length >= 20) { // Se asegura que tenemos suficiente data
    // Calcular Bandas de Bollinger
    const bollinger = TI.BollingerBands.calculate({
      period: configuracionBollinger.period,
      values: cierres,
      stdDev: configuracionBollinger.stdDev,
    });

    // Calcular RSI
    const rsi = TI.RSI.calculate({
      period: periodoRSI,
      values: cierres,
    });

    // Calcular ADX
    const adx = TI.ADX.calculate({
      period: periodoADX,
      close: cierres,
      high: altos,
      low: bajos,
    });

    // Obtener los valores actuales
    const volumenPromedio = volumenes.slice(-periodoVolumenPromedio).reduce((a, b) => a + b, 0) / periodoVolumenPromedio;
    const volumenActual = volumenes[volumenes.length - 1];
    const ultimaBollinger = bollinger[bollinger.length - 1];
    const ultimoRSI = rsi[rsi.length - 1];
    const ultimoADX = adx[adx.length - 1].adx;
    const adxAnterior = adx[adx.length - 2].adx || ultimoADX;
    const rsiAnterior = rsi[rsi.length - 2] || ultimoRSI;
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

    imprimirIndicadores({
      cierreActual,
      ultimaBollinger,
      rsiAnterior,
      ultimoRSI,
      adxAnterior,
      ultimoADX,
      volumenActual,
      signalType,
      entryPrice,
      stopLoss,
      takeProfit,
      lotSize
    });

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
}

export default bollingerBreakout;
