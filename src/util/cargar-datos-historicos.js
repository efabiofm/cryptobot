import Binance from '../services/binance.js';
import Bybit from '../services/bybit.js';

async function cargarDatosHistoricos({ symbol, interval }) {
  const altos = [];
  const bajos = [];
  const cierres = [];
  const volumenes = [];

  if (process.env.TESTNET === 'true') {
    const { result } = await Bybit.getKline({ symbol, interval, limit: 200 });
    /**
     * OHLC candle used by v5 APIs
     *
     * list[0]: startTime
     * list[1]: openPrice
     * list[2]: highPrice
     * list[3]: lowPrice
     * list[4]: closePrice
     * list[5]: volume
     * list[6]: turnover
     */
    result.list.forEach(candle => {
      altos.push(parseFloat(candle[2]));
      bajos.push(parseFloat(candle[3]));
      cierres.push(parseFloat(candle[4]));
      volumenes.push(parseFloat(candle[5]));
    });
  } else {
    const candles = await Binance.candles({ symbol, interval, limit: 200 });
    candles.forEach(candle => {
      altos.push(parseFloat(candle.high));
      bajos.push(parseFloat(candle.low));
      cierres.push(parseFloat(candle.close));
      volumenes.push(parseFloat(candle.volume));
    });
  }

  return {
    altos,
    bajos,
    cierres,
    volumenes
  };
}

export default cargarDatosHistoricos;
