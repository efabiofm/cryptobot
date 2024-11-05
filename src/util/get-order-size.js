const accBalance = +process.env.ACC_BALANCE || 5000;
const riskPerTrade = accBalance * (+process.env.RISK_PCT || 0.01);

export default function getOrderSize(entryPrice, stopLoss) {
  const riskPerUnit = Math.abs(entryPrice - stopLoss);
  const qty = riskPerTrade / riskPerUnit;
  return qty * entryPrice;
}
