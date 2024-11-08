import Bybit from '../services/bybit.js';

export default async function submitOrder({
  orderSize,
  entryPrice,
  signalType,
  takeProfit,
  stopLoss
}, qtyPrecision) {
  const qty = (orderSize / entryPrice).toFixed(qtyPrecision);
  const orderParams = {
    symbol: process.env.SYMBOL,
    category: 'linear',
    orderType: 'Limit',
    qty,
    price: entryPrice.toFixed(qtyPrecision),
    takeProfit: takeProfit.toFixed(qtyPrecision),
    stopLoss: stopLoss.toFixed(qtyPrecision),
    side: signalType,
  };
  return Bybit.submitOrder(orderParams);
}
