import TI from 'technicalindicators';

const periodoRSI = 14;
const periodoADX = 14;
const periodoVolumenPromedio = 20;
const configuracionBollinger = { period: 20, stdDev: 2 };

export default function calcularIndicadores({ cierres, altos, bajos, volumenes }) {
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
    const volumenPromedio = volumenes.slice(-periodoVolumenPromedio).reduce((a, b) => a + b, 0) / periodoVolumenPromedio;
    const volumenActual = volumenes[volumenes.length - 1];
    const ultimaBollinger = bollinger[bollinger.length - 1];
    const ultimoRSI = rsi[rsi.length - 1];
    const ultimoADX = adx[adx.length - 1];
    const adxAnterior = adx[adx.length - 2] || ultimoADX;
    const rsiAnterior = rsi[adx.length - 2] || ultimoRSI;

    return {
      precioCierre: cierres[cierres.length - 1],
      ultimaBollinger,
      ultimoRSI,
      ultimoADX: ultimoADX.adx,
      adxAnterior: adxAnterior.adx,
      rsiAnterior,
      volumenActual,
      volumenPromedio
    };
  }
}
