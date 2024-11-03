import TI from 'technicalindicators';
import { calcularCantidadInvertir, obtenerStopLoss } from '../../util/index.js';

const periodoRSI = 14;
const periodoVolumenPromedio = 20;
const rewardRiskRatio = 1.5;

function emaCross({ cierres, altos, bajos, volumenes }) {
  if (cierres.length >= 200) {
    let entryPrice, stopLoss, takeProfit, lotSize, signalType;

    const rsi = TI.RSI.calculate({
      period: periodoRSI,
      values: cierres,
    });

    const ema9 = TI.EMA.calculate({
      period: 9,
      values: cierres
    });

    const ema21 = TI.EMA.calculate({
      period: 21,
      values: cierres
    });

    const ema200 = TI.EMA.calculate({
      period: 200,
      values: cierres
    });

    const volumenPromedio = volumenes.slice(-periodoVolumenPromedio).reduce((a, b) => a + b, 0) / periodoVolumenPromedio;

    const cierreActual = cierres[cierres.length - 1];
    const volumenActual = volumenes[volumenes.length - 1];
    const ultimoRSI = rsi[rsi.length - 1];
    const ultimaEMA9 = ema9[ema9.length - 1];
    const ultimaEMA21 = ema21[ema21.length - 1];
    const ultimaEMA200 = ema200[ema200.length - 1];
    const rsiAnterior = rsi[rsi.length - 2] || ultimoRSI;

    // BUY
    if (ultimaEMA9 > ultimaEMA21
      && cierreActual > ultimaEMA200
      && ultimoRSI < 70
      && rsiAnterior < 70
      && volumenActual > volumenPromedio
    ) {
      signalType = 'BUY';
      entryPrice = cierreActual;
      stopLoss = obtenerStopLoss({
        array: bajos,
        tipo: 'low',
        valorReferencia:ultimaEMA200,
        cierreActual
      });
      takeProfit = entryPrice + (entryPrice - stopLoss) * rewardRiskRatio;
      lotSize = calcularCantidadInvertir(entryPrice, stopLoss);
    }

    // SELL
    if (ultimaEMA9 < ultimaEMA21
      && cierreActual < ultimaEMA200
      && ultimoRSI > 30
      && rsiAnterior > 30
      && volumenActual > volumenPromedio
    ) {
      signalType = 'SELL';
      entryPrice = cierreActual;
      stopLoss = obtenerStopLoss({
        array: altos,
        tipo: 'high',
        valorReferencia: ultimaEMA200,
        cierreActual
      });
      takeProfit = entryPrice - (entryPrice - stopLoss) * rewardRiskRatio;
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
}

export default emaCross;
