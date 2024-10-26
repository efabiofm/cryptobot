const capitalTotal = 5000;
const riesgoPorTrade = capitalTotal * 0.01; // 1% del capital

export default function calcularCantidadInvertir(entrada, stopLoss) {
  const riesgoPorUnidad = Math.abs(entrada - stopLoss);
  const cantidad = riesgoPorTrade / riesgoPorUnidad;
  return cantidad * entrada;
}
