import Bybit from '../services/bybit.js';

export default async function submitOrder({ orderSize, entryPrice, signalType, takeProfit, stopLoss }) {
  const orderParams = {
    symbol: process.env.SYMBOL,
    category: 'linear',
    orderType: 'Market',
    qty: (orderSize / entryPrice).toFixed(),
    takeProfit: takeProfit.toFixed(),
    stopLoss: stopLoss.toFixed(),
    side: signalType,
  };
  console.log('entry:', entryPrice);
  console.log(orderParams);
  return Bybit.submitOrder(orderParams);
}
