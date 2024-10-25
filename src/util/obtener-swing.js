export default function obtenerSwing(array, tipo) {
  const longitud = array.length;
  if (longitud < 2) return null;
  
  if (tipo === 'high') {
    return Math.max(...array.slice(-2));
  } else if (tipo === 'low') {
    return Math.min(...array.slice(-2));
  }
  return null;
}
