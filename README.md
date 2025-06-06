# Simulação de Fila M/M/1 em Node.js

Este projeto implementa uma simulação de um sistema de fila M/M/1 (um servidor, chegadas e atendimento exponenciais) em Node.js, utilizando um gerador de números pseudoaleatórios com seed. A simulação gera clientes até um tempo máximo de 480 minutos (8 horas), e, após esse ponto, permite que o servidor continue atendendo a fila até zerar, mas não aceita novas chegadas. Ao final, exibe estatísticas como tempo médio de espera, tempo médio de atendimento e taxa de utilização do servidor.

---

## ⚙️ Estrutura de Arquivos

```text
.
├── lcg.js          # Gerador de números aleatórios (LCG) com seed
├── exp.js          # Função para transformar uniformes em variáveis exponenciais
├── simulator.js    # Lógica principal da simulação de fila M/M/1
└── index.js        # Ponto de entrada: configura parâmetros e executa a simulação
```

* **lcg.js**: Implementa um *Linear Congruential Generator* (LCG) para produzir números uniformemente distribuídos em \[0,1), a partir de uma seed inteira.
* **exp.js**: Contém a função `exponentialRandom(uniformFunc, lambda)`, que converte uniformes em variáveis exponenciais de parâmetro λ.
* **simulator.js**: Contém a classe `Simulator`, que gerencia eventos de chegadas e partidas, controla o relógio de simulação e coleta métricas.
* **index.js**: Código principal que importa a classe `Simulator`, define parâmetros (seed, λ, μ, tempo máximo) e imprime os resultados na saída padrão.

---

## 📋 Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 12 ou superior)
* npm (já incluído no instalador do Node.js)

Nenhum outro pacote externo é necessário, pois todo o código depende apenas de módulos internos do Node.js.

---

## 🚀 Passo a Passo para Executar

1. **Clone ou baixe este repositório**
   Se estiver usando Git:

   ```bash
   git clone https://seu-repositorio.git
   cd nome-do-pasta
   ```

   Se baixou o ZIP, extraia e entre na pasta correspondente.

2. **Instale dependências (opcional)**
   Como não há dependências externas listadas no `package.json`, basta inicializar o projeto caso queira manter a convenção:

   ```bash
   npm init -y
   ```

   Isso criará um `package.json` mínimo. Não há pacotes adicionais a instalar, pois o projeto usa apenas módulos internos.

3. **Analise e ajuste parâmetros de simulação**
   Abra o arquivo `index.js` e localize a seção de parâmetros:

   ```js
   // ---- Parâmetros de simulação ----

   // 1) Seed para o gerador de aleatórios.
   const seed = 123456;

   // 2) Taxa de chegadas λ (clientes por minuto).
   //    Exemplo: λ = 1/5  → em média, um cliente a cada 5 minutos.
   const lambda = 1 / 5;

   // 3) Taxa de serviço μ (clientes por minuto).
   //    Exemplo: μ = 1/4  → em média, atendimento leva 4 minutos.
   const mu = 1 / 4;

   // 4) Tempo máximo de chegada (janela de geração de clientes), em minutos.
   //    No caso, 480 min = 8 horas.
   const tMax = 480;
   ```

   * **seed**: qualquer número inteiro entre 0 e 2³¹−1. Troque para obter resultados reproduzíveis diferentes.
   * **lambda (λ)**: definição da média de chegadas por minuto.

     * Por exemplo, se quiser 10 clientes por hora → λ = 10/60 ≈ 0.1667.
   * **mu (μ)**: definição da média de atendimentos por minuto.

     * Por exemplo, se em média o servidor atende 15 clientes por hora → μ = 15/60 = 0.25.
   * **tMax**: tempo (em minutos) durante o qual o sistema ainda gera novas chegadas. Após esse valor, `nextArrival = Infinity` e não entram mais clientes.

4. **Execute a simulação**
   No terminal, dentro da pasta do projeto, basta executar:

   ```bash
   node index.js
   ```

   O console apresentará algo assim (exemplo de saída):

   ```
   === Resultados da Simulação ===
   Total de clientes atendidos: 92
   Tempo médio de espera na fila: 2.4587 min
   Tempo médio de serviço:      3.8794 min
   Utilização do servidor:      79.35 %
   Tempo total de simulação:    523.2842 min
   ```

---

## 📈 Interpretação dos Resultados

* **Total de clientes atendidos**: quantos clientes passaram pelo sistema até a fila zerar.
* **Tempo médio de espera na fila**: média de quanto cada cliente aguardou antes de iniciar o atendimento.
* **Tempo médio de serviço**: média de duração do atendimento em minutos.
* **Utilização do servidor**: proporção do tempo em que o servidor esteve ocupado (entre 0% e 100%).

  * Cálculo interno: soma dos períodos em que o servidor estava ocupado dividido pelo tempo total de simulação (até a fila zerar).
* **Tempo total de simulação**: instante (em minutos) em que o último cliente saiu do servidor.

> Se `tMax = 480`, o simulador pode ultrapassar 480 minutos no relógio interno. Isso acontece porque, depois de 480, não entram mais clientes, mas o servidor continua atendendo até zerar a fila.

---

## 🔧 Possíveis Ajustes e Extensões

1. **Mudar Distribuição**

   * Atualmente, as chegadas e atendimentos são modelados como variáveis exponenciais.
   * Se quiser outra distribuição, basta alterar `exp.js` para a nova fórmula ou criar uma nova função de geração (por exemplo, normal, uniforme discreto etc.).

2. **Coletar Métricas Adicionais**

   * **Tamanho médio da fila**: adicione uma variável que acumule `(tamanho_da_fila) × (duração_do_intervalo)` a cada mudança de estado (evento).
   * **Tempo médio no sistema (espera + serviço)**: basta somar a cada cliente `(departureTime − arrivalTime)`.

3. **Simulação “Time-Driven” (ticks de 1 minuto)**

   * A implementação atual é *event-driven*. Se quiser forçar atualização a cada minuto, será necessário:

     * Arredondar ou truncar os tempos exponenciais para números inteiros.
     * Em um loop `for (t = 1; t ≤ tMax; t++)`, gerar chegadas cujos tempos arredondados sejam iguais a `t`, e descontar 1 minuto do tempo restante de atendimento do servidor.
   * Isso diminuirá a precisão, mas pode ser útil em alguns cenários didáticos.

4. **Parâmetros Dinâmicos**

   * Você pode vincular `lambda` e `mu` a funções de tempo para simular variações ao longo do dia (por exemplo, pico de chegadas em determinados intervalos).

---

## 📝 Licença e Créditos

* Este código foi desenvolvido de maneira didática para fins de simulação acadêmica ou testes de performance de filas M/M/1.
* Sinta-se à vontade para reutilizar, adaptar e distribuir conforme sua necessidade.

---

Qualquer dúvida ou sugestão de melhoria, fique à vontade para abrir uma issue ou entrar em contato. Bom estudo e boa simulação!
