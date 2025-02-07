import binance from '../services/binance.js';
import ti from 'technicalindicators';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

// Función para obtener todas las velas históricas
async function getAllHistoricalCandles(symbol, interval, startTime, endTime, limit = 1000) {
  let allCandles = [];
  let fetchedCandles;
  let currentStartTime = startTime;

  do {
    fetchedCandles = await binance.candles({
      symbol,
      interval,
      startTime: currentStartTime,
      endTime,
      limit,
    });

    if (fetchedCandles.length > 0) {
      allCandles = allCandles.concat(fetchedCandles);
      // Actualizar 'startTime' al timestamp de la última vela + 1 ms para evitar solapamientos
      currentStartTime = fetchedCandles[fetchedCandles.length - 1].openTime + 1;
    }
  } while (fetchedCandles.length === limit && currentStartTime < endTime);

  // Formatear los datos
  return allCandles.map(candle => ({
    timestamp: candle.openTime,
    open: parseFloat(candle.open),
    high: parseFloat(candle.high),
    low: parseFloat(candle.low),
    close: parseFloat(candle.close),
    volume: parseFloat(candle.volume),
  }));
}

// Función para calcular indicadores
function calculateIndicators(candles) {
  const closePrices = candles.map(c => c.close);
  const highPrices = candles.map(c => c.high);
  const lowPrices = candles.map(c => c.low);
  const volume = candles.map(c => c.volume);

  const emaTrend = ti.EMA.calculate({ period: 50, values: closePrices });
  const rsi = ti.RSI.calculate({ period: 3, values: closePrices });

  const adx = ti.ADX.calculate({
    period: 5,
    close: closePrices,
    high: highPrices,
    low: lowPrices,
  });
  return {
    rsi,
    volume,
    emaTrend,
    adx,
  };
}

// Función para generar señales
function generateSignal(
  currentIndex,
  indicators,
  currentCandle
) {
  const { emaTrend, rsi, adx, volume } = indicators;

  const currentEMATrend = emaTrend[currentIndex];
  const currentRSI = rsi[currentIndex];
  const previousRSI = rsi[currentIndex - 1];
  const currentVolume = volume[currentIndex];

  // const currentBollinger = bollinger[currentIndex];
  const currentADX = adx[currentIndex].adx;

  // Detectar cruce alcista (BUY)
  if (
    previousRSI < 20 && currentRSI > 20
    && currentCandle.close > currentEMATrend
    && currentADX > 30
    // && currentVolume > averageVolume(volume)
  ) {
    return 'BUY';
  }

  // Detectar cruce bajista (SELL)
  if (
    previousRSI > 80 && currentRSI < 80
    && currentCandle.close > currentEMATrend
    && currentADX > 30
    // && currentVolume > averageVolume(volume)
  ) {
    return 'SELL';
  }

  return null;
}

function averageVolume(volume) {
  const sum = volume.reduce((acc, val) => acc + val, 0);
  return sum / volume.length;
}

// Función para simular el backtest
// Función para simular el backtest con nueva gestión de riesgo
function backtest(candles, indicators, initialBalance) {
  let balance = initialBalance; // Capital inicial en USDT
  let position = null; // 'BUY' o 'SELL'
  let entryPrice = 0;
  let stopLossPrice = 0;
  let takeProfitPrice = 0;
  let positionSize = 0; // Tamaño de la posición en USDT

  const tradeLog = [];
  const commissionRate = 0.0000; // 0.05% comisión por operación
  const stopLossDistance = 0.001; // 1% del precio de entrada
  const rewardRiskRatio = 2;
  const riskPercentage = 0.01;

  for (let i = 1; i < candles.length; i++) { // Iniciar en 1 para tener una vela anterior
    const candle = candles[i];
    const signal = generateSignal(i, indicators, candle);
    const riskPerTrade = balance * riskPercentage; // 1% del balance

    if (signal && !position) {
      entryPrice = candle.close;

      // Definir el tamaño de la posición: arriesgar el 1% del balance
      // Primero, calcular el precio de stop-loss
      if (signal === 'BUY') {
        stopLossPrice = candle.low * (1 - stopLossDistance);
        takeProfitPrice = entryPrice + (entryPrice - stopLossPrice) * rewardRiskRatio;
      } else if (signal === 'SELL') {
        stopLossPrice = candle.high * (1 + stopLossDistance);
        takeProfitPrice = entryPrice - (stopLossPrice - entryPrice) * rewardRiskRatio;
      }

      const priceDifference = Math.abs(candle.close - stopLossPrice);
      positionSize = (riskPerTrade / priceDifference) * candle.close;

      // Aplicar comisión al entrar
      const entryCommission = positionSize * commissionRate;
      balance -= entryCommission;

      // Registrar la entrada
      position = signal;

      tradeLog.push({
        type: 'ENTER',
        position,
        price: entryPrice.toFixed(2),
        stopLoss: stopLossPrice.toFixed(2),
        takeProfit: takeProfitPrice.toFixed(2),
        positionSize: positionSize.toFixed(4),
        commission: entryCommission.toFixed(4),
        timestamp: candle.timestamp,
        balance: balance.toFixed(2),
      });
    }

    else if (position) {
      let exit = false;
      let result = '';
      let exitPrice = candle.close;
      let profitLoss = 0;

      if (position === 'BUY') {
        if (candle.high >= takeProfitPrice && candle.low <= stopLossPrice) {
          // Determinar cuál fue alcanzado primero basado en la apertura
          const distanceToTP = Math.abs(candle.open - takeProfitPrice);
          const distanceToSL = Math.abs(candle.open - stopLossPrice);

          if (distanceToTP < distanceToSL) {
            exitPrice = takeProfitPrice;
            result = 'TP';
          } else {
            exitPrice = stopLossPrice;
            result = 'SL';
          }
        } else if (candle.high >= takeProfitPrice) {
          exitPrice = takeProfitPrice;
          result = 'TP';
        } else if (candle.low <= stopLossPrice) {
          exitPrice = stopLossPrice;
          result = 'SL';
        }
      }

      if (position === 'SELL') {
        if (candle.low <= takeProfitPrice && candle.high >= stopLossPrice) {
          // Determinar cuál fue alcanzado primero basado en la apertura
          const distanceToTP = Math.abs(candle.open - takeProfitPrice);
          const distanceToSL = Math.abs(candle.open - stopLossPrice);

          if (distanceToTP < distanceToSL) {
            exitPrice = takeProfitPrice;
            result = 'TP';
          } else {
            exitPrice = stopLossPrice;
            result = 'SL';
          }
        } else if (candle.low <= takeProfitPrice) {
          exitPrice = takeProfitPrice;
          result = 'TP';
        } else if (candle.high >= stopLossPrice) {
          exitPrice = stopLossPrice;
          result = 'SL';
        }
      }

      if (result) {
        profitLoss = Math.abs((positionSize / exitPrice) - (positionSize / entryPrice)) * exitPrice;
        if (result === 'TP') {
          balance += profitLoss;
        }
        if (result === 'SL') {
          balance -= profitLoss;
        }
        exit = true;
      }

      if (exit) {
        // Aplicar comisión al salir
        const exitCommission = positionSize * commissionRate;
        balance -= exitCommission;

        // Registrar la salida
        tradeLog.push({
          type: 'EXIT',
          position,
          price: exitPrice.toFixed(2),
          result,
          profitLoss: profitLoss.toFixed(4),
          commission: exitCommission.toFixed(4),
          timestamp: candle.timestamp,
          balance: balance.toFixed(2),
        });

        // Resetear posición
        position = null;
        entryPrice = 0;
        stopLossPrice = 0;
        takeProfitPrice = 0;
        positionSize = 0;
      }
    }
  }

  const tpTrades = tradeLog.filter(trade => trade.result === 'TP');
  const slTrades = tradeLog.filter(trade => trade.result === 'SL');

  return {
    finalBalance: balance,
    trades: tradeLog,
    tpTrades,
    slTrades
  };
}

function calculatePerformanceMetrics(trades, initialBalance, finalBalance) {
  let totalProfit = 0;
  let totalLoss = 0;
  let maxDrawdown = 0;
  let peak = initialBalance;

  trades.forEach(trade => {
    if (trade.type === 'EXIT') {
      if (trade.result === 'TP') {
        totalProfit += parseFloat(trade.profitLoss);
      } else if (trade.result === 'SL') {
        totalLoss += parseFloat(trade.profitLoss);
      }

      // Actualizar peak y drawdown
      if (parseFloat(trade.balance) > peak) {
        peak = parseFloat(trade.balance);
      }
      const drawdown = peak - parseFloat(trade.balance);
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  });

  const winRate = (trades.filter(trade => trade.type === 'EXIT' && trade.result === 'TP').length / trades.filter(trade => trade.type === 'EXIT').length) * 100;
  const netProfit = finalBalance - initialBalance;
  const roi = (netProfit / initialBalance) * 100;

  return {
    netProfit: netProfit.toFixed(2),
    winRate: winRate.toFixed(2),
    roi: roi.toFixed(2) + '%'
  };
}

// Función para guardar datos en un archivo JSON
async function saveDataToJSON(data, filename) {
  try {
    const jsonData = JSON.stringify(data, null, 2); // Formato legible
    const filePath = path.join(process.cwd(), filename);
    await fs.writeFileSync(filePath, jsonData, 'utf8');
    console.log(`Datos guardados exitosamente en ${filename}`);
  } catch (error) {
    console.error('Error al guardar los datos en JSON:', error);
  }
}

// Función para cargar datos desde un archivo JSON
async function loadDataFromJSON(filename) {
  try {
    const filePath = path.join(process.cwd(), filename);
    const data = await fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al cargar los datos desde JSON.');
    return null;
  }
}

// Función para guardar las operaciones en un archivo CSV
async function saveTradesToCSV(trades, filename) {
  try {
    const csvWriter = createObjectCsvWriter ({
      path: path.resolve(process.cwd(), filename),
      header: [
        { id: 'type', title: 'Type' },
        { id: 'position', title: 'Position' },
        { id: 'positionSize', title: 'Position Size' },
        { id: 'price', title: 'Price' },
        { id: 'takeProfit', title: 'Take-Profit' },
        { id: 'stopLoss', title: 'Stop-Loss' },
        { id: 'commission', title: 'Commission' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'result', title: 'Result' },
        { id: 'profit', title: 'Profit' },
        { id: 'balance', title: 'Balance' },
      ],
      append: false,
    });

    const records = trades.map(trade => ({
      type: trade.type,
      position: trade.position || '',
      price: trade.price,
      positionSize: trade.positionSize,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      commission: trade.commission,
      timestamp: new Date(trade.timestamp).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' }),
      result: trade.result || '',
      profit: trade.profitLoss,
      balance: trade.balance,
    }));

    await csvWriter.writeRecords(records);
    console.log(`Operaciones guardadas exitosamente en ${filename}`);
  } catch (error) {
    console.error('Error al guardar las operaciones en el archivo CSV:', error);
  }
}

// Ejecutar el backtest completo
const symbol = 'BTCUSDT';
const start = new Date('2024-01-01T00:00:00Z').getTime(); // Fecha de inicio en ms
const end = new Date('2024-06-31T23:59:59Z').getTime(); // Fecha de fin en ms
const dataFilename = 'historical-data-btc-5m-2024.json';
const storeResults = true;

async function getCandlesFromBinanceOrFile(symbol, interval, start, end, dataFilename) {
  let response = [];
  try {
    // Intentar cargar los datos desde el archivo JSON
    response = await loadDataFromJSON(dataFilename);
  
    if (response) {
      console.log(`Datos cargados desde ${dataFilename}`);
      return response;
    } else {
      throw new Error('No se pudieron cargar los datos desde el JSON.');
    }
  } catch {
    // Si falla, obtener los datos desde la API y guardarlos
    console.log('Obteniendo datos desde la API de Binance...');
    response = await getAllHistoricalCandles(symbol, interval, start, end);
    await saveDataToJSON(response, dataFilename);
    return response;
  }
}

// Verificar si el archivo JSON existe y cargar la data
let candles = await getCandlesFromBinanceOrFile(symbol, '5m', start, end, dataFilename);

console.log(`Total de velas obtenidas: ${candles.length}`);

function sliceCandles(candles, indicators) {
  const lengths = Object.keys(indicators).map(key => (indicators[key].length));
  const smallest = Math.min(...lengths);

  // Alinear todos los arrays de datos
  Object.keys(indicators).forEach((key) => {
    const sliceValue = indicators[key].length - smallest;
    indicators[key] = indicators[key].slice(sliceValue);
    // console.log(`${key}: `, indicators[key].length);
  });

  return candles.slice(candles.length - smallest);
}

// Calcular indicadores
const indicators = calculateIndicators(candles);

candles = sliceCandles(candles, indicators);

// Ejecutar backtest
const initialBalance = 5000;
const result = backtest(candles, indicators, initialBalance);
const performance = calculatePerformanceMetrics(result.trades, initialBalance, result.finalBalance);

console.log('-------------------------');
console.log(`Balance final: $${result.finalBalance.toFixed(2)}`);
console.log(`Beneficio Neto: $${performance.netProfit}`);
console.log(`Operaciones TP: ${result.tpTrades.length}`);
console.log(`Operaciones SL: ${result.slTrades.length}`);
console.log(`Tasa de Ganancias: ${performance.winRate}%`);
console.log(`Total de operaciones: ${result.trades.length}`);
console.log(`Rendimiento total: ${performance.roi}`);
console.log('-------------------------');

// Guardar las operaciones en un archivo CSV
if (storeResults) {
  await saveTradesToCSV(result.trades, 'trade-log.csv');
}
