import { RestClientV5, WebsocketClient } from 'bybit-api';
import get from 'lodash/get.js';

const demoTrading = process.env.DEMO_TRADING === 'true';
let Bybit;

if (demoTrading) {
  Bybit = new RestClientV5 ({
    key: process.env.BYBIT_API_KEY,
    secret: process.env.BYBIT_API_SECRET,
    demoTrading
  });
  
  const ws = new WebsocketClient({
    key: process.env.BYBIT_API_KEY,
    secret: process.env.BYBIT_API_SECRET,
    market: 'v5'
  });
  
  Bybit.ws = {
    update: function (symbol, interval, callback) {
      ws.subscribeV5(`kline.${interval}.${symbol}`, 'linear');
      ws.on('update', callback);
    }
  };
}

Bybit.getQtyPrecision = async (symbol) => {
  const response = await Bybit.getInstrumentsInfo({ category: 'linear' });
  const symbolInfo = response.result.list.find(item => item.symbol === symbol);
  const qtyStep = get(symbolInfo, 'lotSizeFilter.qtyStep');
  const precision = qtyStep.split('.')[1];
  return precision ? precision.length : 0;
};

export default Bybit;
