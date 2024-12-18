import TI from 'technicalindicators';
import { getOrderSize, getStopLoss, printIndicators } from '../../util/index.js';

const rsiPeriod = 14;
const avgVolumePeriod = 20;
const rewardRiskRatio = 1.5;

function emaCross({ closeList, highList, lowList, volumeList }) {
  if (closeList.length >= 200) {
    let entryPrice, stopLoss, takeProfit, orderSize, signalType;

    const rsi = TI.RSI.calculate({
      period: rsiPeriod,
      values: closeList,
    });

    const ema9 = TI.EMA.calculate({
      period: 9,
      values: closeList
    });

    const ema21 = TI.EMA.calculate({
      period: 21,
      values: closeList
    });

    const ema200 = TI.EMA.calculate({
      period: 200,
      values: closeList
    });

    const avgVolume = volumeList.slice(-avgVolumePeriod).reduce((a, b) => a + b, 0) / avgVolumePeriod;

    const lastPrice = closeList[closeList.length - 1];
    const lastVolume = volumeList[volumeList.length - 1];
    const lastRSI = rsi[rsi.length - 1];
    const lastEMA9 = ema9[ema9.length - 1];
    const prevEMA9 = ema9[ema9.length - 2];
    const lastEMA21 = ema21[ema21.length - 1];
    const prevEMA21 = ema21[ema21.length - 2];
    const lastEMA200 = ema200[ema200.length - 1];
    const prevRSI = rsi[rsi.length - 2] || lastRSI;

    // BUY
    if (lastEMA9 > lastEMA21
      && prevEMA9 < prevEMA21
      && lastPrice > lastEMA200
      && lastRSI < 70
      && prevRSI < 70
      && lastVolume > avgVolume
    ) {
      signalType = 'Buy';
      entryPrice = lastPrice;
      stopLoss = getStopLoss({
        array: lowList,
        type: 'low',
        reference: lastEMA200,
        entryPrice
      });
      takeProfit = entryPrice + (entryPrice - stopLoss) * rewardRiskRatio;
      orderSize = getOrderSize(entryPrice, stopLoss);
    }

    // SELL
    if (lastEMA9 < lastEMA21
      && prevEMA9 > prevEMA21
      && lastPrice < lastEMA200
      && lastRSI > 30
      && prevRSI > 30
      && lastVolume > avgVolume
    ) {
      signalType = 'Sell';
      entryPrice = lastPrice;
      stopLoss = getStopLoss({
        array: highList,
        type: 'high',
        reference: lastEMA200,
        entryPrice
      });
      takeProfit = entryPrice - (stopLoss - entryPrice) * rewardRiskRatio;
      orderSize = getOrderSize(entryPrice, stopLoss);
    }
    printIndicators({
      lastPrice,
      lastVolume,
      avgVolume,
      lastRSI,
      lastEMA9,
      lastEMA21,
      lastEMA200,
      prevEMA9,
      prevEMA21,
      prevRSI,
      signalType,
      entryPrice,
      stopLoss,
      takeProfit,
      orderSize
    });

    if (signalType) {
      return {
        signalType,
        entryPrice,
        stopLoss,
        takeProfit,
        orderSize
      };
    }
  }
}

export default emaCross;
