# Roundtable Preparation Checklist - ETL Architecture
**Date:** 2025-01-14
**Status:** ✅ TEAM APPROVED - Ready for Execution
**Participants:** Pedro Valério, Andrej Karpathy, Alan Nicolas, Elon Musk

---

## ✅ Pre-Session Preparation (COMPLETE)

### Documents Ready
- [x] **HANDOFF-ETL-COLLECTION-RESEARCH.md** (11.5k words)
  - 4 core problems analyzed
  - Solution options compared
  - Architecture constraints documented
  - 20+ research questions prepared
  - Expected deliverables defined

- [x] **ROUNDTABLE-TEAM-SELECTION.md** (6.5k words)
  - 34 minds analyzed
  - Top 3 selected with justifications
  - Team dynamics mapped
  - Sample dialogue patterns
  - Expected outcomes defined

- [x] **Collection Strategy (Linus Torvalds)**
  - 47 sources discovered
  - Hybrid strategy drafted
  - Current blockers identified
  - Workaround options prepared

### Participant Profiles
- [x] **Pedro Valério:** Product Owner perspective ready
- [x] **Andrej Karpathy:** Data engineering expertise ready
- [x] **Alan Nicolas:** System architecture knowledge ready
- [x] **Elon Musk:** First principles mindset ready

### Context Materials
- [x] ETL v2.0.0 current state (config.yaml, README.md)
- [x] Deprecated components analysis
- [x] MMOS pipeline requirements (research-collection.md)
- [x] Real-world source inventory (Linus sources_master.yaml)

---

## 🎯 Session Goals (DEFINED)

### Must Achieve
1. ✅ Decision on video transcription approach (AssemblyAI/Whisper/Manual)
2. ✅ Decision on email archive strategy (Full crawl/Smart sampler/Manual)
3. ✅ Decision on book processing (PDF MCP/Manual excerpts/ZLibrary)
4. ✅ Decision on orchestration (Restore v1.0/Lightweight/Skip)
5. ✅ ETL v3.0 architecture sketch (expansion-pack + aios-core integration)
6. ✅ Implementation roadmap (P0/P1/P2 tasks with estimates)
7. ✅ Linus workaround approval (unblock current clone)

### Nice to Have
- Prototype code sketches
- API interface examples
- Cost modeling spreadsheet
- Testing strategy

---

## 📋 Agenda (2.5-3 hours)

### Session 1: Problem Prioritization (30 min)
**Facilitator:** Pedro Valério

**Objectives:**
- Review 4 core problems quickly
- Rank by fidelity impact (use data from handoff)
- Identify quick wins vs long-term investments

**Key Questions:**
- Which problem blocks 94% fidelity most? (Answer: Email archives = -25%)
- Which problem is easiest to solve? (Answer: Video = 2h AssemblyAI setup)
- Which solution is most reusable? (Answer: Smart sampler for any email archive)

**Expected Output:** Priority matrix
```
Priority 1: Email archives (highest fidelity impact -25%)
Priority 2: Video transcription (medium impact -15%, easy fix)
Priority 3: Orchestration (performance not fidelity)
Priority 4: Books (lowest impact -10%, manual acceptable)
```

---

### Session 2: Solution Exploration (45 min)
**Facilitators:** Andrej Karpathy (technical), Alan Nicolas (architecture)

**Format:** Rapid-fire discussion per problem

#### Problem 1: Video Transcription (15 min)
**Karpathy leads technical analysis:**
- AssemblyAI: $23 for 35h video, 95% accuracy, speaker diarization
- Whisper local: Free, 90% accuracy, requires GPU, slow
- YouTube API: Free, 60% coverage (caption-dependent)
- Manual: 100% accuracy, 12-35h effort

**Team votes:** Likely outcome = AssemblyAI MCP (cost acceptable, quality high)

#### Problem 2: Email Archives (15 min)
**Elon challenges first principles:**
- Do we need 100k emails or just 100 key emails?
- What's marginal value of email 101-1000?

**Alan proposes architecture:**
- Smart sampler with query interface
- `sample_lkml(query="controversial threads", limit=100)`
- 2h dev, reusable, not full crawler

**Team votes:** Likely outcome = Smart sampler (pragmatic compromise)

#### Problem 3: Books/PDFs (10 min)
**Pedro advocates practical:**
- Full books nice-to-have, excerpts sufficient for most
- 15-20 pages cover key values/singularity

**Elon supports:**
- Ship manual excerpts now, PDF MCP later if needed

**Team votes:** Likely outcome = Manual excerpts (P0), PDF MCP (P2)

#### Problem 4: Orchestration (5 min)
**Karpathy notes:**
- 60% speed gain matters for 100+ minds at scale
- Doesn't matter for current Linus use case

**Alan proposes:**
- Lightweight queue (4h dev) for future-proofing

**Team votes:** Likely outcome = Lightweight queue (P1, not P0)

---

### Session 3: Architecture Design (45 min)
**Facilitator:** Alan Nicolas

**Objectives:**
- Sketch ETL v3.0 high-level architecture
- Define expansion-pack structure
- Design agnostic interface for AIOS agents
- Map integration points

#### 3.1: Expansion Pack Structure (15 min)

```
expansion-packs/etl/
├── config.yaml                    # ETL configuration
├── lib/
│   ├── collectors/
│   │   ├── video-collector.js     # AssemblyAI integration
│   │   ├── email-sampler.js       # Smart LKML/email sampling
│   │   ├── blog-collector.js      # Existing (working)
│   │   └── pdf-collector.js       # Future (P2)
│   ├── orchestrator/
│   │   └── lightweight-queue.js   # Simple job queue (P1)
│   └── api/
│       └── etl-service.js         # Agnostic interface
├── tools/
│   └── etl-collect.yaml           # AIOS tool definition
└── scripts/
    └── cli/
        └── collect.js             # Standalone CLI
```

#### 3.2: Agnostic Interface Design (15 min)

**AIOS Tool Definition:**
```yaml
# tools/etl-collect.yaml
tool: etl-collect
description: Collects sources for mind mapping using adaptive ETL pipeline
agent-access: all  # Available to all AIOS agents

parameters:
  - name: mind_slug
    required: true
    type: string

  - name: sources_master_path
    required: true
    type: file_path
    description: Path to sources_master.yaml from discovery

  - name: collection_mode
    required: false
    type: enum
    options: [full, video_only, articles_only, priority_tier_1]
    default: full

  - name: budget_constraint
    required: false
    type: object
    fields:
      max_cost_usd: number
      max_time_hours: number

outputs:
  - collection_report.yaml
  - sources/{type}/* (collected files)

integration:
  calls: lib/api/etl-service.js
  returns: collection_summary
```

**Usage from Any Agent:**
```javascript
// From research-collection task (mind-mapper agent)
const result = await tools.etlCollect({
  mind_slug: "linus_torvalds",
  sources_master_path: "expansion-packs/mmos/minds/linus_torvalds/sources/sources_master.yaml",
  collection_mode: "full",
  budget_constraint: {
    max_cost_usd: 25,
    max_time_hours: 6
  }
});

// ETL handles everything internally:
// - Reads sources_master.yaml
// - Routes to appropriate collectors (blog/video/email)
// - Manages parallel execution
// - Tracks budget/time
// - Returns summary
```

#### 3.3: Integration Points (15 min)

**MMOS → ETL Flow:**
```
1. mind-mapper runs viability-assessment
   ✅ GO decision

2. mind-mapper runs research-collection
   - Discovery phase generates sources_master.yaml
   - Calls @etl-collect tool

3. ETL expansion pack receives request
   - Loads sources_master.yaml
   - For each source:
     - Route to collector (video/email/blog)
     - Execute collection
     - Transform to markdown
     - Save to expansion-packs/mmos/minds/{slug}/sources/

4. ETL returns collection_summary
   - Total sources collected
   - Costs incurred
   - Quality metrics
   - Errors/warnings

5. mind-mapper continues to cognitive-analysis
   - Uses collected sources
```

---

### Session 4: Implementation Plan (30 min)
**Facilitator:** Elon Musk (execution focus)

**Objectives:**
- Prioritize development tasks
- Estimate effort realistically
- Define rollout strategy
- Assign responsibilities

#### 4.1: Task Prioritization

**P0: Unblock Linus Clone (IMMEDIATE)**
| Task | Effort | Owner | Deliverable |
|------|--------|-------|-------------|
| AssemblyAI MCP integration | 2h | Karpathy | lib/collectors/video-collector.js |
| Email smart sampler | 2h | Alan | lib/collectors/email-sampler.js |
| AIOS tool definition | 1h | Alan | tools/etl-collect.yaml |
| Test with Linus sources | 1h | Pedro | Validate collection |
| **Total P0** | **6h** | | **Unblocks clone creation** |

**P1: Production Readiness (WEEK 1)**
| Task | Effort | Owner | Deliverable |
|------|--------|-------|-------------|
| Lightweight orchestrator | 4h | Karpathy | lib/orchestrator/queue.js |
| Error recovery & retry | 2h | Alan | Resilient collection |
| Cost tracking | 1h | Elon | Budget monitoring |
| Collection quality validation | 2h | Pedro | Quality gates |
| **Total P1** | **9h** | | **Scalable to 10+ minds** |

**P2: Advanced Features (WEEK 2+)**
| Task | Effort | Owner | Deliverable |
|------|--------|-------|-------------|
| PDF MCP integration | 3h | Karpathy | lib/collectors/pdf-collector.js |
| Podcast collector | 4h | Karpathy | lib/collectors/podcast-collector.js |
| Social media collector | 4h | Alan | lib/collectors/social-collector.js |
| Advanced orchestration | 6h | Alan | Parallel batching |
| **Total P2** | **17h** | | **Feature complete** |

#### 4.2: Rollout Strategy

**Phase 1: MVP (Week 1)**
- Ship P0 tasks
- Unblock Linus Torvalds clone
- Validate hybrid strategy works
- **Target:** 92-94% fidelity

**Phase 2: Production (Week 2)**
- Ship P1 tasks
- Test with 3-5 additional minds
- Measure fidelity improvements
- **Target:** 94-96% fidelity consistently

**Phase 3: Scale (Week 3+)**
- Ship P2 tasks
- Support 10+ minds
- Optimize costs and performance
- **Target:** <$20/mind, <4h/mind

---

## 📦 Expected Deliverables

### Immediate (End of Session)
- [ ] **Decision Matrix** (4 problems x chosen solutions)
- [ ] **Architecture Sketch** (expansion-pack structure)
- [ ] **Implementation Roadmap** (P0/P1/P2 tasks)
- [ ] **Linus Workaround Approval** (hybrid strategy)

### Follow-Up (48h)
- [ ] **Technical Spec Document** (detailed design)
- [ ] **AssemblyAI API Key** (obtain and configure)
- [ ] **Prototype: Video Collector** (working code)
- [ ] **Prototype: Email Sampler** (working code)
- [ ] **MMOS Integration** (update research-collection.md)

---

## 🎬 Execution Options

### Option A: Live Roundtable (Synchronous)
- Schedule 2.5-3h session
- All 4 participants present
- Real-time discussion
- Immediate decisions

### Option B: AI-Simulated Roundtable (Asynchronous)
- Use Task tool to invoke each mind
- Simulate discussion based on personas
- Generate consensus decisions
- Faster (1h vs 3h)

### Option C: Hybrid
- AI simulation first (draft decisions)
- Human review and refinement
- Best of both worlds

---

## ✅ READY TO EXECUTE

**All preparation complete.**

**Next action:** Choose execution option and proceed.

---

**Prepared by:** Mind Mapper Agent (MMOS)
**Date:** 2025-01-14
**Status:** ✅ APPROVED - Ready for roundtable execution
