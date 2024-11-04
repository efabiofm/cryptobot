import Bybit from '../services/bybit.js';

export default async function submitOrder({ qty, side, takeProfit, stopLoss }) {
  return Bybit.submitOrder({
    symbol: process.env.SYMBOL,
    category: 'linear',
    orderType: 'Market',
    marketUnit: 'quoteCoin',
    qty: String(qty),
    takeProfit,
    stopLoss,
    side,
  });
}
