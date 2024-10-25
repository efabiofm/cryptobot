import Binance from '../services/binance.js';

export default async function cargarDatosHistoricos({ symbol, interval }) {
  const altos = [];
  const bajos = [];
  const cierres = [];

  const candles = await Binance.candles({ symbol, interval, limit: 50 });
  
  candles.forEach(candle => {
    altos.push(parseFloat(candle.high));
    bajos.push(parseFloat(candle.low));
    cierres.push(parseFloat(candle.close));
  });

  return {
    altos,
    bajos,
    cierres
  };
}
