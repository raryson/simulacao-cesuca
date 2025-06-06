// index.js
const Simulator = require("./simulator");

// --- Parâmetros de simulação ---

// 1) Seed para o gerador de aleatórios.
//    Troque este valor para obter sequências diferentes.
const seed = 54321;

// 2) Taxa de chegadas λ (clientes por minuto).
//    Exemplo: λ = 1/5 →, em média, um cliente a cada 5 minutos.
const lambda = 1 / 5;

// 3) Taxa de serviço μ (clientes por minuto).
//    Exemplo: μ = 1/4 →, em média, atendimento leva 4 minutos.
const mu = 1 / 4;

// 4) Tempo máximo de chegada (janela de geração de clientes), em minutos.
//    No caso, 480 min = 8 horas.
const tMax = 480;

const sim = new Simulator({ seed, lambda, mu, tMax });
const result = sim.run();

// Impressão dos resultados
console.log("=== Resultados da Simulação ===");
console.log(`Total de clientes atendidos: ${result.totalCustomers}`);
console.log(`Tempo médio de espera na fila: ${result.averageWaitTime.toFixed(4)} min`);
console.log(`Tempo médio de serviço:      ${result.averageServiceTime.toFixed(4)} min`);
console.log(`Utilização do servidor:      ${(result.utilization * 100).toFixed(2)} %`);
console.log(`Tempo total de simulação:    ${sim.currentTime.toFixed(4)} min`);
