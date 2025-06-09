import Simulator from "./simulator.js"
import readline from "node:readline/promises"
import { stdin, stdout } from "node:process"

const r1 = readline.createInterface({
    input: stdin,
    output: stdout,
});

// --- Parâmetros de simulação ---

// 1) Seed para o gerador de aleatórios.
//    Troque este valor para obter sequências diferentes.

const typedSeed = await r1.question("Qual o seed desejado\n")
const seed = Number(typedSeed)

const typedLambda = await r1.question("A cada quantos minutos chega um cliente?\n")
const parsedLambda = Number(typedLambda)

// 2) Taxa de chegadas λ (clientes por minuto).
//    Exemplo: λ = 1/5 →, em média, um cliente a cada 5 minutos.
const lambda = 1/parsedLambda;

const typedQueue = await r1.question("A cada quantos minutos chega um cliente e atendido?\n")
const parsedQueue = Number(typedQueue)

// 3) Taxa de serviço μ (clientes por minuto).
//    Exemplo: μ = 1/4 →, em média, atendimento leva 4 minutos.
const mu = 1/typedQueue;
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
