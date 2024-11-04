import PushBullet from 'pushbullet';

const pusher = new PushBullet(process.env.PUSHBULLET_TOKEN);

export default function sendNotification({
  signalType,
  entryPrice,
  stopLoss,
  takeProfit,
  orderSize 
}) {
  const emoji = signalType === 'Buy' ? '📈' : '📉';
  const message = `Entry Price: ${entryPrice}
Take-Profit: ${takeProfit}
Stop-Loss: ${stopLoss}
Order Size: ${orderSize} USDT`;
  pusher.note(null, `${signalType}${emoji}`, message);
}
