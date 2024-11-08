import binance from '../services/binance.js';
import technicalIndicators from 'technicalindicators';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

// Función para obtener todas las velas históricas
async function getAllHistoricalCandles(symbol, interval, startTime, limit = 1000) {
  let allCandles = [];
  let fetchedCandles;
  let currentStartTime = startTime;

  do {
    fetchedCandles = await binance.candles({
      symbol,
      interval,
      startTime: currentStartTime,
      limit,
    });

    if (fetchedCandles.length > 0) {
      allCandles = allCandles.concat(fetchedCandles);
      // Actualizar 'startTime' al timestamp de la última vela + 1 ms para evitar solapamientos
      currentStartTime = fetchedCandles[fetchedCandles.length - 1].openTime + 1;
    }
  } while (fetchedCandles.length === limit);

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
  const volume = candles.map(c => c.volume);

  const ema9 = technicalIndicators.EMA.calculate({ period: 9, values: closePrices });
  const ema21 = technicalIndicators.EMA.calculate({ period: 21, values: closePrices });
  const rsi = technicalIndicators.RSI.calculate({ period: 14, values: closePrices });

  return { ema9, ema21, rsi, volume };
}

// Función para generar señales
function generateSignal(currentIndex, indicators) {
  const { ema9, ema21, rsi, volume } = indicators;

  // Asegurarse de que hay suficientes datos
  if (ema9.length < 2 || ema21.length < 2 || rsi.length < 2) return null;

  const previousEMA9 = ema9[ema9.length - 2];
  const previousEMA21 = ema21[ema21.length - 2];
  const currentEMA9 = ema9[ema9.length - 1];
  const currentEMA21 = ema21[ema21.length - 1];
  const currentRSI = rsi[rsi.length - 1];
  const currentVolume = volume[volume.length - 1];

  // Detectar cruce alcista (BUY)
  const bullishCross = previousEMA9 <= previousEMA21 && currentEMA9 > currentEMA21;
  if (bullishCross && currentRSI < 70 && currentVolume > averageVolume(volume)) {
    return 'BUY';
  }

  // Detectar cruce bajista (SELL)
  const bearishCross = previousEMA9 >= previousEMA21 && currentEMA9 < currentEMA21;
  if (bearishCross && currentRSI > 30 && currentVolume > averageVolume(volume)) {
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
function backtest(candles, indicators) {
  let balance = 5000; // Capital inicial en USDT
  let position = null; // 'BUY' o 'SELL'
  let entryPrice = 0;
  let stopLossPrice = 0;
  let takeProfitPrice = 0;
  let positionSize = 0; // Tamaño de la posición en USDT
  const tradeLog = [];
  const commissionRate = 0.0005; // 0.05% comisión por operación
  const stopLossDistance = 0.0033; // 0.33% del precio de entrada
  const rewardRiskRatio = 1.5;
  const riskPct = 0.02;

  for (let i = 1; i < candles.length; i++) { // Iniciar en 1 para tener una vela anterior
    const candle = candles[i];
    const currentIndicators = {
      ema9: indicators.ema9.slice(0, i + 1),
      ema21: indicators.ema21.slice(0, i + 1),
      rsi: indicators.rsi.slice(0, i + 1),
      volume: indicators.volume.slice(0, i + 1),
    };

    const signal = generateSignal(i, currentIndicators);
    const riskPerTrade = balance * riskPct; // 1% del balance

    if (signal && !position) {
      // Definir el tamaño de la posición: arriesgar el 1% del balance
      // Primero, calcular el precio de stop-loss
      if (signal === 'BUY') {
        stopLossPrice = candle.close * (1 - stopLossDistance);
        takeProfitPrice = candle.close * (1 + stopLossDistance * rewardRiskRatio);
      } else if (signal === 'SELL') {
        stopLossPrice = candle.close * (1 + stopLossDistance);
        takeProfitPrice = candle.close * (1 - stopLossDistance * rewardRiskRatio);
      }

      const priceDifference = Math.abs(candle.close - stopLossPrice);
      positionSize = (riskPerTrade / priceDifference) * candle.close;

      // Aplicar comisión al entrar
      const entryCommission = positionSize * commissionRate;
      balance -= entryCommission;

      // Registrar la entrada
      position = signal;
      entryPrice = candle.close;

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

      // console.log(`ENTER: ${position} at ${entryPrice}, Position Size: ${positionSize.toFixed(2)}, Commission: ${entryCommission.toFixed(2)}, New Balance: ${balance.toFixed(2)}`);
    }

    if (position) {
      let exit = false;
      let result = '';
      let exitPrice = candle.close;
      let profitLoss = 0;

      if (position === 'BUY') {
        if (candle.close >= takeProfitPrice) { // Take Profit
          profitLoss = riskPerTrade * rewardRiskRatio;
          balance += profitLoss;
          result = 'TP';
          exit = true;
        } else if (candle.close <= stopLossPrice) { // Stop Loss
          profitLoss = riskPerTrade;
          balance -= profitLoss;
          result = 'SL';
          exit = true;
        }
      }

      if (position === 'SELL') {
        if (candle.close <= takeProfitPrice) { // Take Profit
          profitLoss = riskPerTrade * rewardRiskRatio;
          balance += profitLoss;
          result = 'TP';
          exit = true;
        } else if (candle.close >= stopLossPrice) { // Stop Loss
          profitLoss = riskPerTrade;
          balance -= profitLoss;
          result = 'SL';
          exit = true;
        }
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

        // console.log(`EXIT: ${position} at ${exitPrice}, Profit/Loss: ${profitLoss.toFixed(2)}, Commission: ${exitCommission.toFixed(2)}, Result: ${result}, New Balance: ${balance.toFixed(2)}`);

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

function calculatePerformanceMetrics(trades, initialBalance) {
  let totalProfit = 0;
  let totalLoss = 0;
  let maxDrawdown = 0;
  let peak = initialBalance;

  trades.forEach(trade => {
    if (trade.type === 'EXIT') {
      if (trade.result === 'TP') {
        totalProfit += parseFloat(trade.profitLoss);
      } else if (trade.result === 'SL') {
        totalLoss += Math.abs(parseFloat(trade.profitLoss));
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
  const netProfit = totalProfit - totalLoss;

  return {
    totalProfit: totalProfit.toFixed(2),
    totalLoss: totalLoss.toFixed(2),
    netProfit: netProfit.toFixed(2),
    winRate: winRate.toFixed(2),
    maxDrawdown: maxDrawdown.toFixed(2)
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
    console.error('Error al cargar los datos desde JSON:', error);
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
        { id: 'price', title: 'Price' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'result', title: 'Result' },
        { id: 'balance', title: 'Balance' },
      ],
      append: false,
    });

    const records = trades.map(trade => ({
      type: trade.type,
      position: trade.position || '',
      price: trade.price,
      timestamp: new Date(trade.timestamp).toISOString(),
      result: trade.result || '',
      balance: trade.balance,
    }));

    await csvWriter.writeRecords(records);
    console.log(`Operaciones guardadas exitosamente en ${filename}`);
  } catch (error) {
    console.error('Error al guardar las operaciones en el archivo CSV:', error);
  }
}

// Ejecutar el backtest completo
const symbol = 'ETHUSDT';
const interval = '15m';
const since = new Date('2024-01-01T00:00:00Z').getTime(); // Fecha de inicio en ms
const dataFilename = 'historical-data.json';

// Verificar si el archivo JSON existe y cargar la data
let candles;
try {
  // Intentar cargar los datos desde el archivo JSON
  candles = await loadDataFromJSON(dataFilename);
  if (candles) {
    console.log(`Datos cargados desde ${dataFilename}`);
  } else {
    throw new Error('No se pudieron cargar los datos desde el JSON.');
  }
} catch {
  // Si falla, obtener los datos desde la API y guardarlos
  console.log('Obteniendo datos desde la API de Binance...');
  candles = await getAllHistoricalCandles(symbol, interval, since);
  await saveDataToJSON(candles, dataFilename);
}

console.log(`Total de velas obtenidas: ${candles.length}`);

// Calcular indicadores
const indicators = calculateIndicators(candles);

// Ejecutar backtest
const result = backtest(candles, indicators);

console.log(`Balance final: $${result.finalBalance.toFixed(2)}`);
console.log(`Número de operaciones: ${result.trades.length}`);
console.log(`Operaciones TP: ${result.tpTrades.length}`);
console.log(`Operaciones SL: ${result.slTrades.length}`);

// Guardar las operaciones en un archivo CSV
// await saveTradesToCSV(result.trades, 'trade-log.csv');
