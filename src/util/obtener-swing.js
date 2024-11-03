// Función para encontrar el último swing alto o bajo en un rango de velas
function obtenerSwing(array, tipo) {
  const longitud = array.length;
  if (longitud < 5) return null; // Necesitamos al menos 5 velas para detectar un swing

  let swingValue = null;

  // Recorre las velas en busca de un swing high o swing low
  for (let i = longitud - 3; i >= 2; i--) {
    if (
      (tipo === 'high' && array[i] > array[i - 1] && array[i] > array[i - 2] && array[i] > array[i + 1] && array[i] > array[i + 2]) ||
      (tipo === 'low' && array[i] < array[i - 1] && array[i] < array[i - 2] && array[i] < array[i + 1] && array[i] < array[i + 2])
    ) {
      swingValue = array[i];
      break; // Encuentra el último swing y termina el bucle
    }
  }

  return swingValue;
}

export default obtenerSwing;
