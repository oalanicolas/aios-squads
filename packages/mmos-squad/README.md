# MMOS - Mental Model Operating System

> **Create high-fidelity cognitive clones from any source material**

MMOS (Mental Model Operating System) is an AI-orchestrated system for creating cognitive clones - AI models that think, communicate, and make decisions like specific individuals.

---

## 🚀 Quick Start

### Create a New Clone

```bash
*map daniel_kahneman    # Auto-detects: public figure (web scraping)
*map pedro_valerio      # Auto-detects: private person (asks for sources)
```

That's it! The system automatically:
- ✅ Detects if the person has public content or not
- ✅ Chooses the right workflow (greenfield vs brownfield)
- ✅ Selects the appropriate mode (public, interviews, or materials)
- ✅ Executes the full MMOS pipeline

### Update an Existing Clone

```bash
*map pedro_valerio      # Auto-detects: brownfield (reads metadata)
```

The system automatically resumes or updates existing clones.

---

## 📊 MMOS Workflow Matrix (2×2)

MMOS supports **4 workflow combinations** via intelligent auto-detection:

```
┌─────────────┬─────────────────────┬────────────────────────┐
│             │   GREENFIELD        │   BROWNFIELD           │
│             │   (New Clone)       │   (Update Existing)    │
├─────────────┼─────────────────────┼────────────────────────┤
│ PUBLIC      │  Auto-detected      │  Auto-detected         │
│ (Web)       │  `*map {name}`      │  `*map {name}`         │
│             │  8-12 days          │  2-5 days              │
│             │  2-3M tokens        │  500K-1M tokens        │
│             │                     │                        │
│ Examples:   │  Daniel Kahneman    │  Rare                  │
│             │  Naval Ravikant     │                        │
├─────────────┼─────────────────────┼────────────────────────┤
│ NO-PUBLIC   │  Auto-detected      │  Auto-detected         │
│ (Private)   │  User guided        │  Context-aware         │
│             │  15-20h             │  10-19h                │
│             │  1-2M tokens        │  300K-500K tokens      │
│             │                     │                        │
│ Examples:   │  Pedro Valério      │  João Lozano           │
│             │  Private executive  │  (updates)             │
└─────────────┴─────────────────────┴────────────────────────┘
```

**You just type:** `*map {name}` — System handles everything!

---

## 🧠 How Auto-Detection Works

### Detection Logic

1. **Workflow Type Detection** (Greenfield vs Brownfield)
   - `expansion-packs/mmos/minds/{slug}/` doesn't exist → **greenfield**
   - `metadata.yaml` doesn't exist → **greenfield**
   - `pipeline_status != "completed"` → **greenfield**
   - `pipeline_status == "completed"` → **brownfield**

2. **Mode Detection** (Public vs No-Public)
   - **Greenfield:**
     - Quick web search finds content → **public**
     - `sources/` has files → **no-public-materials**
     - Otherwise → Ask user (interviews or materials)

   - **Brownfield:**
     - Reads `source_type` from metadata
     - `public` → **public-update**
     - `no-public-*` → **no-public-incremental**

---

## 🏗️ Architecture

### Modular System (Epic E001)

MMOS uses a **module-based architecture** with zero code duplication:

```
expansion-packs/mmos/
├── workflows/
│   ├── modules/                      # Shared components (~490 lines)
│   │   ├── analysis-foundation.yaml
│   │   ├── analysis-critical.yaml
│   │   ├── synthesis-knowledge.yaml
│   │   ├── synthesis-kb.yaml
│   │   ├── implementation-identity.yaml
│   │   ├── implementation-prompt.yaml
│   │   └── validation-complete.yaml
│   │
│   ├── greenfield-mind.yaml          # Orchestrator (~200 lines)
│   └── brownfield-mind.yaml          # Orchestrator (~200 lines)
│
├── lib/                              # Python utilities
│   ├── workflow_detector.py          # Auto-detection engine
│   ├── metadata_manager.py           # State management
│   └── map_mind.py                   # Command interface
│
├── tasks/                            # Executable tasks
│   ├── auto-detect-workflow.md
│   └── map-mind.md
│
└── tests/                            # 56 tests, 93%+ coverage
    ├── test_workflow_detector.py
    ├── test_metadata_manager.py
    └── test_map_mind.py
```

**Benefits:**
- ✅ 63% code reduction (2400 → 890 lines)
- ✅ Zero duplication
- ✅ Easy maintenance
- ✅ Follows AIOS patterns

---

## 📖 Usage Examples

### Example 1: Clone Daniel Kahneman (Public Figure)

```bash
*map daniel_kahneman
```

Auto-detects greenfield + public mode → Executes full pipeline
**Output:** `expansion-packs/mmos/minds/daniel_kahneman/`
**Timeline:** 8-12 days | 2-3M tokens

### Example 2: Clone Pedro Valério (Private - Interviews)

```bash
*map pedro_valerio
```

Auto-detects greenfield + no-public → Asks for source type
**Timeline:** 15-20h | 1-2M tokens

### Example 3: Update Existing Clone

```bash
*map pedro_valerio
```

Auto-detects brownfield → Incremental update
**Timeline:** 10-19h | 300K-500K tokens

### Example 4: Force Specific Mode

```bash
*map person_name --force-mode=public
*map person_name --materials-path=./sources/
```

---

## 🧪 Testing

```bash
cd expansion-packs/mmos
./venv/bin/pytest tests/ -v --cov=lib
```

**Coverage:**
- metadata_manager.py: 94%
- workflow_detector.py: 93%
- map_mind.py: 62% (core logic fully tested)

**56 tests:** All passing ✅

---

## 📚 Documentation

- **Epic:** `docs/epics/epic-workflow-auto-detection.md`
- **Stories:** `docs/stories/story-1` through `story-5`
- **PRD:** `docs/prd/mmos-prd.md`
- **Methodology:** `docs/methodology/dna-mental.md`

---

## 🛠️ Advanced Usage

### Metadata Structure

```yaml
mind:
  slug: "daniel_kahneman"
  source_type: "public"
  pipeline_status: "completed"
  fidelity:
    overall: 96

workflow_history:
  - execution_id: "exec_20251025"
    workflow: "greenfield-mind"
    mode: "public"
    status: "completed"
```

### Troubleshooting

**Auto-detection fails:**
```bash
*map person_name --force-mode=public
```

**Materials not found:**
```bash
*map person_name --materials-path=./sources/
```

---

## 🎯 Status

**Epic E001:** Workflow Auto-Detection & Consolidation
- ✅ Stories 1-4 Complete
- 🚧 Story 5: Testing & Documentation (In Progress)

**Production Status:** Ready for testing

---

**MMOS v3.0** | Epic E001 | Last Updated: 2025-10-25
