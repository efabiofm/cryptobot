import TI from 'technicalindicators';

const periodoRSI = 14;
const periodoADX = 14;
const configuracionBollinger = { period: 20, stdDev: 2 };

export default function calcularIndicadores({ cierres, altos, bajos }) {
  if (cierres.length >= 20) { // Se asegura que tenemos suficiente data
    // Calcular Bandas de Bollinger
    const bollinger = TI.BollingerBands.calculate({
      period: configuracionBollinger.period,
      values: cierres,
      stdDev: configuracionBollinger.stdDev,
    });

    // Calcular RSI
    const rsi = TI.RSI.calculate({
      period: periodoRSI,
      values: cierres,
    });

    // Calcular ADX
    const adx = TI.ADX.calculate({
      period: periodoADX,
      close: cierres,
      high: altos,
      low: bajos,
    });

    // Obtener los valores actuales
    const ultimaBollinger = bollinger[bollinger.length - 1];
    const ultimoRSI = rsi[rsi.length - 1];
    const ultimoADX = adx[adx.length - 1];

    return {
      closePrice: cierres[cierres.length - 1],
      bollingerBands: ultimaBollinger,
      rsi: ultimoRSI,
      adx: ultimoADX.adx
    };
  }
}
