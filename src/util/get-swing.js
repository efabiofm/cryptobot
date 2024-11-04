function getSwing(array, tipo) {
   // We need at least 5 candles to get the last swing
  if (array.length < 5) return null;

  let swingValue = null;

  for (let i = array.length - 3; i >= 2; i--) {
    if (
      (tipo === 'high' && array[i] > array[i - 1] && array[i] > array[i - 2] && array[i] > array[i + 1] && array[i] > array[i + 2]) ||
      (tipo === 'low' && array[i] < array[i - 1] && array[i] < array[i - 2] && array[i] < array[i + 1] && array[i] < array[i + 2])
    ) {
      swingValue = array[i];
      break;
    }
  }

  return swingValue;
}

export default getSwing;
