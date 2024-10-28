const capitalTotal = +process.env.TOTAL_CAPITAL || 5000;
const riesgoPorTrade = capitalTotal * (+process.env.RISK_PCT || 0.01);

export default function calcularCantidadInvertir(entrada, stopLoss) {
  const riesgoPorUnidad = Math.abs(entrada - stopLoss);
  const cantidad = riesgoPorTrade / riesgoPorUnidad;
  return cantidad * entrada;
}
