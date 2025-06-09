// exp.js
/**
 * Retorna um valor aleatório seguindo distribuição exponencial
 * com taxa λ (lambda > 0), usando uma função que gera uniformes em [0,1).
 *
 * @param {Function} uniformFunc – função que retorna um U~Uniform(0,1)
 * @param {number} lambda – taxa da exponencial (clientes por minuto, por exemplo)
 * @returns {number} tempo exponencial em minuto (pode ser fracionado)
 */
export function exponentialRandom(uniformFunc, lambda) {
    if (lambda <= 0) {
      throw new Error("Lambda deve ser > 0");
    }
    const u = uniformFunc();
    return -Math.log(1 - u) / lambda; // 1-u por segurança, mas u já em (0,1)
  }
  