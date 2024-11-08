import TI from 'technicalindicators';
import { getOrderSize, getStopLoss, printIndicators } from '../../util/index.js';

const rsiPeriod = 14;
const adxPeriod = 14;
const avgVolumePeriod = 20;
const bollingerConfig = { period: 20, stdDev: 2 };
const rewardRiskRatio = 1.5;

function bollingerBreakout({ closeList, highList, lowList, volumeList }) {
  if (closeList.length >= 20) { // Make sure we have enough data
    const bollinger = TI.BollingerBands.calculate({
      period: bollingerConfig.period,
      values: closeList,
      stdDev: bollingerConfig.stdDev,
    });

    const rsi = TI.RSI.calculate({
      period: rsiPeriod,
      values: closeList,
    });

    const adx = TI.ADX.calculate({
      period: adxPeriod,
      close: closeList,
      high: highList,
      low: lowList,
    });

    const avgVolume = volumeList.slice(-avgVolumePeriod).reduce((a, b) => a + b, 0) / avgVolumePeriod;
    const lastVolume = volumeList[volumeList.length - 1];
    const lastBollinger = bollinger[bollinger.length - 1];
    const lastRSI = rsi[rsi.length - 1];
    const lastADX = adx[adx.length - 1].adx;
    const prevADX = adx[adx.length - 2].adx || lastADX;
    const prevRSI = rsi[rsi.length - 2] || lastRSI;
    const lastPrice = closeList[closeList.length - 1];

    let entryPrice, stopLoss, takeProfit, orderSize, signalType;

    // BUY
    if (
      lastADX > 20
      // && lastADX > prevADX
      && lastRSI >= 60 && lastRSI <= 70
      && prevRSI <= 70
      && lastPrice > lastBollinger.upper
      && lastVolume > avgVolume
    ) {
      signalType = 'Buy';
      entryPrice = lastPrice;
      stopLoss = getStopLoss({
        array: lowList,
        type: 'low',
        reference: lastBollinger.middle,
        entryPrice
      });
      takeProfit = entryPrice + (entryPrice - stopLoss) * rewardRiskRatio;
      orderSize = getOrderSize(entryPrice, stopLoss);
    }

    // SELL
    if (
      lastADX > 20
      // && lastADX > prevADX
      && lastRSI <= 40 && lastRSI >= 30
      && prevRSI >= 30
      && lastPrice < lastBollinger.lower
      && lastVolume > avgVolume
    ) {
      signalType = 'Sell';
      entryPrice = lastPrice;
      stopLoss = getStopLoss({
        array: highList,
        type: 'high',
        reference: lastBollinger.middle,
        entryPrice
      });
      takeProfit = entryPrice - (stopLoss - entryPrice) * rewardRiskRatio;
      orderSize = getOrderSize(entryPrice, stopLoss);
    }

    printIndicators({
      lastPrice,
      lastBollinger,
      lastRSI,
      lastADX,
      lastVolume,
      prevRSI,
      prevADX,
      avgVolume,
      signalType,
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

export default bollingerBreakout;
