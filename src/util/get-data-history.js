import Binance from '../services/binance.js';
import Bybit from '../services/bybit.js';

async function getDataHistory({ symbol, interval }) {
  const lowList = [];
  const highList = [];
  const closeList = [];
  const volumeList = [];

  if (process.env.TESTNET === 'true') {
    const { result } = await Bybit.getKline({ symbol, interval, limit: 200 });
    /**
     * OHLC candle used by v5 APIs
     *
     * list[0]: startTime
     * list[1]: openPrice
     * list[2]: highPrice
     * list[3]: lowPrice
     * list[4]: closePrice
     * list[5]: volume
     * list[6]: turnover
     */
    result.list.forEach(candle => {
      lowList.push(parseFloat(candle[2]));
      highList.push(parseFloat(candle[3]));
      closeList.push(parseFloat(candle[4]));
      volumeList.push(parseFloat(candle[5]));
    });
  } else {
    const candles = await Binance.candles({ symbol, interval, limit: 200 });
    candles.forEach(candle => {
      lowList.push(parseFloat(candle.high));
      highList.push(parseFloat(candle.low));
      closeList.push(parseFloat(candle.close));
      volumeList.push(parseFloat(candle.volume));
    });
  }

  return {
    lowList,
    highList,
    closeList,
    volumeList
  };
}

export default getDataHistory;
