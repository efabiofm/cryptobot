import getSwing from './get-swing.js';

export default function getStopLoss({ array, type, entryPrice, reference }) {
  if (array.length < 2) return null;
  
  const lastSwing = getSwing(array, type);
  const swingDistance = Math.abs(entryPrice - lastSwing);
  const referenceDistance = Math.abs(entryPrice - reference);

  return swingDistance < referenceDistance ? lastSwing : reference;
}
