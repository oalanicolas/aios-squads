# Hybrid-Ops Expansion Pack - Guia do Usuário

**Versão**: 2.0.0-pv
**Expansion Pack**: hybrid-ops
**Autor**: Pedro Valério
**Última Atualização**: 2025-01-21
**Status**: ✅ Production Ready

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação e Configuração](#instalação-e-configuração)
3. [Conceitos Fundamentais](#conceitos-fundamentais)
4. [Workflow Completo (9 Fases)](#workflow-completo-9-fases)
5. [Guia Passo-a-Passo](#guia-passo-a-passo)
6. [Agentes Disponíveis](#agentes-disponíveis)
7. [Ferramentas Cognitivas](#ferramentas-cognitivas)
8. [Exemplos Práticos](#exemplos-práticos)
9. [Troubleshooting](#troubleshooting)
10. [Referências](#referências)

---

## 🎯 Visão Geral

### O que é o Hybrid-Ops?

Hybrid-Ops é um **expansion pack** do AIOS que implementa um **framework universal** para transformar processos de negócio em **sistemas de execução híbridos** (Humano → Híbrido → Agente).

**Principais Características:**
- ✅ **9 Agentes Especializados** - Cada agente domina uma fase do processo
- ✅ **Validação por Heurísticas** - Decisões baseadas em lógica formalizada de Pedro Valério
- ✅ **Dual-Mode** - PV Mode (validado) ou Generic Mode (rápido)
- ✅ **ClickUp Integration** - Criação automática de workspace operacional
- ✅ **Qualidade por Construção** - 5 checkpoints de validação automáticos

### Para que Serve?

O Hybrid-Ops permite **mapear qualquer processo de negócio** e gerar:
1. **Documentação Estruturada** - Arquitetura, workflows, executores
2. **Workspace ClickUp** - Tasks prontas com Task Anatomy (8 campos obrigatórios)
3. **Agentes AI** - Definições de agentes para automação
4. **QA Gates** - Validação de qualidade automática
5. **Runbooks** - Documentação operacional

---

## 🔧 Instalação e Configuração

### Pré-requisitos

```yaml
- AIOS Framework: ≥4.31.0
- Node.js: ≥18.0.0
- NPM: ≥9.0.0
- Git: (opcional, para versionamento)
- ClickUp Account: (opcional, para integração)
```

### Instalação

O Hybrid-Ops já está instalado no seu ambiente AIOS via junction link:

```bash
# Verificar instalação
ls -la .claude/commands/hybridOps

# Deve mostrar:
# hybridOps -> /path/to/aios-fullstack/expansion-packs/hybrid-ops
```

### Configuração

#### 1. Verificar Mind Artifacts (Pedro Valério)

Os artefatos de mente de Pedro Valério devem estar em:
```
hybrid-ops/minds/pedro_valerio/
├── META_AXIOMAS.md           # Hierarquia de crenças (4 níveis)
├── heuristics/
│   ├── PV_BS_001.md         # Future Back-Casting
│   ├── PV_PA_001.md         # Coherence Scan
│   └── PV_PM_001.md         # Automation Tipping Point
└── behavioral_evidence/     # Casos reais
```

#### 2. Configurar Heurísticas (Opcional)

Edite `config/heuristics.yaml` para ajustar thresholds:

```yaml
# config/heuristics.yaml
heuristics:
  PV_BS_001:  # Future Back-Casting
    weights:
      end_state_vision: 0.9
      market_signals: 0.1
    thresholds:
      high_priority: 0.7
      medium_priority: 0.5

  PV_PA_001:  # Coherence Scan
    weights:
      truthfulness: 1.0  # VETO power
      system_adherence: 0.8
      skill: 0.3
    veto_threshold: 0.7  # Truthfulness mínima

  PV_PM_001:  # Automation Tipping Point
    frequency_threshold: 2  # execuções/mês
    weights:
      frequency: 0.7
      standardization: 0.9
      guardrails: 1.0  # VETO power
```

#### 3. Configurar ClickUp (Opcional)

Se você quiser integração com ClickUp:

```bash
# Adicionar API key ao ambiente
export CLICKUP_API_KEY="pk_your_api_key_here"

# Ou criar arquivo .env
echo "CLICKUP_API_KEY=pk_your_api_key_here" >> .env
```

### Verificar Instalação

```bash
# Testar mind loading
npm test -- tests/mind-loading.test.js

# Verificar ferramentas cognitivas
node tools/coherence-scanner.js --version
node tools/future-backcaster.js --version
node tools/automation-checker.js --version

# Rodar todos os testes
npm test
```

**Resultado Esperado**: 29/29 testes passando ✅

---

## 💡 Conceitos Fundamentais

### 1. Modos de Execução

O Hybrid-Ops opera em **dois modos**:

| Modo | Descrição | Quando Usar |
|------|-----------|-------------|
| **PV Mode** | 5 checkpoints de validação automática | ✅ **Recomendado** - Produção, processos críticos |
| **Generic Mode** | Sem validação, execução direta | Protótipos, testes rápidos |

### 2. Estrutura de Fases (9 Fases)

```
1. Discovery      → Mapear estado atual
2. Architecture   → Desenhar estado futuro    [CHECKPOINT 1]
3. Executors      → Definir quem executa      [CHECKPOINT 2]
4. Workflows      → Desenhar como executar    [CHECKPOINT 3]
5. QA & Validation → Criar gates de qualidade [CHECKPOINT 4]
6. ClickUp        → Implementar operacional   [CHECKPOINT 5]
7. Agents         → Criar AI agents
8. Validation     → Review final
9. Documentation  → Gerar docs
```

### 3. Validation Checkpoints

| # | Checkpoint | Heurística | VETO? | Fase |
|---|-----------|-----------|-------|------|
| 1 | **Strategic Alignment** | PV_BS_001 | Não | Pós-Architecture |
| 2 | **Coherence Scan** | PV_PA_001 | ✅ Sim (truthfulness <0.7) | Pós-Executors |
| 3 | **Automation Readiness** | PV_PM_001 | ✅ Sim (sem guardrails) | Pós-Workflows |
| 4 | **Axioma Compliance** | axioma-validator | Soft (score <6.0) | Pós-QA |
| 5 | **Task Anatomy** | task-anatomy | Hard (campos faltando) | Pré-ClickUp |

**VETO**: Condição não-negociável. Workflow para até correção.

### 4. Task Anatomy (8 Campos Obrigatórios)

Toda task criada no ClickUp deve ter:

```yaml
1. task_name:             # Nome descritivo
2. status:                # pending/in-progress/done
3. responsible_executor:  # Quem executa
4. execution_type:        # human/hybrid/agent
5. estimated_time:        # Tempo estimado
6. input:                 # O que precisa para começar
7. output:                # O que entrega
8. action_items:          # Passos específicos
```

### 5. Heurísticas de Decisão

#### PV_BS_001: Future Back-Casting
```
Uso: Decisões estratégicas de arquitetura
Pesos:
  - Visão de futuro: 90%
  - Sinais de mercado: 10%
Exemplo: "Criar time de AI em 2016"
  → Visão clara (0.85), mercado fraco (0.2)
  → Score: 0.785 → PROCEED
  → Resultado: #1 LATAM quando mercado amadureceu
```

#### PV_PA_001: Systemic Coherence Scan
```
Uso: Avaliação de executores/pessoas
Pesos:
  - Truthfulness: 100% (VETO)
  - Aderência ao sistema: 80%
  - Skill técnica: 30%
Exemplo: "Filmmaker com skill alta mas truthfulness 0.65"
  → VETO triggered → REJECT
  → Razão: "Truthfulness abaixo de 0.7"
```

#### PV_PM_001: Automation Tipping Point
```
Uso: Decidir se automatiza uma task
Pesos:
  - Frequência: 70%
  - Padronização: 90%
  - Guardrails: 100% (VETO)
Tipping Point: >2 execuções/mês
Exemplo: "Task executada 5x/mês, sem error handling"
  → VETO: No guardrails → REJECT
  → Ação: Adicionar validação + rollback
```

---

## 🚀 Workflow Completo (9 Fases)

### Diagrama Visual do Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                   MODO DE EXECUÇÃO                              │
│                                                                 │
│   ┌─────────────────┐              ┌──────────────────┐       │
│   │   PV MODE       │              │  GENERIC MODE    │       │
│   │ (RECOMENDADO)   │              │    (RÁPIDO)      │       │
│   ├─────────────────┤              ├──────────────────┤       │
│   │ • 5 Checkpoints │              │ • Sem validação  │       │
│   │ • Qualidade↑    │              │ • Velocidade↑    │       │
│   │ • Pode abortar  │              │ • Protótipos     │       │
│   └─────────────────┘              └──────────────────┘       │
│            │                                │                  │
└────────────┼────────────────────────────────┼──────────────────┘
             │                                │
             ▼                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    EXECUÇÃO DO WORKFLOW                          │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: Discovery (Mapeamento)                                 │
│ Agente: @hybridOps:process-mapper                              │
│ Comando: *start-discovery                                       │
│ Output:                                                          │
│  • Estado atual do processo                                     │
│  • Pain points identificados                                    │
│  • Stakeholders mapeados                                        │
│  • Oportunidades de automação                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: Architecture (Desenho do Sistema)                      │
│ Agente: @hybridOps:process-architect                           │
│ Comando: *design-process                                        │
│ Output:                                                          │
│  • Visão de estado futuro                                       │
│  • Arquitetura do sistema                                       │
│  • Prioridades estratégicas                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │ ✅ CHECKPOINT 1             │
                │ Strategic Alignment         │
                │ (PV_BS_001)                 │
                │ • Visão de futuro ≥0.8     │
                │ • Prioridade ≥0.7          │
                └─────────────────────────────┘
                       │         │
                     PASS      FAIL
                       │         │
                       │         └──► [FIX] [SKIP] [ABORT]
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: Executors (Definição de Quem Executa)                 │
│ Agente: @hybridOps:executor-designer                           │
│ Comando: *design-executors                                      │
│ Output:                                                          │
│  • Definição de executores (humanos/híbridos/agentes)         │
│  • Capacidades necessárias                                      │
│  • Assessment de truthfulness                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │ ✅ CHECKPOINT 2             │
                │ Coherence Scan              │
                │ (PV_PA_001)                 │
                │ • Truthfulness ≥0.7 (VETO) │
                │ • Coherence ≥0.8           │
                └─────────────────────────────┘
                       │         │
                     PASS      VETO!
                       │         │
                       │         └──► [FIX] [ABORT] (sem SKIP!)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 4: Workflows (Como Executar)                              │
│ Agente: @hybridOps:workflow-designer                           │
│ Comandos: *design-workflows, *create-task-definitions          │
│ Output:                                                          │
│  • Workflows detalhados                                         │
│  • Candidatos à automação                                       │
│  • Nível de padronização                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │ ✅ CHECKPOINT 3             │
                │ Automation Readiness        │
                │ (PV_PM_001)                 │
                │ • Frequência >2x/mês       │
                │ • Guardrails OK (VETO)     │
                │ • Padrão ≥0.7              │
                └─────────────────────────────┘
                       │         │
                     PASS      VETO!
                       │         │
                       │         └──► [FIX] [ABORT]
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 5: QA & Validation (Gates de Qualidade)                  │
│ Agente: @hybridOps:qa-architect                                │
│ Comando: *design-qa-gates                                       │
│ Output:                                                          │
│  • Quality gates definidos                                      │
│  • Estratégia de testes                                         │
│  • Regras de validação                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │ ✅ CHECKPOINT 4             │
                │ Axioma Compliance           │
                │ (axioma-validator)          │
                │ • Score geral ≥7.0/10.0    │
                │ • Nenhuma dimensão <6.0    │
                └─────────────────────────────┘
                       │         │
                     PASS      FAIL
                       │         │
                       │         └──► [FIX] [SKIP] [ABORT]
                       ▼
                ┌─────────────────────────────┐
                │ ✅ CHECKPOINT 5             │
                │ Task Anatomy Pre-Check      │
                │ (task-anatomy)              │
                │ • 8 campos obrigatórios    │
                │ • Formato correto          │
                └─────────────────────────────┘
                       │         │
                     PASS      FAIL
                       │         │
                       │         └──► [FIX] [SKIP] [ABORT]
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 6: ClickUp (Implementação Operacional)                   │
│ Agente: @hybridOps:clickup-engineer                            │
│ Comando: *design-clickup-structure                              │
│ Output:                                                          │
│  • Workspace ClickUp configurado                                │
│  • Tasks com Task Anatomy (8 campos)                           │
│  • Automações sugeridas                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 7: Agents (Criação de AI Agents)                         │
│ Agente: @hybridOps:agent-generator                             │
│ Comando: *generate-agents                                       │
│ Output:                                                          │
│  • Definições de agentes AI                                     │
│  • Prompts e comportamentos                                     │
│  • Handoff protocols                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 8: Validation (Review Final)                             │
│ Agente: @hybridOps:compliance-validator                        │
│ Comando: *validate-process                                      │
│ Output:                                                          │
│  • Review final de compliance                                   │
│  • Resultados de validação                                      │
│  • Recomendações finais                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ FASE 9: Documentation (Geração de Docs)                       │
│ Agente: @hybridOps:doc-generator                               │
│ Comando: *generate-all-docs                                     │
│ Output:                                                          │
│  • Documentação do processo                                     │
│  • Runbooks operacionais                                        │
│  • Guias de uso                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │   ✅ WORKFLOW COMPLETO      │
                │   Status: COMPLETED         │
                │   5 Checkpoints: PASSED     │
                └─────────────────────────────┘
```

---

## 📖 Guia Passo-a-Passo

### Cenário de Exemplo: "Processo de Onboarding de Clientes"

Vamos mapear e implementar um processo de onboarding de novos clientes usando Hybrid-Ops.

#### PASSO 1: Ativar o Agente de Discovery

```bash
# No Claude Code
@hybridOps:process-mapper
```

O agente vai se apresentar e pedir para você executar um comando.

```bash
*start-discovery
```

#### PASSO 2: Responder Elicitações de Discovery

O agente vai fazer perguntas estruturadas:

**Exemplo de Diálogo:**
```
Agent: 📋 Vamos mapear o processo atual. Qual processo você quer analisar?
Você: Onboarding de novos clientes

Agent: 🎯 Quais são os principais pain points deste processo?
Você:
1. Leva 2 semanas para ativar um cliente
2. Muita comunicação manual via email
3. Documentação espalhada em várias ferramentas

Agent: 👥 Quem são os stakeholders envolvidos?
Você:
1. Sales Team (passa o cliente)
2. Customer Success (coordena onboarding)
3. Technical Team (faz configuração)
4. Cliente (fornece informações)

Agent: 📊 Com que frequência este processo é executado?
Você: 8-12 vezes por mês (novos clientes)
```

**Output da Fase 1:**
- Arquivo `discovery-onboarding.yaml` com estado atual mapeado
- Pain points priorizados
- Stakeholders e responsabilidades
- Frequência e volume

#### PASSO 3: Desenhar Arquitetura

```bash
@hybridOps:process-architect
*design-process
```

**Exemplo de Diálogo:**
```
Agent: 🏗️ Baseado no discovery, qual é a visão de futuro para este processo?
Você: Cliente ativado em 3 dias, 80% automatizado, experiência consistente

Agent: 🎯 Quais são as prioridades estratégicas?
Você:
1. Reduzir tempo de ativação (2 semanas → 3 dias)
2. Automatizar tarefas repetitivas
3. Centralizar documentação
```

**✅ CHECKPOINT 1: Strategic Alignment**

O sistema vai validar automaticamente:
```
🔍 Executando PV_BS_001 (Future Back-Casting)...

Resultado:
  Visão de futuro: 0.85 ✅ (threshold: 0.8)
  Alinhamento estratégico: 0.78 ✅ (threshold: 0.7)

✅ CHECKPOINT 1 PASSED
Recomendação: PROCEED
```

**Output da Fase 2:**
- Arquitetura do sistema futuro
- Roadmap de migração (Humano → Híbrido → Agente)
- Métricas de sucesso

#### PASSO 4: Definir Executores

```bash
@hybridOps:executor-designer
*design-executors
```

**Exemplo de Diálogo:**
```
Agent: ⚙️ Quem vai executar cada parte do processo no estado futuro?
Você:
1. Sales Handoff: Humano (Sales) + Bot (notificação automática)
2. Coleta de Dados: Híbrido (formulário automático + CS valida)
3. Setup Técnico: Agente (100% automatizado)
4. Kickoff Meeting: Humano (CS)

Agent: 🔍 Vamos avaliar cada executor. Sales Team:
  - Truthfulness: Alta
  - Aderência ao sistema: Média
  - Skill técnica: Alta
```

**✅ CHECKPOINT 2: Coherence Scan**

```
🔍 Executando PV_PA_001 (Coherence Scan)...

Executor: Sales Team
  Truthfulness: 0.85 ✅
  System Adherence: 0.70 ✅
  Skill: 0.80
  Score Ponderado: 0.82 ✅

Executor: Setup Bot
  Truthfulness: 1.0 ✅
  System Adherence: 1.0 ✅
  Skill: 0.90
  Score Ponderado: 0.98 ✅

✅ CHECKPOINT 2 PASSED
Todos executores aprovados
```

**Output da Fase 3:**
- Definição de executores com capabilities
- Assessment de coherence
- Plano de capacitação (se necessário)

#### PASSO 5: Desenhar Workflows

```bash
@hybridOps:workflow-designer
*design-workflows
```

**Exemplo de Tasks Geradas:**
```yaml
tasks:
  - task_name: "Sales Handoff to CS"
    status: pending
    responsible_executor: "Sales Team"
    execution_type: human
    estimated_time: "15 min"
    input:
      - Deal fechado no CRM
      - Informações do cliente
    output:
      - Ticket criado no ClickUp
      - CS notificado
    action_items:
      - Criar ticket com template
      - Anexar contrato assinado
      - Notificar CS via Slack

  - task_name: "Enviar Formulário de Onboarding"
    status: pending
    responsible_executor: "Onboarding Bot"
    execution_type: hybrid
    estimated_time: "1 min"
    input:
      - Email do cliente
      - Template de formulário
    output:
      - Formulário enviado
      - Link tracking ativo
    action_items:
      - Personalizar formulário com dados do cliente
      - Enviar email automático
      - Criar reminder para 2 dias
```

**✅ CHECKPOINT 3: Automation Readiness**

```
🔍 Executando PV_PM_001 (Automation Check)...

Task: "Enviar Formulário de Onboarding"
  Frequência: 10x/mês ✅ (threshold: >2x/mês)
  Padronização: 0.95 ✅
  Guardrails:
    - ✅ Validação de email
    - ✅ Template versionado
    - ✅ Fallback para manual
    - ✅ Error logging

✅ CHECKPOINT 3 PASSED
Task pronta para automação
```

#### PASSO 6: Criar QA Gates

```bash
@hybridOps:qa-architect
*design-qa-gates
```

**Output:**
```yaml
qa_gates:
  - gate_name: "Cliente Data Complete"
    trigger: "Após coleta de dados"
    validation:
      - Todos campos obrigatórios preenchidos
      - Email validado
      - Telefone no formato correto
    action_on_fail: "Enviar email de follow-up"

  - gate_name: "Setup Successful"
    trigger: "Após configuração técnica"
    validation:
      - Conta criada no sistema
      - Permissões configuradas
      - Email de boas-vindas enviado
    action_on_fail: "Escalar para suporte técnico"
```

**✅ CHECKPOINT 4: Axioma Compliance**

```
🔍 Executando Axioma Validator...

Dimensões Validadas (10):
  1. Propósito: 8.5/10 ✅
  2. Verdade: 7.8/10 ✅
  3. Sistema: 7.2/10 ✅
  4. Eficiência: 8.9/10 ✅
  5. Pessoas: 7.5/10 ✅
  6. Responsabilidade: 8.1/10 ✅
  7. Transparência: 7.0/10 ✅
  8. Experimentação: 6.8/10 ✅
  9. Pragmatismo: 8.3/10 ✅
  10. Meta-cognição: 7.1/10 ✅

Score Geral: 7.72/10.0 ✅

✅ CHECKPOINT 4 PASSED
```

**✅ CHECKPOINT 5: Task Anatomy**

Antes de criar no ClickUp, valida que todas as tasks têm os 8 campos:

```
✅ Task Anatomy Check: 15/15 tasks compliant
Todos os 8 campos presentes em todas as tasks
```

#### PASSO 7: Criar Workspace ClickUp

```bash
@hybridOps:clickup-engineer
*design-clickup-structure
```

**Output:**
```
✅ ClickUp Workspace Created: "Cliente Onboarding"

Estrutura:
  📁 Space: Onboarding Pipeline
    📋 List: New Clients (15 tasks)
    📋 List: In Progress (0 tasks)
    📋 List: Completed (0 tasks)

Automações Configuradas:
  1. Sales Handoff → Auto-create ticket
  2. Form completed → Notify CS
  3. Setup done → Send welcome email

View URL: https://app.clickup.com/12345/v/li/67890
```

#### PASSO 8: Gerar AI Agents

```bash
@hybridOps:agent-generator
*generate-agents
```

**Output:**
```yaml
agents:
  - agent_id: "onboarding-bot"
    role: "Automated Onboarding Coordinator"
    triggers:
      - New client from Sales
    capabilities:
      - Send personalized forms
      - Track form completion
      - Send reminders
      - Escalate to CS if needed
    prompts:
      system: "You are an onboarding coordinator..."
      handoff: "When to hand off to CS..."
```

#### PASSO 9: Validation Final

```bash
@hybridOps:compliance-validator
*validate-process
```

**Output:**
```
✅ Validation Report: PASSED

Compliance Checks:
  ✅ All 5 checkpoints passed
  ✅ AIOS-PM standards met
  ✅ Task Anatomy compliant (15/15 tasks)
  ✅ Axioma score: 7.72/10.0
  ✅ No critical issues

Recommendations:
  - Consider automating "Kickoff Meeting Scheduling"
  - Add monitoring dashboard for SLA tracking
```

#### PASSO 10: Gerar Documentação

```bash
@hybridOps:doc-generator
*generate-all-docs
```

**Output:**
```
✅ Documentation Generated:

Files Created:
  📄 process-documentation.md    - Visão geral do processo
  📄 runbook-cs-team.md         - Guia operacional para CS
  📄 runbook-technical-team.md  - Guia para suporte técnico
  📄 automation-playbook.md      - Como funcionam as automações
  📄 troubleshooting-guide.md    - Resolução de problemas

Location: outputs/processes/cliente-onboarding/docs/
```

---

## 👥 Agentes Disponíveis

### Tabela Completa de Agentes

| # | Agente | ID | Fase | Comando Principal |
|---|--------|---------|------|-------------------|
| 1 | **Process Mapper** | `process-mapper-pv` | Discovery | `*start-discovery` |
| 2 | **Process Architect** | `process-architect-pv` | Architecture | `*design-process` |
| 3 | **Executor Designer** | `executor-designer-pv` | Executors | `*design-executors` |
| 4 | **Workflow Designer** | `workflow-designer-pv` | Workflows | `*design-workflows` |
| 5 | **QA Architect** | `qa-validator-pv` | QA & Validation | `*design-qa-gates` |
| 6 | **ClickUp Engineer** | `clickup-engineer-pv` | ClickUp | `*design-clickup-structure` |
| 7 | **Agent Generator** | `agent-creator-pv` | Agents | `*generate-agents` |
| 8 | **Compliance Validator** | `validation-reviewer-pv` | Validation | `*validate-process` |
| 9 | **Doc Generator** | `documentation-writer-pv` | Documentation | `*generate-all-docs` |

### Detalhes dos Agentes

#### 1. Process Mapper 🗺️

**Ativação:**
```bash
@hybridOps:process-mapper
```

**Comandos:**
- `*start-discovery` - Inicia mapeamento de processo
- `*map-stakeholders` - Mapeia stakeholders
- `*identify-pain-points` - Identifica problemas
- `*help` - Mostra ajuda

**Saída Típica:**
```yaml
process_name: "Nome do Processo"
current_state:
  description: "Estado atual..."
  pain_points:
    - issue: "Problema 1"
      impact: "Alto"
    - issue: "Problema 2"
      impact: "Médio"
  stakeholders:
    - name: "Stakeholder 1"
      role: "Papel"
      involvement: "Direto"
frequency: "10x/mês"
volume: "120 clientes/ano"
```

#### 2. Process Architect 🏗️

**Ativação:**
```bash
@hybridOps:process-architect
```

**Comandos:**
- `*design-process` - Desenha arquitetura do processo
- `*define-future-state` - Define estado futuro
- `*create-roadmap` - Cria roadmap de migração
- `*help` - Mostra ajuda

**Saída Típica:**
```yaml
future_state:
  vision: "Visão do estado futuro..."
  metrics:
    - metric: "Tempo de execução"
      current: "2 semanas"
      target: "3 dias"
  architecture:
    phases:
      - phase: "Fase 1"
        description: "..."
        automation_level: "hybrid"
```

**Checkpoint Associado:** ✅ CHECKPOINT 1 - Strategic Alignment (PV_BS_001)

#### 3. Executor Designer ⚙️

**Ativação:**
```bash
@hybridOps:executor-designer
```

**Comandos:**
- `*design-executors` - Define executores
- `*assess-coherence` - Avalia coherence de executor
- `*create-capacity-plan` - Plano de capacitação
- `*help` - Mostra ajuda

**Saída Típica:**
```yaml
executors:
  - executor_id: "sales-team"
    type: "human"
    capabilities:
      - "Qualificar leads"
      - "Fechar contratos"
    assessment:
      truthfulness: 0.85
      system_adherence: 0.70
      skill: 0.80
      coherence_score: 0.82
    recommendation: "APPROVED"
```

**Checkpoint Associado:** ✅ CHECKPOINT 2 - Coherence Scan (PV_PA_001)
- **VETO**: Truthfulness <0.7

#### 4. Workflow Designer 📋

**Ativação:**
```bash
@hybridOps:workflow-designer
```

**Comandos:**
- `*design-workflows` - Desenha workflows completos
- `*create-task-definitions` - Cria definições de tasks
- `*identify-automation-candidates` - Identifica automações
- `*help` - Mostra ajuda

**Saída Típica:**
```yaml
workflows:
  - workflow_id: "wf-001"
    name: "Cliente Onboarding"
    tasks:
      - task_name: "Task 1"
        status: "pending"
        responsible_executor: "Bot"
        execution_type: "hybrid"
        estimated_time: "10 min"
        input: ["Input 1"]
        output: ["Output 1"]
        action_items:
          - "Ação 1"
          - "Ação 2"
        automation_candidate: true
        frequency: "10x/mês"
        standardization_level: 0.95
```

**Checkpoint Associado:** ✅ CHECKPOINT 3 - Automation Readiness (PV_PM_001)
- **VETO**: Sem guardrails de segurança

#### 5. QA Architect ✅

**Ativação:**
```bash
@hybridOps:qa-architect
```

**Comandos:**
- `*design-qa-gates` - Cria quality gates
- `*create-test-strategy` - Estratégia de testes
- `*define-validation-rules` - Regras de validação
- `*help` - Mostra ajuda

**Saída Típica:**
```yaml
qa_gates:
  - gate_id: "gate-001"
    name: "Data Completeness Check"
    trigger: "After data collection"
    validation_rules:
      - rule: "All required fields filled"
        type: "mandatory"
      - rule: "Email format valid"
        type: "format"
    action_on_pass: "Proceed to next phase"
    action_on_fail: "Send follow-up email"
```

**Checkpoint Associado:** ✅ CHECKPOINT 4 - Axioma Compliance

#### 6. ClickUp Engineer 🔧

**Ativação:**
```bash
@hybridOps:clickup-engineer
```

**Comandos:**
- `*design-clickup-structure` - Cria estrutura no ClickUp
- `*create-automations` - Define automações
- `*validate-task-anatomy` - Valida Task Anatomy
- `*help` - Mostra ajuda

**Saída Típica:**
```yaml
clickup_workspace:
  space_name: "Processo XYZ"
  lists:
    - list_name: "To Do"
      tasks: [...]
  automations:
    - automation_id: "auto-001"
      trigger: "Task status changed to Done"
      action: "Send notification to Slack"
```

**Checkpoint Associado:** ✅ CHECKPOINT 5 - Task Anatomy
- Valida que todos os 8 campos estão presentes

#### 7. Agent Generator 🤖

**Ativação:**
```bash
@hybridOps:agent-generator
```

**Comandos:**
- `*generate-agents` - Gera definições de agentes
- `*create-prompts` - Cria system prompts
- `*define-handoffs` - Define protocolos de handoff
- `*help` - Mostra ajuda

**Saída Típica:**
```yaml
agents:
  - agent_id: "agent-001"
    name: "Onboarding Bot"
    role: "Automate client onboarding"
    capabilities:
      - "Send forms"
      - "Track responses"
      - "Escalate issues"
    prompts:
      system: "You are an onboarding coordinator..."
      user_facing: "Hello! I'm here to help..."
    handoff_to_human:
      conditions:
        - "Form not completed after 3 reminders"
        - "Client requests human contact"
```

#### 8. Compliance Validator 🔍

**Ativação:**
```bash
@hybridOps:compliance-validator
```

**Comandos:**
- `*validate-process` - Valida processo completo
- `*check-compliance` - Verifica compliance AIOS-PM
- `*generate-audit-report` - Gera relatório de auditoria
- `*help` - Mostra ajuda

**Saída Típica:**
```yaml
validation_results:
  overall_status: "PASSED"
  checkpoints_passed: 5
  checkpoints_failed: 0
  axioma_score: 7.72
  compliance_checks:
    - check: "Task Anatomy"
      status: "PASSED"
      details: "15/15 tasks compliant"
  recommendations:
    - "Consider monitoring dashboard"
    - "Add SLA tracking"
```

#### 9. Doc Generator 📝

**Ativação:**
```bash
@hybridOps:doc-generator
```

**Comandos:**
- `*generate-all-docs` - Gera toda documentação
- `*create-runbook` - Cria runbook específico
- `*generate-diagram` - Gera diagramas visuais
- `*help` - Mostra ajuda

**Saída Típica:**
```
✅ Documentation Generated:

Files:
  📄 process-overview.md
  📄 runbook-team-a.md
  📄 runbook-team-b.md
  📄 automation-guide.md
  📄 troubleshooting.md
  📊 workflow-diagram.mermaid

Location: outputs/processes/nome-processo/docs/
```

---

## 🛠️ Ferramentas Cognitivas

As ferramentas cognitivas são **CLIs standalone** que executam heurísticas de Pedro Valério.

### 1. Coherence Scanner

**Heurística:** PV_PA_001
**Uso:** Avaliar executores/pessoas

**Sintaxe:**
```bash
node tools/coherence-scanner.js --input <file.json>
node tools/coherence-scanner.js --json '<json-string>'
echo '<json>' | node tools/coherence-scanner.js --stdin
```

**Input:**
```json
{
  "truthfulness": 0.85,
  "systemAdherence": 0.75,
  "skill": 0.70
}
```

**Output:**
```json
{
  "heuristic": "PV_PA_001",
  "score": 0.82,
  "veto": false,
  "recommendation": "APPROVE",
  "vetoReason": null,
  "breakdown": {
    "truthfulness": 0.85,
    "truthfulnessWeighted": 0.425,
    "systemAdherence": 0.75,
    "systemAdherenceWeighted": 0.30,
    "skill": 0.70,
    "skillWeighted": 0.21
  }
}
```

**Exit Codes:**
- `0` - Sucesso
- `1` - Input inválido
- `2` - Erro de validação
- `3` - Falha ao carregar mind

### 2. Future Backcaster

**Heurística:** PV_BS_001
**Uso:** Decisões estratégicas

**Sintaxe:**
```bash
node tools/future-backcaster.js --input <file.json>
```

**Input:**
```json
{
  "endStateVision": 0.85,
  "marketSignals": 0.30
}
```

**Output:**
```json
{
  "heuristic": "PV_BS_001",
  "score": 0.795,
  "priority": "HIGH",
  "recommendation": "PROCEED",
  "breakdown": {
    "visionClarity": 0.85,
    "marketAlignment": 0.30
  }
}
```

### 3. Automation Checker

**Heurística:** PV_PM_001
**Uso:** Decidir se automatiza uma task

**Sintaxe:**
```bash
node tools/automation-checker.js --input <file.json>
```

**Input:**
```json
{
  "frequency": 10,
  "standardization": 0.95,
  "guardrails": {
    "errorHandling": true,
    "validation": true,
    "rollback": true
  }
}
```

**Output:**
```json
{
  "heuristic": "PV_PM_001",
  "score": 0.93,
  "recommendation": "AUTOMATE",
  "veto": false,
  "vetoReason": null,
  "breakdown": {
    "frequencyScore": 1.0,
    "standardizationScore": 0.95,
    "guardrailsPresent": true
  }
}
```

---

## 💼 Exemplos Práticos

### Exemplo 1: Processo Simples (5 Tasks)

```bash
# FASE 1: Discovery
@hybridOps:process-mapper
*start-discovery

# Input interativo:
Processo: "Weekly Team Standup"
Frequência: "4x/mês"
Duração atual: "45 min"
Pain points: "Não fica registrado, difícil rastrear ação items"

# Output:
discovery-standup.yaml (estado atual mapeado)

# FASE 2-9: Continuar workflow...
# (omitido para brevidade)

# RESULTADO FINAL:
✅ 5 tasks criadas no ClickUp
✅ Bot de reminder configurado
✅ Template de ata automático
✅ Duração reduzida para 30 min
```

### Exemplo 2: Processo Complexo (50+ Tasks)

```bash
# Caso: "Product Development Lifecycle"
# Fases: Discovery → Design → Development → QA → Deploy

# FASE 1: Discovery
@hybridOps:process-mapper
*start-discovery
# → Mapeia 8 subprocessos
# → Identifica 12 stakeholders
# → 25 pain points priorizados

# FASE 2: Architecture
@hybridOps:process-architect
*design-process
# → Roadmap de 3 fases (6 meses cada)
# → Migração gradual Human → Hybrid → Agent

# ✅ CHECKPOINT 1: PASSED (visão 0.92)

# FASE 3: Executors
@hybridOps:executor-designer
*design-executors
# → 15 executores definidos
# → 3 precisam capacitação
# → 2 novos bots necessários

# ✅ CHECKPOINT 2: PASSED (todos >0.7 truthfulness)

# ... (fases 4-9)

# RESULTADO FINAL:
✅ 73 tasks no ClickUp (3 listas)
✅ 8 automações configuradas
✅ 2 AI agents criados
✅ Runbook de 45 páginas
✅ SLA tracking dashboard
```

### Exemplo 3: Uso das Ferramentas Cognitivas

#### Caso: Avaliar Candidato para Executor

```bash
# Criar arquivo de assessment
cat > candidate-assessment.json <<EOF
{
  "truthfulness": 0.72,
  "systemAdherence": 0.88,
  "skill": 0.95
}
EOF

# Executar Coherence Scanner
node tools/coherence-scanner.js --input candidate-assessment.json

# Output:
{
  "heuristic": "PV_PA_001",
  "score": 0.81,
  "veto": false,
  "recommendation": "APPROVE",
  "vetoReason": null,
  "breakdown": {
    "truthfulness": 0.72,
    "truthfulnessWeighted": 0.36,
    "systemAdherence": 0.88,
    "systemAdherenceWeighted": 0.352,
    "skill": 0.95,
    "skillWeighted": 0.285
  },
  "metadata": {
    "hierarchyRank": "EXCELLENT",
    "criticalFactors": ["truthfulness", "systemAdherence"]
  }
}

# Decisão: ✅ APPROVED (score 0.81 > 0.8)
```

#### Caso: Decidir se Automatiza uma Task

```bash
# Task: "Enviar Relatório Semanal"
cat > task-automation.json <<EOF
{
  "frequency": 4,
  "standardization": 0.85,
  "guardrails": {
    "errorHandling": true,
    "validation": true,
    "rollback": false
  }
}
EOF

node tools/automation-checker.js --input task-automation.json

# Output:
{
  "heuristic": "PV_PM_001",
  "score": 0.75,
  "recommendation": "PROCEED_WITH_CAUTION",
  "veto": false,
  "vetoReason": null,
  "breakdown": {
    "frequencyScore": 1.0,
    "standardizationScore": 0.85,
    "guardrailsPresent": true
  },
  "warnings": [
    "Rollback mechanism missing - add before production"
  ]
}

# Decisão: ⚠️ PROCEED mas adicionar rollback primeiro
```

---

## 🔧 Troubleshooting

### Problema 1: Checkpoint Falhando Repetidamente

**Sintoma:**
```
❌ CHECKPOINT 2 FAILED
Coherence Scan: Executor "John" - Truthfulness 0.65 (threshold: 0.7)
```

**Soluções:**

**Opção A: [FIX]** - Corrigir o problema
```bash
# Revisar assessment do executor
# Aumentar truthfulness score baseado em evidências
# Re-executar checkpoint
```

**Opção B: [SKIP]** - Pular validação
```bash
# Apenas para prototipagem!
# Workflow continua com WARNING
# Não recomendado para produção
```

**Opção C: [ABORT]** - Abortar workflow
```bash
# Interrompe execução
# Retorna resultados parciais
# Necessário quando problema é fundamental
```

### Problema 2: Mind Loading Failure

**Sintoma:**
```
Error: Failed to load Pedro Valério mind artifacts
Path not found: hybrid-ops/minds/pedro_valerio/
```

**Solução:**
```bash
# Verificar se mind artifacts existem
ls hybrid-ops/minds/pedro_valerio/

# Se não existir, restaurar do backup
cp -r backups/minds/pedro_valerio/ outputs/minds/

# Verificar permissões
chmod -R 755 hybrid-ops/minds/pedro_valerio/

# Testar mind loading
npm test -- tests/mind-loading.test.js
```

### Problema 3: ClickUp API Error

**Sintoma:**
```
Error: ClickUp API returned 401 Unauthorized
```

**Solução:**
```bash
# Verificar API key
echo $CLICKUP_API_KEY

# Se vazio, configurar
export CLICKUP_API_KEY="pk_your_key_here"

# Ou adicionar ao .env
echo "CLICKUP_API_KEY=pk_your_key_here" >> .env

# Testar conexão
node tests/clickup-integration.test.js
```

### Problema 4: Task Anatomy Validation Failure

**Sintoma:**
```
❌ CHECKPOINT 5 FAILED
Task "Setup Client" missing required fields: [output, action_items]
```

**Solução:**
```yaml
# Completar todos os 8 campos obrigatórios:
task_name: "Setup Client"              # ✅
status: "pending"                       # ✅
responsible_executor: "Tech Team"      # ✅
execution_type: "hybrid"               # ✅
estimated_time: "30 min"               # ✅
input: ["Client data", "Template"]     # ✅
output: ["Account created", "Email sent"]  # ← ADICIONAR
action_items:                          # ← ADICIONAR
  - "Create account in system"
  - "Configure permissions"
  - "Send welcome email"
```

### Problema 5: VETO Não Pode Ser Resolvido

**Sintoma:**
```
🛑 VETO TRIGGERED
PV_PA_001: Executor truthfulness 0.62 < 0.7
This is NON-NEGOTIABLE
```

**Soluções:**

**Opção A:** Substituir executor
```bash
# Trocar executor por outro com truthfulness ≥0.7
# Re-executar Coherence Scan
```

**Opção B:** Fornecer evidências para aumentar score
```bash
# Adicionar evidências comportamentais
# Referências de projetos anteriores
# Re-assessment com dados mais precisos
```

**Opção C:** Abortar workflow
```bash
# Se não houver executor viável
# Workflow para e retorna parcial
```

### Problema 6: Performance Lenta

**Sintoma:**
```
Workflow taking >10 minutes to complete
Checkpoints timeout
```

**Solução:**
```bash
# Usar Generic Mode para protótipos
mode: "Generic"  # Skip all 5 checkpoints

# Ou ajustar timeout
export VALIDATION_TIMEOUT=30000  # 30s

# Verificar cache de mind
node tools/performance-profiler.js

# Limpar cache se corrupto
rm -rf .cache/minds/
```

---

## 📚 Referências

### Documentação Completa

```
aios-fullstack/expansion-packs/hybrid-ops/
├── README.md                         # Overview do pack
├── USER-GUIDE.md                     # Este guia
├── docs/
│   ├── workflow-diagram.md           # Diagrama completo do workflow
│   ├── workflow-orchestration-guide.md  # Orquestração detalhada
│   ├── validation-gate-reference.md  # Referência de gates
│   ├── cognitive-tools-guide.md      # Guia das ferramentas CLI
│   ├── configuration-guide.md        # Configuração avançada
│   ├── migration-guide.md            # Migração v1.x → v2.0
│   ├── coherence-assessment-guide.md # Guia de Coherence Scan
│   ├── back-casting-guide.md         # Guia de Back-Casting
│   └── monitoring-runbook.md         # Monitoring & logging
├── agents/                           # Definições de todos os 18 agentes
├── tasks/                            # 12 task workflows
├── tools/                            # 3 ferramentas cognitivas CLI
└── examples/                         # Exemplos práticos
```

### Heurísticas de Pedro Valério

```
hybrid-ops/minds/pedro_valerio/
├── META_AXIOMAS.md                   # 4 níveis de axiomas
├── heuristics/
│   ├── PV_BS_001.md                 # Future Back-Casting
│   │   • Uso: Decisões estratégicas
│   │   • Pesos: Visão (90%), Mercado (10%)
│   │   • Exemplo: Criar AI Team em 2016
│   │
│   ├── PV_PA_001.md                 # Coherence Scan
│   │   • Uso: Assessment de executores
│   │   • Pesos: Truthfulness (100% VETO), System (80%), Skill (30%)
│   │   • Exemplo: Filmmaker demitido por truthfulness 0.65
│   │
│   └── PV_PM_001.md                 # Automation Tipping Point
│       • Uso: Decisões de automação
│       • Tipping Point: >2 execuções/mês
│       • VETO: Sem guardrails
└── behavioral_evidence/              # Casos reais documentados
```

### Stories do Epic 1 (Hybrid-Ops PV Integration)

```
docs/stories/
├── 1.1-phase-1-foundation.md        # Mind loading infrastructure
├── 1.2-phase-1-validation.md        # Validation da abordagem (85% accuracy)
├── 1.3-phase-2-clickup-engineer.md  # ClickUp Engineer + PV_PM_001
├── 1.4-phase-2-task-architect.md    # Task Architect + PV_BS_001
├── 1.5-phase-2-executor-designer.md # Executor Designer + PV_PA_001
├── 1.6-phase-2-cognitive-utilities.md # 3 CLI tools
├── 1.7-phase-2-configuration-system.md # Config system
├── 1.8-phase-3-workflow-orchestration.md # 5 checkpoints
├── 1.9-phase-4-integration-testing.md # E2E tests
├── 1.10-phase-4-performance-optimization.md # <100ms overhead
├── 1.11-phase-5-migration-guide.md  # v1.x → v2.0
├── 1.13-phase-4-cache-optimization.md # Advanced caching
├── 1.14-monitoring-infrastructure.md # Logging & monitoring
└── 1.15-hybrid-ops-git-migration.md # Git migration (COMPLETE)
```

### Links Úteis

- **Epic 1**: `docs/epics/1-hybrid-ops-pv-mind-integration.md`
- **PRD**: `docs/prd/hybrid-ops-pv-mind-integration.md`
- **Architecture**: `docs/architecture/hybrid-ops-pv-mind-integration.md`
- **Installation Guide**: `aios-fullstack/expansion-packs/hybrid-ops/INSTALLATION.md`
- **Package Info**: `aios-fullstack/expansion-packs/hybrid-ops/package.json`

### Comandos Rápidos

```bash
# Ver todos agentes
ls agents/*.md

# Ver todas tasks
ls tasks/*.md

# Rodar testes
npm test

# Ver performance metrics
npm run benchmark

# Ver logs
tail -f tests/temp/integration/*.log

# Verificar versão
cat package.json | grep version
```

---

## ✅ Checklist de Início Rápido

Use este checklist para validar que está tudo pronto:

```
□ Node.js ≥18.0.0 instalado
□ AIOS Framework ≥4.31.0 presente
□ Junction link .claude/commands/hybridOps/ funcionando
□ Mind artifacts em hybrid-ops/minds/pedro_valerio/
□ 29/29 testes passando (npm test)
□ Ferramentas cognitivas funcionando (--version)
□ ClickUp API key configurada (se necessário)
□ Configuração heuristics.yaml revisada
□ Este guia lido completamente
```

---

## 🎓 Próximos Passos

1. **Primeiro Uso**: Comece com um processo simples (5-10 tasks)
2. **Modo Recomendado**: Use PV Mode para qualidade
3. **Siga o Workflow**: Execute as 9 fases em ordem
4. **Respeite os Checkpoints**: Corrija VETOs imediatamente
5. **Documente Tudo**: Use *generate-all-docs no final
6. **Itere**: Processos evoluem, re-execute periodicamente

---

## 📞 Suporte

**Documentação**:
- USER-GUIDE.md (este arquivo)
- workflow-diagram.md (fluxogramas visuais)
- cognitive-tools-guide.md (ferramentas CLI)

**Testes**:
```bash
npm test                    # Todos os testes
npm run test:verbose        # Output detalhado
npm run benchmark          # Performance metrics
```

**Logs**:
```bash
tail -f tests/temp/integration/*.log  # Logs de integração
```

---

**Hybrid-Ops v2.0-pv**
**Powered by Pedro Valério's Cognitive Architecture**
**Quality by Construction** 🏗️

---

*Este guia foi gerado com base na análise completa do código-fonte e documentação do Hybrid-Ops Expansion Pack. Para dúvidas ou contribuições, consulte o mantenedor do pack.*
