import calcularIndicadores from './calcular-indicadores.js';
import verificarCondiciones from './verificar-condiciones.js';

function bollingerBreakout(data) {
  const indicadores = calcularIndicadores(data);
  return verificarCondiciones({ ...data, ...indicadores });
}

export default bollingerBreakout;
