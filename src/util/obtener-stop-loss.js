export default function obtenerStopLoss({ array, tipo, bollingerMiddle, cierres }) {
  const longitud = array.length;
  if (longitud < 2) return null;
  
  let ultimoSwing;
  if (tipo === 'high') {
    ultimoSwing = Math.max(...array.slice(-2));
  } else if (tipo === 'low') {
    ultimoSwing = Math.min(...array.slice(-2));
  } else {
    return null;
  }

  // Compara el último swing con la banda media de Bollinger y elige el más cercano al precio de entrada
  const cierreActual = cierres[cierres.length - 1];
  const distanciaSwing = Math.abs(cierreActual - ultimoSwing);
  const distanciaBollinger = Math.abs(cierreActual - bollingerMiddle);

  return distanciaSwing < distanciaBollinger ? ultimoSwing : bollingerMiddle;
}
