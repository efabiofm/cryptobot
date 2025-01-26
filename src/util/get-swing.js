function getSwing(array, type, currentIndex) {
   // We need at least 5 candles to get the last swing
  if (array.length < 5) return null;

  let swingValue = null;

  for (let i = currentIndex - 3; i >= 2; i--) {
    if (
      (type === 'high' && array[i] > array[i - 1] && array[i] > array[i - 2] && array[i] > array[i + 1] && array[i] > array[i + 2]) ||
      (type === 'low' && array[i] < array[i - 1] && array[i] < array[i - 2] && array[i] < array[i + 1] && array[i] < array[i + 2])
    ) {
      swingValue = array[i];
      break;
    }
  }

  const buffer = swingValue * 0;
  return type === 'high' ? swingValue + buffer : swingValue - buffer;
}

export default getSwing;
