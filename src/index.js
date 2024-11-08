import Binance from './services/binance.js';
import Bybit from './services/bybit.js';
import get from 'lodash/get.js';
import * as strategies from './strategies/index.js';
import * as util from './util/index.js';
import './services/express.js';

const symbol = process.env.SYMBOL;
const interval = process.env.INTERVAL;
const demoTrading = process.env.DEMO_TRADING === 'true';
const strategy = strategies[process.env.STRATEGY];

const data = await util.getDataHistory({ symbol, interval });
const { highList, lowList, closeList, volumeList } = data;

let watchCandles, qtyPrecision;

if (demoTrading) {
  watchCandles = Bybit.ws.update;
  qtyPrecision = await Bybit.getQtyPrecision(symbol);
} else {
  watchCandles = Binance.ws.candles;
}

watchCandles(symbol, interval, async (value) => {
  const candle = get(value, 'data[0]', value);
  if (candle.isFinal || candle.confirm) {
    highList.push(parseFloat(candle.high));
    lowList.push(parseFloat(candle.low));
    closeList.push(parseFloat(candle.close));
    volumeList.push(parseFloat(candle.volume));

    const result = strategy({ closeList, highList, lowList, volumeList });

    if (!result) return;    
    if (demoTrading) {
      const response = await util.submitOrder(result, qtyPrecision);
      console.log(response);
    }
    util.sendNotification(result);
  }
});
