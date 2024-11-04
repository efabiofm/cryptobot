import { RestClientV5, WebsocketClient   } from 'bybit-api';

const testnet = process.env.TESTNET === 'true';
let Bybit;

if (testnet) {
  Bybit = new RestClientV5 ({
    key: process.env.BYBIT_API_KEY,
    secret: process.env.BYBIT_API_SECRET,
    testnet
  });
  
  const ws = new WebsocketClient({
    key: process.env.BYBIT_API_KEY,
    secret: process.env.BYBIT_API_SECRET,
    testnet,
    market: 'v5'
  });
  
  Bybit.ws = {
    update: function (symbol, interval, callback) {
      ws.subscribeV5(`kline.${interval}.${symbol}`, 'linear');
      ws.on('update', callback);
    }
  };
}

export default Bybit;
