// lcg.js
// Implementa um LCG simples para gerar uniformes em [0,1), a partir de uma seed inteira.
class LCG {
    /**
     * @param {number} seed – inteiro de 0 até mod-1
     */
    constructor(seed) {
      // parâme­tros clássicos de LCG (32-bit)
      this.modulus = 0x80000000;           // 2^31
      this.multiplier = 1103515245;        // valor usado por glibc
      this.increment = 12345;              // também de glibc
      this.state = seed % this.modulus;
    }
  
    /**
     * Gera o próximo inteiro uniformemente distribuído entre 0 e modulus-1,
     * e atualiza o estado interno.
     * @returns {number} inteiro em [0, modulus)
     */
    nextInt() {
      this.state = (this.multiplier * this.state + this.increment) % this.modulus;
      return this.state;
    }
  
    /**
     * Retorna um número “float” pseudoaleatório em [0,1).
     * Chama nextInt() e normaliza para [0,1).
     * @returns {number}
     */
    nextFloat() {
      // nextInt() retorna inteiro em [0, modulus)
      return this.nextInt() / this.modulus;
    }
  }
  
  module.exports = LCG;
  