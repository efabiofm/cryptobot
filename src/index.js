import Binance from './services/binance.js';
import Bybit from './services/bybit.js';
import get from 'lodash/get.js';
import * as strategies from './strategies/index.js';
import * as util from './util/index.js';
import './services/express.js';

const symbol = process.env.SYMBOL;
const interval = process.env.INTERVAL;
const strategy = strategies[process.env.STRATEGY];

const data = await util.getDataHistory({ symbol, interval });
const { highList, lowList, closeList, volumeList } = data;

const watchCandles = process.env.TESTNET === 'true' ? Bybit.ws.update : Binance.ws.candles;

watchCandles(symbol, interval, (value) => {
  const candle = get(value, 'data[0]', value);
  if (candle.isFinal || candle.confirm) {
    highList.push(parseFloat(candle.high));
    lowList.push(parseFloat(candle.low));
    closeList.push(parseFloat(candle.close));
    volumeList.push(parseFloat(candle.volume));

    const result = strategy({ closeList, highList, lowList, volumeList });

    if (result) {
      util.sendNotification(result);
    }
  }
});
