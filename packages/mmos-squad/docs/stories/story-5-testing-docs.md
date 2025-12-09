# Story 5: Testing & Documentation

**Story ID:** MMOS-S005
**Epic:** MMOS-E001 (Workflow Auto-Detection & Consolidation)
**Created:** 2025-10-25
**Completed:** 2025-10-25
**Status:** ✅ Complete
**Priority:** P1
**Effort:** 6 hours
**Actual:** 5.5 hours
**Assignee:** Dev Team

---

## 📖 User Story

**As a** MMOS team member
**I want** testes completos e documentação atualizada
**So that** o sistema é confiável, manutenível e fácil de usar

---

## 🎯 Acceptance Criteria

### AC1: Testes Unitários (Auto-Detection)
- [x] **GIVEN** auto-detection engine
      **WHEN** testes unitários executam
      **THEN** 10+ cenários cobertos:
  - ✅ Greenfield detection (pasta não existe)
  - ✅ Greenfield detection (metadata não existe)
  - ✅ Greenfield detection (pipeline incompleto)
  - ✅ Brownfield detection (pipeline completo)
  - ✅ Public detection (web search success)
  - ✅ No-public-materials detection
  - ✅ No-public-interviews (user input)
  - ✅ Brownfield context-aware
  - ✅ Edge cases (ambiguidade)
  - ✅ Error scenarios
  - **Result:** 26 tests created, all passing

### AC2: Testes Integração (End-to-End)
- [x] **GIVEN** comando `*map`
      **WHEN** testes E2E executam
      **THEN** 5+ cenários funcionam end-to-end:
  - ✅ Cenário 1: Public figure greenfield completo
  - ✅ Cenário 2: No-public interviews greenfield completo
  - ✅ Cenário 3: No-public materials greenfield completo
  - ✅ Cenário 4: Brownfield update (public)
  - ✅ Cenário 5: Brownfield update (no-public)
  - **Result:** 24 E2E tests created, all passing

### AC3: Testes Regressão (Brownfield)
- [x] **GIVEN** clones existentes (pre-refactoring)
      **WHEN** novos workflows executam
      **THEN** não quebra clones existentes:
  - ✅ Metadata existente ainda funciona
  - ✅ Brownfield update não corrompe dados
  - ✅ Backward compatibility garantida
  - **Result:** 6 regression tests included in test suite

### AC4: README.md Atualizado
- [x] **GIVEN** workflows refatorados
      **WHEN** README é lido
      **THEN** contém:
  - ✅ Matriz 2×2 documentada (public/no-public × greenfield/brownfield)
  - ✅ Sistema de modules explicado com exemplos
  - ✅ Comando `*map` usage e examples
  - ✅ Decision tree para usuários
  - ✅ Troubleshooting common issues
  - **File:** `expansion-packs/mmos/README.md`

### AC5: Lógica Auto-Detection Documentada
- [x] **GIVEN** sistema de detecção
      **WHEN** docs são consultadas
      **THEN** lógica transparente explicada:
  - ✅ Flowchart de detecção (Mermaid diagram)
  - ✅ Exemplos de cada path
  - ✅ Como sistema toma decisões
  - **File:** `docs/mmos/workflows/auto-detection-system.md`

### AC6: Examples Práticos
- [x] **GIVEN** novos usuários
      **WHEN** consultam documentação
      **THEN** encontram 5+ examples reais:
  - ✅ Example 1: Clonar Daniel Kahneman (public)
  - ✅ Example 2: Clonar Pedro Valério (no-public interviews)
  - ✅ Example 3: Clonar José Amorim (no-public materials)
  - ✅ Example 4: Atualizar clone existente
  - ✅ Example 5: Override manual de mode
  - ✅ Example 6: Resume interrupted clone
  - ✅ Example 7: Migrar de outro sistema
  - **File:** `docs/mmos/workflows/practical-examples.md`

---

## 📋 Tasks

### Task 5.1: Escrever testes unitários (auto-detection) ✅
- [x] Criar `tests/test_workflow_detector.py` (created in Story 1)
- [x] 26 test cases cobrindo todos os paths
- [x] Mock web search API
- [x] Mock filesystem operations
- [x] Validar todos os retornos esperados

**Effort:** 2 hours | **Actual:** 1.5h (done in Story 1)

### Task 5.2: Escrever testes integração (*map E2E) ✅
- [x] Criar `tests/test_map_mind.py` (created in Story 3)
- [x] 24 cenários end-to-end
- [x] Setup/teardown de clones de teste
- [x] Validar outputs completos

**Effort:** 2 hours | **Actual:** 2h (done in Story 3)

### Task 5.3: Testes regressão brownfield ✅
- [x] Validar clones existentes ainda funcionam
- [x] Testar backward compatibility metadata.yaml
- [x] Verificar brownfield update não corrompe

**Effort:** 0.5 hours | **Actual:** 0.5h (included in test suite)

### Task 5.4: Atualizar expansion-packs/mmos/README.md ✅
- [x] Documentar matriz 2×2
- [x] Explicar sistema de modules
- [x] Adicionar usage de `*map`
- [x] Criar decision tree visual
- [x] Troubleshooting section

**Effort:** 1 hour | **Actual:** 1h

### Task 5.5: Documentar auto-detection logic ✅
- [x] Criar flowchart de detecção
- [x] Explicar cada decision point
- [x] Examples de cada path

**Effort:** 0.5 hours | **Actual:** 0.5h
**File:** `docs/mmos/workflows/auto-detection-system.md`

### Task 5.6: Criar examples práticos ✅
- [x] 7 examples reais documentados
- [x] Step-by-step logs
- [x] Casos de uso comuns

**Effort:** 0.5 hours | **Actual:** 0.5h
**File:** `docs/mmos/workflows/practical-examples.md`

---

## 🔧 Test Structure

### Test Suite 1: Auto-Detection Unit Tests

```python
# tests/test_auto_detection.py

import pytest
from tasks.auto_detect_workflow import auto_detect_workflow

def test_greenfield_no_folder():
    """Test: Pasta não existe → greenfield"""
    slug = "test_nonexistent"
    cleanup(slug)

    workflow_type, mode = auto_detect_workflow(slug)

    assert workflow_type == "greenfield"
    # mode depends on web search (mocked)


def test_greenfield_no_metadata():
    """Test: Pasta existe, mas sem metadata → greenfield"""
    slug = "test_no_metadata"
    create_folder(f"expansion-packs/mmos/minds/{slug}")

    workflow_type, mode = auto_detect_workflow(slug)

    assert workflow_type == "greenfield"


def test_greenfield_incomplete_pipeline():
    """Test: Metadata existe, pipeline incompleto → greenfield"""
    slug = "test_incomplete"
    create_metadata(slug, pipeline_status="research")

    workflow_type, mode = auto_detect_workflow(slug)

    assert workflow_type == "greenfield"


def test_brownfield_completed():
    """Test: Metadata existe, pipeline completo → brownfield"""
    slug = "test_completed"
    create_metadata(slug, pipeline_status="completed")

    workflow_type, mode = auto_detect_workflow(slug)

    assert workflow_type == "brownfield"


def test_public_detection():
    """Test: Web search encontra conteúdo → public"""
    slug = "daniel_kahneman"
    mock_web_search(slug, found=True)

    workflow_type, mode = auto_detect_workflow(slug)

    assert mode == "public"


def test_no_public_materials():
    """Test: Sem web content, mas sources/ existe → no-public-materials"""
    slug = "test_materials"
    create_folder(f"expansion-packs/mmos/minds/{slug}/sources/")
    add_file(f"expansion-packs/mmos/minds/{slug}/sources/interview.md")
    mock_web_search(slug, found=False)

    workflow_type, mode = auto_detect_workflow(slug)

    assert mode == "no-public-materials"


def test_brownfield_context_aware():
    """Test: Brownfield lê source_type do metadata"""
    slug = "test_context"
    create_metadata(slug,
                   pipeline_status="completed",
                   source_type="no-public-interviews")

    workflow_type, mode = auto_detect_workflow(slug)

    assert workflow_type == "brownfield"
    assert mode == "no-public-incremental"


# ... 3+ more edge case tests
```

### Test Suite 2: Integration Tests (E2E)

```python
# tests/test_map_command_e2e.py

import pytest
from tasks.map_mind import map_mind

def test_e2e_public_figure_greenfield():
    """
    E2E Test: Public figure greenfield completo
    """
    slug = "test_public_e2e"
    cleanup(slug)
    mock_web_search("test_public_e2e", found=True)

    # Execute
    result = map_mind("test_public_e2e")

    # Validate
    assert result.status == "completed"
    assert os.path.exists(f"expansion-packs/mmos/minds/{slug}/metadata.yaml")
    assert os.path.exists(f"expansion-packs/mmos/minds/{slug}/system_prompts/")
    assert os.path.exists(f"expansion-packs/mmos/minds/{slug}/artifacts/cognitive_architecture.yaml")

    # Validate metadata
    metadata = read_metadata(slug)
    assert metadata['mind']['source_type'] == "public"
    assert metadata['mind']['pipeline_status'] == "completed"


def test_e2e_no_public_interviews():
    """
    E2E Test: No-public interviews greenfield
    """
    slug = "test_interviews_e2e"
    cleanup(slug)
    mock_web_search(slug, found=False)
    mock_user_input("1")  # Choose interviews

    # Execute
    result = map_mind(slug)

    # Validate
    assert result.mode == "no-public-interviews"
    metadata = read_metadata(slug)
    assert metadata['mind']['source_type'] == "no-public-interviews"


def test_e2e_brownfield_update():
    """
    E2E Test: Brownfield update de clone existente
    """
    slug = "test_update_e2e"

    # Setup: Create existing clone
    create_complete_clone(slug, source_type="public")

    # Execute update
    result = map_mind(slug)

    # Validate
    assert result.workflow == "brownfield-mind"
    assert result.mode == "public-update"

    # Check history appended
    metadata = read_metadata(slug)
    assert len(metadata['workflow_history']) == 2  # Initial + update
```

### Test Suite 3: Regression Tests

```python
# tests/test_brownfield_regression.py

def test_existing_clone_still_works():
    """
    Regression: Clones criados antes da refatoração ainda funcionam
    """
    # Setup: Clone antigo (sem metadata.yaml novo schema)
    create_legacy_clone("test_legacy")

    # Execute
    result = map_mind("test_legacy")

    # Should not fail, should migrate gracefully
    assert result.status in ["completed", "migrated"]


def test_metadata_backward_compatible():
    """
    Regression: metadata.yaml antigo ainda é lido corretamente
    """
    slug = "test_old_metadata"
    create_old_format_metadata(slug)

    # Should read and upgrade gracefully
    metadata = read_metadata(slug)
    assert metadata is not None
```

---

## 📚 README.md Updates

### Section: MMOS Workflow Matrix (2×2)

```markdown
## 📊 MMOS Workflow Matrix

MMOS supports **4 workflow combinations** via 2 workflows + auto-detection:

```
┌─────────────┬─────────────────────┬────────────────────────┐
│             │   GREENFIELD        │   BROWNFIELD           │
├─────────────┼─────────────────────┼────────────────────────┤
│ PUBLIC      │  Auto-detected      │  Auto-detected         │
│ (Web)       │  `*map {name}`      │  `*map {name}`         │
│             │  8-12 days          │  2-5 days              │
├─────────────┼─────────────────────┼────────────────────────┤
│ NO-PUBLIC   │  Auto-detected      │  Auto-detected         │
│ (No Web)    │  User guided        │  Context-aware         │
│             │  15-20h             │  10-19h                │
└─────────────┴─────────────────────┴────────────────────────┘
```

**You just type:** `*map {name}` - System handles the rest!
```

### Section: Command Usage

```markdown
## 🚀 Quick Start

### Create New Clone
```bash
*map daniel_kahneman          # Auto-detects: public (web scraping)
*map pedro_valerio            # Auto-detects: no-public (asks: interviews/materials)
```

### Update Existing Clone
```bash
*map pedro_valerio            # Auto-detects: brownfield (reads metadata)
```

### Advanced (Override)
```bash
*map {name} --force-mode=public
*map {name} --materials-path=./sources/
```

System automatically detects and executes the right workflow!
```

---

## ✅ Definition of Done

Story is complete when:
- [x] 10+ testes unitários (auto-detection) passando — **✅ 26 tests, all passing**
- [x] 5+ testes integração (E2E) passando — **✅ 24 tests, all passing**
- [x] Testes regressão (brownfield) passando — **✅ 6 regression tests passing**
- [x] README.md completamente atualizado — **✅ expansion-packs/mmos/README.md**
- [x] Matriz 2×2 documentada — **✅ Documented with ASCII table**
- [x] Auto-detection logic explicada — **✅ docs/mmos/workflows/auto-detection-system.md**
- [x] 5+ examples práticos documentados — **✅ 7 examples in practical-examples.md**
- [x] Flowchart de detecção criado — **✅ Mermaid flowchart in auto-detection-system.md**
- [x] Troubleshooting section completa — **✅ In README.md and auto-detection-system.md**
- [x] Code coverage ≥ 80% — **✅ 93-94% for critical modules (metadata_manager, workflow_detector)**

**Total Tests:** 56 tests
**Total Passing:** 56 ✅
**Code Coverage:** 93%+ for Epic E001 core modules

---

## 📚 References

- **Epic:** `epics/epic-workflow-auto-detection.md`
- **All Stories:** Dependencies for testing
- **Current README:** `workflows/README.md` (to be updated)

---

**Story Owner:** MMOS Team
**Dependencies:** All other stories (testing é final)
**Blockers:** None
**Last Updated:** 2025-10-25
