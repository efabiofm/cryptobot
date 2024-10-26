import PushBullet from 'pushbullet';

const pusher = new PushBullet(process.env.PUSHBULLET_TOKEN);

export default function enviarNotificacion({
  signalType,
  entryPrice,
  stopLoss,
  takeProfit,
  lotSize 
}) {
  const titulo = signalType === 'BUY' ? '📈COMPRA' : '📉VENTA';
  const mensaje = `Precio Entrada: ${entryPrice}
Stop-Loss: ${stopLoss}
Take-Profit: ${takeProfit}
Tamaño Orden: ${lotSize} USDT`;
  pusher.note(null, titulo, mensaje);
}
