# Debate Engine - CLI-First Fidelity Valuation

**Version:** 1.0.0
**Purpose:** Execute structured debates between cognitive clones with automatic fidelity scoring

---

## 🎯 Overview

O Debate Engine permite que você execute debates estruturados entre dois clones cognitivos e receba uma **avaliação automática de fidelidade** baseada em 5 dimensões críticas.

**O que você recebe:**
- ✅ Transcript completo do debate (salvo em Markdown)
- ✅ Scores de fidelidade para ambos os clones (0-100%)
- ✅ Análise de forças e fraquezas
- ✅ Recomendações acionáveis para melhorar clones
- ✅ Benchmark salvo para comparações futuras

---

## 🚀 Quick Start

### Exemplo Básico

```bash
python3 expansion-packs/mmos/scripts/emulator.py debate \
  sam_altman \
  elon_musk \
  --topic "Should AI development be fully open source?" \
  --framework oxford \
  --rounds 5
```

### Saída Esperada

```
============================================================
LOADING CLONES
============================================================

Loading sam_altman...
✅ Sam Altman loaded (proposer)

Loading elon_musk...
✅ Elon Musk loaded (opposer)

============================================================
DEBATE: Should AI development be fully open source?
Framework: Oxford Debate
============================================================

Sam Altman (PROPOSER)
    VS
Elon Musk (OPPOSER)

────────────────────────────────────────────────────────────
ROUND 1/5: OPENING
────────────────────────────────────────────────────────────

Sam Altman:
────────────────────────────────────────────────────────────
AGI is the most important technology humanity will ever build...
[Argument text]

(245 tokens, 1234ms)

Elon Musk:
────────────────────────────────────────────────────────────
First principles: OpenAI was founded to be OPEN...
[Argument text]

(198 tokens, 987ms)

[... Round 2-5 ...]

============================================================
FIDELITY SCORING
============================================================

Analyzing debate performance across 5 dimensions...

────────────────────────────────────────────────────────────
Sam Altman (vunknown) - proposer
────────────────────────────────────────────────────────────
  Framework Application:   88.0% ████████████████░░░░
  Style Consistency:       92.0% ██████████████████░░
  Knowledge Depth:         85.0% █████████████████░░░
  Argument Coherence:      90.0% ██████████████████░░
  Personality Fidelity:    88.0% ████████████████░░░░

OVERALL FIDELITY: 88.6%
✅ GOOD (Acceptable)

────────────────────────────────────────────────────────────
Elon Musk (vunknown) - opposer
────────────────────────────────────────────────────────────
  Framework Application:   95.0% ███████████████████░
  Style Consistency:       94.0% ███████████████████░
  Knowledge Depth:         90.0% ██████████████████░░
  Argument Coherence:      92.0% ██████████████████░░
  Personality Fidelity:    92.0% ██████████████████░░

OVERALL FIDELITY: 92.6%
⭐ EXCELLENT (Production Ready)

============================================================
WINNER: Elon Musk (+4.0 points)
============================================================

✅ Strengths:
  • Excellent framework application by Elon Musk (95.0%)
  • Excellent style consistency by Elon Musk (94.0%)
  • Deep knowledge demonstrated by Elon Musk (90.0%)

⚠️  Weaknesses:
  • None detected (both clones scored above 85%)

💡 Recommendations:
  • sam_altman: Add 2-3 more examples to reach excellent tier

📄 Transcript saved: temp/debates/debate-a3f8-20251014-143025.md
💾 Benchmark saved: docs/mmos/qa/benchmarks/benchmark-a3f8-20251014-143025.yaml

✅ Debate complete! Winner: Elon Musk (+4.0 points)
```

---

## 📊 Fidelity Scoring Dimensions

### 1. Framework Application (25% weight)
**O que avalia:** Clone usa seus frameworks mentais característicos?

**Exemplos:**
- Sam Altman: "iterative deployment", "compound learning", "temporal zoom"
- Elon Musk: "first principles", "physics analogies", "distributed systems"

**Como melhorar:**
- Adicionar mais exemplos de frameworks na Layer 3 do system-prompt
- Incluir casos de uso específicos no KB

---

### 2. Style Consistency (20% weight)
**O que avalia:** Estilo de comunicação autêntico ao clone?

**Exemplos:**
- Sam: Pragmático, admite incerteza, reframe temporal
- Elon: Direto, confrontacional, "simple as that"

**Como melhorar:**
- Adicionar mais exemplos de comunicação no KB
- Revisar Layer 2 (Communication Patterns) do system-prompt

---

### 3. Knowledge Depth (20% weight)
**O que avalia:** Demonstra domínio profundo do domínio?

**Exemplos:**
- Usa exemplos específicos e corretos
- Referências históricas precisas
- Detalhes técnicos apropriados

**Como melhorar:**
- Expandir KB com mais conteúdo específico
- Adicionar mais depth à Layer 3 (Mental Models)

---

### 4. Argument Coherence (20% weight)
**O que avalia:** Argumentos são logicamente consistentes?

**Exemplos:**
- Progressão lógica clara
- Sem contradições internas
- Respostas coerentes entre rodadas

**Como melhorar:**
- Geralmente alto se outras dimensões estão boas
- Se baixo, revisar Layer 5 (Decision Architecture)

---

### 5. Personality Fidelity (15% weight)
**O que avalia:** Personalidade e valores aparecem?

**Exemplos:**
- Sam: "Mission > status", "safety concerns"
- Elon: "Decentralization", "distrust of authority"

**Como melhorar:**
- Fortalecer Layers 6-7 (Values, Obsessions)
- Adicionar mais exemplos de motivações core

---

## 🎨 Frameworks Disponíveis

### 1. Oxford Debate (Default)
**Estrutura:** Opening → Rebuttals (3x) → Closing
**Melhor para:** Confronto direto de posições opostas
**Rounds:** 5

```bash
--framework oxford
```

### 2. Socratic Dialogue
**Estrutura:** Question → Answer (alternando 3x) → Synthesis
**Melhor para:** Exploração profunda de conceitos
**Rounds:** 7

```bash
--framework socratic
```

### 3. Steel Man
**Estrutura:** Steel Man Opponent (2x) → Defend Own (2x)
**Melhor para:** Teste de honestidade intelectual
**Rounds:** 4

```bash
--framework steel_man
```

### 4. Devil's Advocate
**Estrutura:** Proposal → Challenge → Defense (alternando)
**Melhor para:** Teste rigoroso de ideias
**Rounds:** 6

```bash
--framework devils_advocate
```

### 5. Hegelian Dialectic
**Estrutura:** Thesis → Antithesis → Synthesis
**Melhor para:** Busca de verdade superior
**Rounds:** 3

```bash
--framework hegelian
```

---

## 📂 Arquivos Gerados

### 1. Transcript (Markdown)
**Local:** `temp/debates/debate-{id}-{timestamp}.md`

**Conteúdo:**
- Metadata do debate
- Argumentos round-by-round
- Métricas de performance

**Uso:**
- Review manual do debate
- Compartilhamento
- Análise qualitativa

---

### 2. Benchmark (YAML)
**Local:** `docs/mmos/qa/benchmarks/benchmark-{id}-{timestamp}.yaml`

**Conteúdo:**
```yaml
debate_id: a3f8
timestamp: "2025-10-14T14:30:25"
topic: "Should AI development be fully open source?"
framework: "Oxford Debate"

clones:
  Sam Altman:
    version: "2.3"
    role: proposer
    scores:
      framework_application: 88.0
      style_consistency: 92.0
      knowledge_depth: 85.0
      argument_coherence: 90.0
      personality_fidelity: 88.0
    overall: 88.6

  Elon Musk:
    version: "1.8"
    role: opposer
    scores:
      framework_application: 95.0
      style_consistency: 94.0
      knowledge_depth: 90.0
      argument_coherence: 92.0
      personality_fidelity: 92.0
    overall: 92.6

results:
  winner: "Elon Musk"
  win_margin: 4.0

analysis:
  strengths:
    - "Excellent framework application by Elon Musk (95.0%)"
  weaknesses: []
  recommendations:
    - "sam_altman: Add examples to reach excellent tier"
```

**Uso:**
- Tracking de fidelidade ao longo do tempo
- Comparação entre versões de clones
- Input para analytics futuras

---

## 🔧 Opções Avançadas

### Customizar Número de Rounds

```bash
--rounds 3   # Debate mais curto (rápido para iteração)
--rounds 5   # Padrão (balance)
--rounds 7   # Debate longo (máximo depth)
```

### Pular Salvamento

```python
# Dentro do código Python
config = DebateConfig(
    clone1_name="sam_altman",
    clone2_name="elon_musk",
    topic="...",
    save_transcript=False,  # Não salva MD
    save_benchmark=False    # Não salva YAML
)
```

---

## 🧪 Modo de Teste (Atual)

**Status:** Implementação com argumentos mock

### O que funciona agora:
✅ Orquestração completa do debate
✅ Framework Oxford configurado
✅ Scoring em 5 dimensões
✅ Valuation report formatado
✅ Salvamento de transcripts e benchmarks

### O que é mock (placeholder):
⚠️ Geração de argumentos (usa texto pré-definido para Sam e Elon)
⚠️ Scoring usa heurísticas simples (não LLM-as-judge ainda)

### Próximos passos para produção:
1. **Integrar LLM API** (Claude/GPT-4) para geração de argumentos
2. **LLM-as-judge** para scoring mais preciso
3. **Criar mais clones** com system-prompts completos
4. **Calibrar scoring** contra avaliação humana

---

## 💡 Casos de Uso

### 1. QA Automático de Clones
**Cenário:** Você atualizou o system-prompt de Sam Altman v2.3 → v2.4

**Workflow:**
```bash
# Run debate com v2.4
python3 emulator.py debate sam_altman elon_musk \
  --topic "AI Safety" --framework oxford --rounds 5

# Compara scores:
# - v2.3: 88.6%
# - v2.4: 91.2% ✅ Improvement!
```

---

### 2. Identificar Gaps no KB
**Cenário:** Clone tem score baixo em "Knowledge Depth"

**Ação:**
- Review debate transcript
- Identificar quais tópicos o clone não dominou
- Adicionar conteúdo específico ao KB
- Re-run debate e validar melhoria

---

### 3. Comparar Clones
**Cenário:** Qual clone tem melhor fidelidade overall?

**Workflow:**
```bash
# Run round-robin entre 3 clones
sam vs elon  → Winner: Elon (92.6%)
sam vs naval → Winner: Naval (91.2%)
elon vs naval → Winner: Elon (93.1%)

# Ranking:
# 1. Elon: 92.85% avg
# 2. Naval: 91.2%
# 3. Sam: 88.6%
```

---

### 4. Explorar Perspectivas
**Cenário:** Você quer explorar um dilema complexo

**Workflow:**
```bash
# Use Socratic framework para deep dive
python3 emulator.py debate sam_altman ray_dalio \
  --topic "How to navigate economic uncertainty in AI era" \
  --framework socratic --rounds 7

# Leia transcript para insights
cat temp/debates/debate-*.md
```

---

## 📈 Interpretando Scores

### Fidelity Ranges

| Score | Rating | Significado | Ação |
|-------|--------|-------------|------|
| 94-100% | ⭐ EXCELLENT | Production-ready, indistinguível do original | Deploy |
| 85-93% | ✅ GOOD | Aceitável, com pequenas imperfeições | Minor tweaks |
| 70-84% | ⚠️ ACCEPTABLE | Funcional mas precisa melhorias | Review |
| <70% | ❌ POOR | Não production-ready | Major rework |

### Dimension-Specific Issues

**Se Framework Application < 75%:**
→ Clone não usa seus mental models corretamente
→ Ação: Revisar Layer 3 (Mental Models), adicionar mais exemplos

**Se Style Consistency < 75%:**
→ Comunicação não autêntica
→ Ação: Adicionar mais exemplos de linguagem ao KB

**Se Knowledge Depth < 75%:**
→ Clone superficial no domínio
→ Ação: Expandir KB com conteúdo específico

**Se Personality Fidelity < 75%:**
→ Valores/obsessões não aparecem
→ Ação: Fortalecer Layers 6-7 (Values, Obsessions)

---

## 🔄 Iteração Recomendada

1. **Run inicial:** Estabelecer baseline
2. **Identificar weakest dimension:** Review scores
3. **Fix específico:** Atualizar system-prompt ou KB
4. **Re-run:** Validar melhoria
5. **Repeat:** Até atingir 94%+ (excellent)

**Exemplo:**
```
Iteration 1: 78.5% (Weak: Knowledge Depth 65%)
→ Add 10 KB fragments with domain examples

Iteration 2: 85.2% (Improved! Knowledge: 82%)
→ Strengthen Layer 6 (Obsessions)

Iteration 3: 91.8% (Good! Personality: 88%)
→ Add more communication examples

Iteration 4: 94.3% ⭐ (EXCELLENT - Production ready!)
```

---

## 🐛 Troubleshooting

### Erro: Clone not found
```
⚠️  Mind 'elon_musk' not found in repository
```

**Solução:**
```bash
# Lista minds disponíveis
python3 emulator.py list-minds

# Verifica se tem system-prompt
python3 emulator.py info elon_musk
```

---

### Erro: system-prompt.md not found
```
⚠️  system-prompt.md not found in expansion-packs/mmos/minds/elon_musk
```

**Solução:**
O clone precisa ter system-prompt configurado primeiro.
Veja `expansion-packs/mmos/tasks/cognitive-analysis.md`

---

### Erro: KB exceeds limit (interactive mode)
Quando debate roda, KB deve ser pulado automaticamente (override="skip").
Se aparecer prompt interativo, algo está errado no código.

---

## 📚 Arquitetura

```
debate_engine.py
├── DebateOrchestrator         # Main controller
│   ├── load_clones()          # Load both clones
│   ├── execute_debate()       # Run all rounds
│   ├── score_fidelity()       # 5-dimension scoring
│   ├── generate_report()      # Create valuation
│   └── save_benchmark()       # Persist results
│
├── CloneContext               # Clone state
│   ├── system_prompt
│   ├── kb_content
│   └── metadata
│
├── RoundResult                # Single round
│   ├── arguments
│   ├── tokens
│   └── generation_time
│
├── FidelityScores             # 5 dimensions
│   ├── framework_application
│   ├── style_consistency
│   ├── knowledge_depth
│   ├── argument_coherence
│   └── personality_fidelity
│
└── ValuationReport            # Final output
    ├── scores
    ├── winner
    ├── analysis
    └── recommendations
```

---

## 🎯 Próximos Passos (Roadmap)

### Fase 1: LLM Integration (1-2 semanas)
- [ ] Integrar Claude API para geração de argumentos
- [ ] Implementar LLM-as-judge para scoring
- [ ] Calibrar scoring contra avaliadores humanos
- [ ] Testar com debates reais

### Fase 2: More Clones (2-3 semanas)
- [ ] Criar system-prompts para 10+ clones
- [ ] Popular KBs com conteúdo relevante
- [ ] Run benchmarks iniciais
- [ ] Iterar até 85%+ fidelity

### Fase 3: Advanced Features (2-3 semanas)
- [ ] Support para 3+ clones (roundtable)
- [ ] Debate tournaments (bracket-style)
- [ ] Custom prompt injection
- [ ] Export para PDF
- [ ] Analytics dashboard (CLI)

---

## 🤝 Contribuindo

Para melhorar o Debate Engine:

1. **Adicionar novo framework:**
   - Editar `config/debate-frameworks.yaml`
   - Adicionar round_types e instruções
   - Testar com clones existentes

2. **Melhorar scoring:**
   - Ajustar heurísticas em `_score_*` methods
   - Adicionar novos critérios
   - Validar contra humanos

3. **Criar novo clone:**
   - Seguir `tasks/cognitive-analysis.md`
   - Garantir 85%+ fidelity antes de merge
   - Adicionar benchmarks

---

## 📞 Suporte

- **Issues:** Reportar bugs no GitHub
- **Docs:** Ver `/expansion-packs/mmos/README.md` para scripts e `/docs/mmos/` para outputs
- **Exemplos:** `/temp/debates/` tem exemplos de output

---

**Versão:** 1.0.0
**Autor:** MMOS Mind Mapper Team
**Criado:** 2025-10-14
**Última Atualização:** 2025-10-14
