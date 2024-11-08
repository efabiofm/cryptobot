import getSwing from './get-swing.js';

export default function getStopLoss({ array, type, entryPrice, reference }) {
  if (array.length < 2) return null;

  function chooseValue(value) {
    let stopMin, stopMax;
    const pctMin = entryPrice * 0.0015;
    const pctMax = entryPrice * 0.0033;

    if (type === 'high') {
      stopMin = entryPrice + pctMin;
      stopMax = entryPrice + pctMax;
      if (value < stopMin) return stopMin;
      if (value > stopMax) return stopMax;
    }
    if (type === 'low') {
      stopMin = entryPrice - pctMin;
      stopMax = entryPrice - pctMax;
      if (value > stopMin) return stopMin;
      if (value < stopMax) return stopMax;
    }
    return value;
  }
  
  const lastSwing = getSwing(array, type);

  if (reference) {
    const swingDistance = Math.abs(entryPrice - lastSwing);
    const referenceDistance = Math.abs(entryPrice - reference);
    const result = swingDistance < referenceDistance ? lastSwing : reference;
    return chooseValue(result);
  }

  return chooseValue(lastSwing);
}
