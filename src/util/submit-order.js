import Bybit from '../services/bybit.js';

export default async function submitOrder({ orderSize, entryPrice, signalType, takeProfit, stopLoss }) {
  const orderParams = {
    symbol: process.env.SYMBOL,
    category: 'linear',
    orderType: 'Market',
    qty: (orderSize / entryPrice).toFixed(3),
    takeProfit: takeProfit.toFixed(3),
    stopLoss: stopLoss.toFixed(3),
    side: signalType,
  };
  return Bybit.submitOrder(orderParams);
}
