// simulator.js
const LCG = require("./lcg");
const exponentialRandom = require("./exp");

/**
 * Parâmetros de entrada da simulação:
 * @typedef {Object} SimulationParams
 * @property {number} seed – seed inicial para o PRNG
 * @property {number} lambda – taxa de chegadas (clientes por minuto)
 * @property {number} mu – taxa de serviço (clientes atendidos por minuto)
 * @property {number} tMax – tempo máximo de chegada (janela de geração de novos clientes) em minutos
 */

/**
 * Resultado final da simulação:
 * @typedef {Object} SimulationResult
 * @property {number} totalCustomers – total de clientes que passaram pelo sistema
 * @property {number} sumWaitTime – soma de todos os tempos na fila
 * @property {number} sumServiceTime – soma dos tempos de atendimento
 * @property {number} serverBusyTime – tempo que servidor ficou ocupado (em minutos)
 * @property {number} averageWaitTime – tempo médio de espera (minutos)
 * @property {number} averageServiceTime – tempo médio de serviço (minutos)
 * @property {number} utilization – fração do tempo em que o servidor esteve ocupado (0 a 1)
 */
class Simulator {
  constructor({ seed, lambda, mu, tMax }) {
    this.rng = new LCG(seed);
    this.lambda = lambda;
    this.mu = mu;
    this.tMax = tMax;

    // Fila de clientes (cada item é { arrivalTime, serviceStartTime, departureTime })
    this.queue = [];
    this.currentTime = 0;        // relógio de simulação
    this.serverBusy = false;     // servidor livre/inativo = false
    this.nextArrival = this.generateNextArrival(0);
    this.nextDeparture = Infinity; // enquanto não tiver ninguém sendo atendido

    // Estatísticas
    this.totalCustomers = 0;
    this.sumWaitTime = 0;
    this.sumServiceTime = 0;
    this.serverBusyTime = 0;
    this.lastEventTime = 0;      // para contabilizar busy time

    // Para saber até quando o servidor deve continuar após a janela de chegadas
    this.arrivalsStopped = false;
  }

  /**
   * Gera o tempo da próxima chegada, dado o tempo atual curTime.
   * Se a próxima chegada ultrapassar tMax, retorna Infinity (não mais chegadas).
   * @param {number} curTime – instante atual
   * @returns {number} tempo da próxima chegada
   */
  generateNextArrival(curTime) {
    // distribuído exponencial com parâmetro lambda
    const interArrival = exponentialRandom(() => this.rng.nextFloat(), this.lambda);
    const t = curTime + interArrival;
    if (t > this.tMax) {
      return Infinity; // não gerar mais chegadas
    }
    return t;
  }

  /**
   * Gera o tempo de atendimento (exponencial com parâmetro mu).
   * @returns {number}
   */
  generateServiceTime() {
    return exponentialRandom(() => this.rng.nextFloat(), this.mu);
  }

  /**
   * Executa toda a simulação.
   * Até que não hajam mais chegadas válidas E fila vazia E servidor livre.
   * @returns {SimulationResult}
   */
  run() {
    while (true) {
      // escolher próximo evento: chegada ou partida (depende de qual for menor)
      const nextEventTime = Math.min(this.nextArrival, this.nextDeparture);

      // Se não há mais chegadas nem partidas (filas vazias e arrivalsStopped), encerra
      if (
        nextEventTime === Infinity &&
        this.queue.length === 0 &&
        !this.serverBusy
      ) {
        break;
      }

      // avança relógio
      this.advanceTime(nextEventTime);

      // decide se é chegada ou partida
      if (this.nextArrival <= this.nextDeparture) {
        // --- Evento CHEGADA ---
        this.handleArrival();
      } else {
        // --- Evento PARTIDA (cliente sai do servidor) ---
        this.handleDeparture();
      }
    }

    return this.collectResults();
  }

  /**
   * Avança o relógio para newTime, atualiza estatística de busyTime.
   * @param {number} newTime
   */
  advanceTime(newTime) {
    // se o servidor estava ocupado, acumulamos o tempo desde lastEventTime até newTime
    if (this.serverBusy) {
      this.serverBusyTime += (newTime - this.lastEventTime);
    }
    this.currentTime = newTime;
    this.lastEventTime = newTime;
  }

  /**
   * Processa um evento de chegada no instante currentTime.
   */
  handleArrival() {
    // registra o cliente na fila, armazenando a hora de chegada
    this.queue.push({
      arrivalTime: this.currentTime,
      serviceStartTime: null,
      departureTime: null,
    });

    // agenda a próxima chegada (se ainda estiver dentro da janela tMax)
    this.nextArrival = this.generateNextArrival(this.currentTime);

    // se servidor estiver livre, já inicia atendimento imediato
    if (!this.serverBusy) {
      this.startService();
    }
  }

  /**
   * Inicia o atendimento do próximo cliente na fila (fila FIFO).
   * Deve ser chamado apenas quando existe pelo menos 1 cliente na fila e o servidor estava livre.
   */
  startService() {
    if (this.queue.length === 0) {
      return;
    }
    // retira da fila (FIFO)
    const client = this.queue.shift();
    client.serviceStartTime = this.currentTime;

    // gera tempo de serviço e agenda a partida
    const serviceTime = this.generateServiceTime();
    client.departureTime = this.currentTime + serviceTime;

    // marca servidor como ocupado
    this.serverBusy = true;
    this.currentCustomer = client;
    this.nextDeparture = client.departureTime;
  }

  /**
   * Processa evento de partida (conclusão de atendimento).
   * Calcula estatísticas para o cliente que saiu.
   */
  handleDeparture() {
    const client = this.currentCustomer;
    // cálculo de estatísticas individuais
    const waitTime = client.serviceStartTime - client.arrivalTime;
    const serviceTime = client.departureTime - client.serviceStartTime;

    this.sumWaitTime += waitTime;
    this.sumServiceTime += serviceTime;
    this.totalCustomers += 1;

    // libera servidor
    this.serverBusy = false;
    this.currentCustomer = null;
    this.nextDeparture = Infinity;

    // se ainda há gente na fila, inicia atendimento do próximo imediatamente
    if (this.queue.length > 0) {
      this.startService();
    }
  }

  /**
   * Reúne as métricas finais e retorna o resultado.
   */
  collectResults() {
    // Se acabaram as chegadas, mas ainda há processamento final, 
    // o loop garantiu que ele terminou. Agora calculamos:
    const averageWaitTime = this.totalCustomers > 0
      ? this.sumWaitTime / this.totalCustomers
      : 0;
    const averageServiceTime = this.totalCustomers > 0
      ? this.sumServiceTime / this.totalCustomers
      : 0;
    // Utilização = tempo ocupado / (tempo no qual o servidor poderia estar ocupado)
    // Aqui, usamos como divisor o instante em que o sistema ficou ocioso definitivo.
    // Como currentTime and lastEventTime já apontam para o instante em que tudo parou,
    // podemos usar currentTime para normalizar.
    const busyTime = this.serverBusyTime;
    const totalTime = this.currentTime; // inclui até zerar fila

    const utilization = totalTime > 0
      ? busyTime / totalTime
      : 0;

    return {
      totalCustomers: this.totalCustomers,
      sumWaitTime: this.sumWaitTime,
      sumServiceTime: this.sumServiceTime,
      serverBusyTime: busyTime,
      averageWaitTime,
      averageServiceTime,
      utilization,
    };
  }
}

module.exports = Simulator;
