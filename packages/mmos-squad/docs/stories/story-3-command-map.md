# Story 3: Command Interface `*map`

**Story ID:** MMOS-S003
**Epic:** MMOS-E001 (Workflow Auto-Detection & Consolidation)
**Created:** 2025-10-25
**Status:** 🔴 To Do
**Priority:** P0
**Effort:** 6 hours
**Assignee:** TBD

---

## 📖 User Story

**As a** MMOS user
**I want** comando ultra-simples `*map {nome}`
**So that** não preciso saber de greenfield/brownfield/public/no-public internals

---

## 🎯 Acceptance Criteria

### AC1: Comando Básico
- [ ] **GIVEN** usuário digita `*map daniel_kahneman`
      **WHEN** sistema executa
      **THEN** auto-detecta (greenfield + public) e executa workflow automaticamente

- [ ] **GIVEN** usuário digita `*map pedro_valerio` (não existe)
      **WHEN** sistema não encontra web content
      **THEN** pergunta "1. Interviews 2. Materials" e procede baseado na resposta

- [ ] **GIVEN** usuário digita `*map pedro_valerio` (já existe)
      **WHEN** sistema detecta brownfield
      **THEN** executa update automaticamente usando metadata.yaml

### AC2: Logging Transparente
- [ ] **GIVEN** `*map` executa
      **WHEN** auto-detection toma decisões
      **THEN** logs mostram:
  ```
  🔍 Auto-detecting workflow for 'daniel_kahneman'...
  ✅ Detected: greenfield (no existing clone)
  ✅ Detected: public (web content found)
  🚀 Executing: greenfield-mind.yaml (mode: public)
  ```

### AC3: Help Text
- [ ] **GIVEN** usuário digita `*map --help`
      **WHEN** help é exibido
      **THEN** mostra:
  ```
  Usage: *map {person_name}

  Examples:
    *map daniel_kahneman        # Create new clone (auto-detects public/no-public)
    *map pedro_valerio          # Update existing clone OR create new

  The system automatically detects:
  - Greenfield vs Brownfield (based on existing clone)
  - Public vs No-Public (based on web content availability)

  Advanced:
    *map {name} --force-mode=no-public-interviews
    *map {name} --materials-path=./sources/
  ```

### AC4: Error Handling
- [ ] **GIVEN** auto-detection falha (ambiguidade não resolvível)
      **WHEN** erro ocorre
      **THEN** mensagem clara com sugestões:
  ```
  ❌ Could not auto-detect workflow mode.

  Please specify manually:
    *map {name} --force-mode=public
    *map {name} --force-mode=no-public-interviews
    *map {name} --materials-path=./path/to/sources/
  ```

### AC5: Override Manual (Advanced)
- [ ] **GIVEN** usuário quer forçar mode específico
      **WHEN** `*map {name} --force-mode=public` é usado
      **THEN** skip auto-detection, use modo especificado

- [ ] **GIVEN** usuário fornece path de materiais
      **WHEN** `*map {name} --materials-path=./sources/` é usado
      **THEN** force mode = no-public-materials

### AC6: Context-Aware Brownfield
- [ ] **GIVEN** clone já existe com metadata.yaml
      **WHEN** `*map {name}` executa
      **THEN** lê `source_type` do metadata e usa mode correto automaticamente

---

## 📋 Tasks

### Task 3.1: Criar task map-mind.md
- [x] Criar `tasks/map-mind.md` (wrapper task)
- [x] Definir params: `person_name`, `force_mode` (optional), `materials_path` (optional)
- [x] Documentar usage e examples

**Effort:** 1 hour

### Task 3.2: Implementar routing logic
- [x] Call auto-detection (Story 1)
- [x] Route para greenfield-mind.yaml ou brownfield-mind.yaml
- [x] Pass detected mode para workflow

**Effort:** 2 hours

### Task 3.3: Implementar logging
- [x] Log detection steps:
  - "Auto-detecting workflow..."
  - "Detected: greenfield/brownfield"
  - "Detected mode: public/no-public-*"
  - "Executing: {workflow}.yaml (mode: {mode})"
- [x] Log transparente mas não verboso

**Effort:** 1 hour

### Task 3.4: Implementar help text
- [x] `*map --help` mostra usage
- [x] Examples claros
- [x] Documentar flags avançados

**Effort:** 0.5 hours

### Task 3.5: Implementar error handling
- [x] Catch detection failures
- [x] Mensagens claras
- [x] Sugestões de recovery

**Effort:** 0.5 hours

### Task 3.6: Implementar override flags
- [x] `--force-mode={mode}` skip detection
- [x] `--materials-path={path}` force no-public-materials
- [x] Validar flags corretos

**Effort:** 0.5 hours

### Task 3.7: Testes integração
- [x] Test: `*map {public_figure}` end-to-end
- [x] Test: `*map {no-public}` com user input
- [x] Test: `*map {existing}` brownfield
- [x] Test: `--force-mode` override
- [x] Test: `--help`

**Effort:** 0.5 hours
**Created:** test_map_mind.py with 50+ test cases

---

## 🔧 Implementation Details

### map-mind.md (Task Wrapper)

```markdown
---
task: map-mind
params:
  - person_name (required)
  - force_mode (optional)
  - materials_path (optional)
---

# Map Mind Clone

**Purpose:** Ultra-simple command for creating or updating mind clones.

## Usage

```bash
*map {person_name}                          # Auto-detect everything
*map {person_name} --force-mode={mode}      # Override auto-detection
*map {person_name} --materials-path={path}  # Provide materials
```

## Auto-Detection Logic

1. **Check if clone exists** (`expansion-packs/mmos/minds/{slug}/`)
   - Exists → Brownfield
   - Not exists → Greenfield

2. **If Greenfield:**
   - Check `--materials-path` flag
     → Provided? → mode: no-public-materials
   - Quick web search
     → Found content? → mode: public
     → Not found? → ASK USER (interviews vs materials)

3. **If Brownfield:**
   - Read `metadata.yaml` → source_type
   - Use appropriate brownfield mode

4. **Execute workflow:**
   - Greenfield: `greenfield-mind.yaml` with detected mode
   - Brownfield: `brownfield-mind.yaml` with detected mode

## Logging

All decisions are logged transparently:
```
🔍 Auto-detecting workflow for 'daniel_kahneman'...
✅ Detected: greenfield (no existing clone)
🌐 Web search: Found public content
✅ Detected mode: public
🚀 Executing: greenfield-mind.yaml (mode: public)
```

## Error Handling

If auto-detection fails:
```
❌ Could not auto-detect workflow mode for '{person_name}'.

Please specify manually:
  *map {name} --force-mode=public
  *map {name} --force-mode=no-public-interviews
  *map {name} --materials-path=./path/
```

## Examples

### Example 1: Public Figure (Auto)
```bash
*map daniel_kahneman
```
→ Auto-detects: greenfield + public
→ Executes web scraping workflow

### Example 2: No-Public (Guided)
```bash
*map pedro_valerio
```
→ Auto-detects: greenfield + no web content
→ Asks user: "1. Interviews 2. Materials"
→ User selects 1
→ Executes interview workflow

### Example 3: Update Existing
```bash
*map pedro_valerio
```
→ Auto-detects: brownfield (clone exists)
→ Reads metadata: source_type = no-public-interviews
→ Executes: brownfield no-public-incremental

### Example 4: Force Mode (Override)
```bash
*map daniel_kahneman --force-mode=public
```
→ Skips detection
→ Forces mode: public

### Example 5: Provided Materials
```bash
*map jose_amorim --materials-path=./sources/jose/
```
→ Forces mode: no-public-materials
→ Processes files in provided path
```

---

### Pseudo-code Implementation

```python
def map_mind(person_name: str, force_mode: str = None, materials_path: str = None):
    """
    Ultra-simple command for mind cloning.
    Handles all complexity internally.
    """
    slug = to_slug(person_name)

    # STEP 1: Check for override flags
    if force_mode:
        log(f"🔧 Force mode: {force_mode} (skipping detection)")
        mode = force_mode
        workflow_type = "greenfield"  # Assume greenfield if forcing
    elif materials_path:
        log(f"📁 Materials provided: {materials_path}")
        mode = "no-public-materials"
        workflow_type = "greenfield"
    else:
        # STEP 2: Auto-detect
        log(f"🔍 Auto-detecting workflow for '{person_name}'...")

        from tasks.auto_detect_workflow import auto_detect_workflow
        workflow_type, mode = auto_detect_workflow(slug)

        log(f"✅ Detected: {workflow_type}")
        log(f"✅ Detected mode: {mode}")

    # STEP 3: Route to appropriate workflow
    if workflow_type == "greenfield":
        workflow_file = "greenfield-mind.yaml"
    else:  # brownfield
        workflow_file = "brownfield-mind.yaml"

    log(f"🚀 Executing: {workflow_file} (mode: {mode})")

    # STEP 4: Execute workflow
    execute_workflow(workflow_file, mode=mode, slug=slug, materials_path=materials_path)

    log(f"✅ Workflow complete for '{person_name}'")


def execute_workflow(workflow_file: str, mode: str, slug: str, **kwargs):
    """
    Execute AIOS workflow with parameters.
    """
    # Load workflow YAML
    workflow = load_yaml(f"workflows/{workflow_file}")

    # Set mode context
    context = {
        'mode': mode,
        'slug': slug,
        **kwargs
    }

    # Execute workflow sequence
    for step in workflow['sequence']:
        # Check skip_if conditions
        if 'skip_if' in step and eval_condition(step['skip_if'], context):
            continue

        # Execute step
        execute_step(step, context)
```

---

## ✅ Definition of Done

Story is complete when:
- [ ] `*map {name}` funciona end-to-end
- [ ] Auto-detection integrado (Story 1)
- [ ] Routing para workflows correto
- [ ] Logging transparente implementado
- [ ] Help text completo
- [ ] Error handling robusto
- [ ] Override flags funcionando
- [ ] Testes integração passando (5 cenários)
- [ ] Documentação atualizada

---

## 🧪 Test Cases

```python
def test_map_public_figure():
    # Execute
    result = map_mind("daniel_kahneman")

    # Assert
    assert result.workflow == "greenfield-mind"
    assert result.mode == "public"
    assert result.status == "completed"


def test_map_no_public_with_user_input():
    # Setup
    mock_user_input("1")  # Interviews

    # Execute
    result = map_mind("pedro_valerio")

    # Assert
    assert result.mode == "no-public-interviews"


def test_map_existing_clone():
    # Setup
    create_clone("joao_lozano", source_type="no-public-interviews")

    # Execute
    result = map_mind("joao_lozano")

    # Assert
    assert result.workflow == "brownfield-mind"
    assert result.mode == "no-public-incremental"


def test_map_force_mode():
    # Execute
    result = map_mind("test_person", force_mode="public")

    # Assert
    assert result.mode == "public"
    # Auto-detection was skipped


def test_map_help():
    # Execute
    help_text = map_mind("--help")

    # Assert
    assert "Usage: *map {person_name}" in help_text
    assert "Examples:" in help_text
```

---

## 📚 References

- **Epic:** `epics/epic-workflow-auto-detection.md`
- **Story 1:** `story-1-auto-detection-engine.md` (integration dependency)
- **Story 2:** `story-2-workflow-consolidation.md` (workflow routing)

---

**Story Owner:** MMOS Team
**Dependencies:** Story 1 (Auto-detection), Story 2 (Workflows)
**Blockers:** None
**Last Updated:** 2025-10-25
