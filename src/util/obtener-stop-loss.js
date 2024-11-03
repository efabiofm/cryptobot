import obtenerSwing from './obtener-swing.js';

export default function obtenerStopLoss({ array, tipo, cierreActual, valorReferencia }) {
  const longitud = array.length;
  if (longitud < 2) return null;
  
  const ultimoSwing = obtenerSwing(array, tipo);
  const distanciaSwing = Math.abs(cierreActual - ultimoSwing);
  const distanciaReferencia = Math.abs(cierreActual - valorReferencia);

  return distanciaSwing < distanciaReferencia ? ultimoSwing : valorReferencia;
}
