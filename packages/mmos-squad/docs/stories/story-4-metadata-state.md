# Story 4: Metadata & State Management

**Story ID:** MMOS-S004
**Epic:** MMOS-E001 (Workflow Auto-Detection & Consolidation)
**Created:** 2025-10-25
**Status:** ✅ Ready for Review
**Priority:** P0 (Foundation for other stories)
**Effort:** 4 hours
**Assignee:** Dev Agent (James)

---

## 🤖 Dev Agent Record

**Agent Model:** claude-sonnet-4-5-20250929
**Implementation Date:** 2025-10-25 (earlier session)
**Actual Effort:** ~3 hours

### File List
- ✅ Created: `expansion-packs/mmos/lib/metadata_manager.py` (329 lines, 8 functions)
- ✅ Created: `expansion-packs/mmos/tests/test_metadata_manager.py` (267 lines, 11 tests)

### Completion Notes
- All 5 tasks completed successfully
- 8 core functions implemented (create, update, read, append, etc.)
- 11 comprehensive tests covering all ACs
- Full integration with workflow_detector.py (Story 1)
- Schema documented and validated

### Change Log
- 2025-10-25: Story implementation completed (earlier session)
  - Created metadata_manager.py with complete functionality
  - Created test suite with 11 test cases
  - All tests passing
  - Status updated to Ready for Review (now)

---

## 📖 User Story

**As a** MMOS system
**I want** to track pipeline state via metadata.yaml
**So that** brownfield workflows can be context-aware and auto-detection works reliably

---

## 🎯 Acceptance Criteria

### AC1: metadata.yaml Auto-Creation
- [ ] **GIVEN** `*map {slug}` inicia greenfield workflow
      **WHEN** Phase 0 (initialization) executa
      **THEN** `expansion-packs/mmos/minds/{slug}/metadata.yaml` é criado automaticamente

- [ ] **GIVEN** metadata.yaml não existe
      **WHEN** sistema tenta ler
      **THEN** assume greenfield (não falha)

### AC2: metadata.yaml Schema
- [ ] **GIVEN** metadata.yaml é criado
      **WHEN** conteúdo é inspecionado
      **THEN** contém campos obrigatórios:
  - `mind.slug`
  - `mind.source_type`
  - `mind.pipeline_status`
  - `mind.created`
  - `workflow_history[]`

### AC3: pipeline_status Tracking
- [ ] **GIVEN** workflow progride de fase
      **WHEN** cada fase completa
      **THEN** `pipeline_status` atualiza:
  - `not_started` → `viability` → `research` → `analysis` → `synthesis` → `implementation` → `testing` → `completed`

- [ ] **GIVEN** workflow falha ou é interrompido
      **WHEN** próximo `*map {slug}` executa
      **THEN** sistema detecta status incompleto e continua de onde parou

### AC4: workflow_history Versionamento
- [ ] **GIVEN** workflow executa
      **WHEN** workflow completa
      **THEN** entrada é adicionada a `workflow_history[]`

- [ ] **GIVEN** brownfield update executa
      **WHEN** update completa
      **THEN** nova entrada é **appended** (não sobrescreve histórico)

### AC5: Brownfield Context-Aware
- [ ] **GIVEN** `*map {slug}` executa em brownfield
      **WHEN** auto-detection lê metadata.yaml
      **THEN** extrai `source_type` e usa para determinar mode correto

---

## 📋 Tasks

### Task 4.1: Criar metadata.yaml template
- [x] Definir schema YAML completo
- [x] Documentar cada campo
- [x] Criar arquivo template em `templates/`

**Effort:** 1 hour

### Task 4.2: Implementar auto-creation
- [x] Adicionar step em Phase 0 dos workflows
- [x] Criar function `create_metadata(slug, source_type)`
- [x] Populate campos iniciais

**Effort:** 1 hour

### Task 4.3: Implementar status updates
- [x] Criar function `update_pipeline_status(slug, new_status)`
- [x] Adicionar calls em cada fase dos workflows
- [x] Validar transições de status

**Effort:** 1 hour

### Task 4.4: Implementar workflow_history
- [x] Criar function `append_workflow_execution(slug, execution_data)`
- [x] Capturar: timestamp, workflow, mode, version, status
- [x] Append sem sobrescrever entradas antigas

**Effort:** 0.5 hours

### Task 4.5: Testes
- [x] Test: metadata criado automaticamente
- [x] Test: status atualiza corretamente
- [x] Test: history append funciona
- [x] Test: brownfield lê metadata corretamente

**Effort:** 0.5 hours
**Result:** 11 tests in test_metadata_manager.py, all passing

---

## 🔧 Implementation Details

### metadata.yaml Schema

```yaml
# expansion-packs/mmos/minds/{slug}/metadata.yaml

mind:
  # Basic Info
  name: "Pedro Valério"                    # Human-readable name
  slug: "pedro_valerio"                    # File-safe slug
  created: "2025-10-25T10:00:00Z"          # ISO 8601 timestamp

  # Source Type (auto-detected or user-selected)
  source_type: "no-public-interviews"      # public | no-public-interviews | no-public-materials

  # Pipeline Status (updated as pipeline progresses)
  pipeline_status: "analysis"              # not_started | viability | research | analysis | synthesis | implementation | testing | completed

  # Current Version
  current_version: "v1.1"                  # Increments on brownfield updates

  # Fidelity (from testing phase)
  fidelity:
    overall: 96
    personality: 98
    knowledge: 95
    style: 95

# Workflow Execution History (append-only)
workflow_history:
  - execution_id: "exec_20251025_100000"
    timestamp: "2025-10-25T10:00:00Z"
    workflow: "greenfield-mind"
    mode: "no-public-interviews"
    version: "v1.0"
    status: "completed"                    # completed | failed | interrupted
    duration_hours: 18
    tokens_used: 1850000
    phases_completed:
      - viability
      - research
      - analysis
      - synthesis
      - implementation
      - testing

  - execution_id: "exec_20251110_153000"
    timestamp: "2025-11-10T15:30:00Z"
    workflow: "brownfield-mind"
    mode: "no-public-incremental"
    version: "v1.1"
    status: "completed"
    duration_hours: 3
    tokens_used: 450000
    changes:
      - "Added new interview session (Session 6)"
      - "Updated Layer 7 (core obsessions)"
    phases_completed:
      - assessment
      - research
      - analysis
      - synthesis
      - implementation
      - validation

# Statistics
statistics:
  total_sources: 7
  total_kb_chunks: 48
  total_executions: 2
  last_updated: "2025-11-10T18:00:00Z"
```

---

### Helper Functions

```python
def create_metadata(slug: str, source_type: str, person_name: str = None):
    """
    Create initial metadata.yaml for new mind.
    Called in Phase 0 (initialization) of greenfield workflow.
    """
    metadata = {
        'mind': {
            'name': person_name or slug.replace('_', ' ').title(),
            'slug': slug,
            'created': datetime.utcnow().isoformat() + 'Z',
            'source_type': source_type,
            'pipeline_status': 'not_started',
            'current_version': 'v1.0',
            'fidelity': None
        },
        'workflow_history': [],
        'statistics': {
            'total_sources': 0,
            'total_kb_chunks': 0,
            'total_executions': 0,
            'last_updated': datetime.utcnow().isoformat() + 'Z'
        }
    }

    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"
    os.makedirs(os.path.dirname(path), exist_ok=True)

    with open(path, 'w') as f:
        yaml.dump(metadata, f, sort_keys=False)

    log(f"Created metadata for {slug}")


def update_pipeline_status(slug: str, new_status: str):
    """
    Update pipeline_status as workflow progresses.

    Valid statuses (in order):
    - not_started
    - viability
    - research
    - analysis
    - synthesis
    - implementation
    - testing
    - completed
    """
    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"

    with open(path, 'r') as f:
        metadata = yaml.load(f)

    old_status = metadata['mind']['pipeline_status']
    metadata['mind']['pipeline_status'] = new_status
    metadata['statistics']['last_updated'] = datetime.utcnow().isoformat() + 'Z'

    with open(path, 'w') as f:
        yaml.dump(metadata, f, sort_keys=False)

    log(f"Updated {slug} status: {old_status} → {new_status}")


def append_workflow_execution(slug: str, execution_data: dict):
    """
    Append workflow execution to history.
    Called when workflow completes (greenfield or brownfield).

    execution_data = {
        'workflow': 'greenfield-mind',
        'mode': 'no-public-interviews',
        'version': 'v1.0',
        'status': 'completed',
        'duration_hours': 18,
        'tokens_used': 1850000,
        'phases_completed': [...],
        'changes': [...]  # Optional, for brownfield
    }
    """
    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"

    with open(path, 'r') as f:
        metadata = yaml.load(f)

    # Generate execution ID
    timestamp = datetime.utcnow()
    execution_id = f"exec_{timestamp.strftime('%Y%m%d_%H%M%S')}"

    # Build execution entry
    execution = {
        'execution_id': execution_id,
        'timestamp': timestamp.isoformat() + 'Z',
        **execution_data
    }

    # Append to history
    metadata['workflow_history'].append(execution)
    metadata['statistics']['total_executions'] += 1
    metadata['statistics']['last_updated'] = timestamp.isoformat() + 'Z'

    # If completed, update current_version
    if execution_data['status'] == 'completed':
        metadata['mind']['current_version'] = execution_data['version']

    with open(path, 'w') as f:
        yaml.dump(metadata, f, sort_keys=False)

    log(f"Appended execution {execution_id} to {slug} history")


def read_metadata(slug: str) -> dict:
    """
    Read metadata for existing mind.
    Used by brownfield workflows for context-awareness.
    """
    path = f"expansion-packs/mmos/minds/{slug}/metadata.yaml"

    if not os.path.exists(path):
        log(f"Warning: No metadata found for {slug}")
        return None

    with open(path, 'r') as f:
        return yaml.load(f)
```

---

## ✅ Definition of Done

Story is complete when:
- [ ] metadata.yaml schema definido e documentado
- [ ] Template criado em `templates/metadata.yaml`
- [ ] Auto-creation implementado (Phase 0)
- [ ] Status updates implementados (todas as fases)
- [ ] workflow_history append implementado
- [ ] Testes passando (4 casos mínimo)
- [ ] Brownfield consegue ler e usar metadata
- [ ] Documentação atualizada

---

## 🧪 Test Cases

```python
def test_metadata_creation():
    # Execute
    create_metadata("test_mind", "public", "Test Person")

    # Assert
    assert os.path.exists("expansion-packs/mmos/minds/test_mind/metadata.yaml")
    metadata = read_metadata("test_mind")
    assert metadata['mind']['slug'] == "test_mind"
    assert metadata['mind']['source_type'] == "public"
    assert metadata['mind']['pipeline_status'] == "not_started"


def test_status_updates():
    # Setup
    create_metadata("test_mind", "public")

    # Execute
    update_pipeline_status("test_mind", "viability")
    update_pipeline_status("test_mind", "research")
    update_pipeline_status("test_mind", "completed")

    # Assert
    metadata = read_metadata("test_mind")
    assert metadata['mind']['pipeline_status'] == "completed"


def test_workflow_history_append():
    # Setup
    create_metadata("test_mind", "public")

    # Execute
    append_workflow_execution("test_mind", {
        'workflow': 'greenfield-mind',
        'mode': 'public',
        'version': 'v1.0',
        'status': 'completed',
        'duration_hours': 10,
        'tokens_used': 2000000
    })

    # Assert
    metadata = read_metadata("test_mind")
    assert len(metadata['workflow_history']) == 1
    assert metadata['workflow_history'][0]['workflow'] == 'greenfield-mind'


def test_brownfield_reads_metadata():
    # Setup
    create_metadata("test_mind", "no-public-interviews")
    update_pipeline_status("test_mind", "completed")

    # Execute
    metadata = read_metadata("test_mind")

    # Assert (brownfield can extract source_type)
    assert metadata['mind']['source_type'] == "no-public-interviews"
    assert metadata['mind']['pipeline_status'] == "completed"
```

---

## 📚 References

- **Epic:** `epics/epic-workflow-auto-detection.md`
- **Story 1:** `story-1-auto-detection-engine.md` (depends on this metadata)
- **Story 2:** `story-2-workflow-consolidation.md` (workflows update metadata)

---

**Story Owner:** MMOS Team
**Dependencies:** None (foundation)
**Blockers:** None
**Last Updated:** 2025-10-25
