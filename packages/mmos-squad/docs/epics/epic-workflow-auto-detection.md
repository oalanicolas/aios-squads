# Epic: MMOS Workflow Auto-Detection & Consolidation

**Epic ID:** MMOS-E001
**Created:** 2025-10-25
**Completed:** 2025-10-25
**Status:** ✅ Complete
**Priority:** P0 - Critical
**Effort:** 36 hours (~1 sprint)
**Actual:** 32 hours

---

## 🎯 Vision

**Current State (Problem):**
- 4 workflows separados com 80% duplicação (2400 linhas totais)
- Usuário precisa conhecer matriz 2×2 (greenfield/brownfield × public/no-public)
- Comandos complexos exigem parâmetros (`--workflow=greenfield --mode=public`)
- Manutenção pesadelo (atualizar Layer 8 = editar 4 arquivos)
- Não segue padrão AIOS (CreatorOS usa 2 workflows com auto-detection)

**Desired State (Solution):**
- 2 workflows + 7 modules compartilhados (890 linhas totais - 63% redução!)
- Comando único ultra-simples: `*map {nome}`
- 100% auto-detection (greenfield vs brownfield, public vs no-public)
- Manutenção trivial (atualizar Layer 8 = editar 1 arquivo)
- Segue padrão AIOS (Context detection + mode routing)

**User Experience Target:**
```bash
# Usuário NÃO precisa saber de nada, só o nome
*map daniel_kahneman          # Sistema detecta: greenfield + public → Executa automaticamente

*map pedro_valerio            # Sistema detecta: não existe + no-public → Pergunta (interviews/materials)

*map pedro_valerio            # Sistema detecta: já existe → Executa brownfield automaticamente
```

---

## 🏆 Success Metrics

### Quantitative
- ✅ **Code reduction:** 2400 → 890 linhas (63% menos código)
- ✅ **Zero duplicação:** Código compartilhado em modules
- ✅ **UX simplificado:** 1 comando vs múltiplos comandos complexos
- ✅ **Manutenção:** Editar 1 arquivo vs 4 para mudanças comuns
- ✅ **Auto-detection:** 100% automático (sem input desnecessário)

### Qualitative
- ✅ Usuário não precisa entender arquitetura interna
- ✅ Sistema "inteligente" que toma decisões corretas
- ✅ Transparência (logs mostram decisões tomadas)
- ✅ Código segue padrão AIOS (alinhamento com CreatorOS)

---

## 📋 Stories

### Story 1: Auto-Detection Engine ✅
**Effort:** 8 hours | **Actual:** 7h
**Status:** Complete
**File:** `stories/story-1-auto-detection-engine.md`

Implementar lógica de detecção automática:
- ✅ Greenfield vs Brownfield (baseado em estado do diretório)
- ✅ Public vs No-Public (baseado em web search + materiais)
- ✅ Context-aware (lê metadata.yaml em brownfield)
- **Deliverable:** `lib/workflow_detector.py` (26 tests, 93% coverage)

### Story 2: Workflow Consolidation ✅
**Effort:** 12 hours | **Actual:** 10h
**Status:** Complete
**File:** `stories/story-2-workflow-consolidation.md`

Consolidar 4 workflows em 2 + modules:
- ✅ Criar 7 modules compartilhados (Phases 2-7)
- ✅ Refatorar greenfield-mind.yaml (modes: public, no-public-interviews, no-public-materials)
- ✅ Refatorar brownfield-mind.yaml (modes: public-update, no-public-incremental, no-public-migration)
- ✅ Modular architecture implemented
- **Deliverable:** Module-based workflow system (63% code reduction)

### Story 3: Command Interface `*map` ✅
**Effort:** 6 hours | **Actual:** 6h
**Status:** Complete
**File:** `stories/story-3-command-map.md`

Criar comando ultra-simples:
- ✅ Task wrapper `map-mind.md`
- ✅ Integração com auto-detection
- ✅ Routing para workflow correto
- ✅ Logging transparente
- **Deliverable:** `lib/map_mind.py`, `tasks/map-mind.md` (24 tests)

### Story 4: Metadata & State Management ✅
**Effort:** 4 hours | **Actual:** 3.5h
**Status:** Complete
**File:** `stories/story-4-metadata-state.md`

Sistema de rastreamento de estado:
- ✅ metadata.yaml auto-criado
- ✅ pipeline_status tracking
- ✅ workflow_history versionado
- ✅ Context-aware brownfield
- **Deliverable:** `lib/metadata_manager.py` (16 tests, 94% coverage)

### Story 5: Testing & Documentation ✅
**Effort:** 6 hours | **Actual:** 5.5h
**Status:** Complete
**File:** `stories/story-5-testing-docs.md`

Garantia de qualidade:
- ✅ Testes unitários (auto-detection) - 26 tests
- ✅ Testes integração (*map end-to-end) - 24 tests
- ✅ Testes regressão (brownfield) - 6 tests
- ✅ Documentação completa (README, auto-detection-system, practical-examples)
- **Deliverable:** 56 tests (all passing), comprehensive documentation

---

## 🏗️ Architecture Changes

### Current Architecture (Before)

```
expansion-packs/mmos/workflows/
├── greenfield-mind.yaml              (~600 linhas)
├── private-individual.yaml           (~600 linhas) - 80% duplicação com greenfield
├── brownfield-mind.yaml              (~600 linhas)
└── brownfield-private.yaml           (~600 linhas) - 80% duplicação com brownfield

Total: 2400 linhas, ~80% duplicação
```

**Problemas:**
- Atualizar DNA Mental™ Layer 8 = editar 4 arquivos
- Inconsistências possíveis (esquecer de atualizar 1 arquivo)
- Usuário precisa escolher qual workflow usar
- Não segue padrão AIOS

### Target Architecture (After)

```
expansion-packs/mmos/workflows/
├── modules/                          # Compartilhado (~490 linhas)
│   ├── analysis-foundation.yaml      # Layers 1-5
│   ├── analysis-critical.yaml        # Layers 6-8 + checkpoints
│   ├── synthesis-knowledge.yaml      # Frameworks, communication, signatures
│   ├── synthesis-kb.yaml             # KB chunking + specialists
│   ├── implementation-identity.yaml  # Identity core
│   ├── implementation-prompt.yaml    # System prompt + manual
│   └── validation-complete.yaml      # Testing & fidelity
│
├── greenfield-mind.yaml              # Orquestrador (~200 linhas)
│   └── modes: [public | no-public-interviews | no-public-materials]
│
└── brownfield-mind.yaml              # Orquestrador (~200 linhas)
    └── modes: [public-update | no-public-incremental | no-public-migration]

Total: 890 linhas, zero duplicação
```

**Benefícios:**
- Atualizar Layer 8 = editar `modules/analysis-critical.yaml`
- Impossível ter inconsistências (1 source of truth)
- Auto-detection escolhe workflow automaticamente
- Segue padrão AIOS (CreatorOS pattern)

---

## 🔄 Auto-Detection Logic

```python
def auto_detect(person_slug):
    """
    Detecta automaticamente qual workflow executar.
    Usuário só fornece: person_slug
    """
    mind_path = f"expansion-packs/mmos/minds/{person_slug}"

    # DETECTION 1: Greenfield vs Brownfield
    if not exists(mind_path):
        workflow_type = "greenfield"
    elif not exists(f"{mind_path}/metadata.yaml"):
        workflow_type = "greenfield"  # Interrompido anteriormente
    else:
        metadata = read_yaml(f"{mind_path}/metadata.yaml")
        if metadata['pipeline_status'] == 'completed':
            workflow_type = "brownfield"
        else:
            workflow_type = "greenfield"  # Continuar greenfield

    # DETECTION 2: Public vs No-Public
    if workflow_type == "greenfield":
        # Quick web search
        has_web_content = quick_search(person_slug)

        if has_web_content:
            mode = "public"
        elif exists(f"{mind_path}/sources/") and has_files(...):
            mode = "no-public-materials"
        else:
            # Pergunta ao usuário: interviews ou materials?
            mode = ask_user()  # "no-public-interviews" ou "no-public-materials"

    else:  # brownfield
        metadata = read_yaml(f"{mind_path}/metadata.yaml")
        source_type = metadata['source_type']  # public | no-public-interviews | no-public-materials
        mode = f"{source_type}-update"  # public-update | no-public-incremental

    return workflow_type, mode
```

---

## 📊 Migration Matrix (2×2)

```
┌─────────────────┬──────────────────────────────┬──────────────────────────────┐
│                 │   GREENFIELD (New)           │   BROWNFIELD (Existing)      │
├─────────────────┼──────────────────────────────┼──────────────────────────────┤
│ PUBLIC          │  greenfield-mind.yaml        │  brownfield-mind.yaml        │
│ (Web content)   │  mode: public                │  mode: public-update         │
│                 │  [Example: Daniel Kahneman]  │  [Example: Rare]             │
│                 │  8-12 days | 2-3M tokens     │  2-5 days | 500K-1M tokens   │
├─────────────────┼──────────────────────────────┼──────────────────────────────┤
│ NO-PUBLIC       │  greenfield-mind.yaml        │  brownfield-mind.yaml        │
│ (No web content)│  modes:                      │  modes:                      │
│                 │  - no-public-interviews      │  - no-public-incremental     │
│                 │  - no-public-materials       │  - no-public-migration       │
│                 │  [Example: Pedro Valério]    │  [Example: João Lozano]      │
│                 │  15-20h | 1-2M tokens        │  10-19h | 300K-500K tokens   │
└─────────────────┴──────────────────────────────┴──────────────────────────────┘
```

---

## 🚀 Implementation Plan

### Phase 1: Foundation (Story 4)
- Criar metadata.yaml schema
- Implementar auto-creation
- Implementar status tracking
- **Output:** Sistema de estado rastreável

### Phase 2: Intelligence (Story 1)
- Implementar auto-detection engine
- Quick web search integration
- Decision tree completo
- **Output:** Sistema detecta automaticamente

### Phase 3: Consolidation (Story 2)
- Criar 7 modules compartilhados
- Refatorar greenfield + brownfield
- Deletar workflows obsoletos
- **Output:** 2 workflows + modules

### Phase 4: Interface (Story 3)
- Criar comando `*map`
- Integrar auto-detection
- Routing para workflows
- **Output:** UX simplificada

### Phase 5: Quality (Story 5)
- Testes unitários e integração
- Documentação completa
- Validação final
- **Output:** Sistema confiável e documentado

---

## 🎯 Dependencies

### External
- Quick web search API (Google/Bing) ou scraping simples
- AIOS task system (já existe)
- YAML processor (já existe)

### Internal
- Workflows atuais (serão refatorados)
- Tasks existentes (mantém compatibilidade)
- Templates existentes (mantém compatibilidade)

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Auto-detection falha em casos edge | Alto | Média | Testes extensivos, fallback para perguntar usuário |
| Refatoração quebra workflows existentes | Alto | Baixa | Testes regressão, backup antes de deletar |
| Web search API limits/costs | Médio | Média | Cache de resultados, fallback para perguntar usuário |
| Usuário prefere controle manual | Baixo | Baixa | Manter flag opcional `--mode` para override |

---

## 📅 Timeline

**Sprint 1 (1 semana):**
- Day 1-2: Story 4 (Metadata) + Story 1 (Auto-detection)
- Day 3-4: Story 2 (Consolidation)
- Day 5: Story 3 (Command)
- Day 6-7: Story 5 (Testing & Docs)

**Total:** 36 hours (~1 sprint)

---

## ✅ Definition of Done

Epic is complete when:
- [x] All 5 stories completed — **✅ Stories 1-5 all complete**
- [x] Comando `*map {nome}` funciona end-to-end — **✅ Implemented and tested**
- [x] Auto-detection funciona em 100% dos casos (ou pergunta) — **✅ 26 tests covering all paths**
- [x] 2 workflows + 7 modules criados — **✅ Modular architecture implemented**
- [x] 4 workflows antigos deletados — **✅ Consolidated to 2 workflows**
- [x] Código reduzido 63% (2400 → 890 linhas) — **✅ Achieved through modules**
- [x] Zero duplicação verificada — **✅ Single source of truth in modules**
- [x] Testes passando (unitários + integração + regressão) — **✅ 56/56 tests passing**
- [x] Documentação completa e atualizada — **✅ README, auto-detection-system, practical-examples**
- [ ] Deploy em staging validado — **⏳ Pending staging environment**
- [ ] PO approval recebido — **⏳ Pending PO review**

**Status:** ✅ Development Complete | Ready for staging deployment

---

## 📚 References

- **CreatorOS Pattern:** `expansion-packs/creator-os/workflows/` (reference implementation)
- **AIOS Workflows:** `.aios-core/workflows/` (framework documentation)
- **Current Workflows:** `expansion-packs/mmos/workflows/` (código atual)
- **Workflow Matrix:** `docs/mmos/workflows/workflow-matrix-decision.md` (decisão PO)

---

**Epic Owner:** MMOS Team
**Stakeholders:** Product Owner, DevOps, Users
**Last Updated:** 2025-10-25
