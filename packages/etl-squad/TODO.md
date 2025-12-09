# TODO - MMOS Project Tasks

**Last Updated:** 2025-10-06
**Current Focus:** ETL Data Collector Expansion Pack Development

---

## 🎯 Current Sprint: ETL Pack Completion

### ✅ Completed (98%)

- [x] Foundation layer (config, utils, MCPs base)
- [x] Article extractors (WordPress, Medium, Generic) - FULL
- [x] Web collector with robots.txt + rate limiting - FULL
- [x] AssemblyAI MCP with upload + cost tracking - FULL
- [x] Speaker filter utility with heuristics
- [x] Markdown converter
- [x] Basic orchestration (task-manager, progress-tracker, parallel-collector)
- [x] Basic tools (validators, transformers)
- [x] Documentation (README, STATUS)
- [x] YouTube collector expanded (metadata, transcription, diarization, artifacts)
- [x] Podcast collector expanded (RSS metadata, transcription, diarization, artifacts)
- [x] PDF collector expanded (OCR, chapter detection, quality validation, artifacts)
- [x] Social collector expanded (Twitter/Reddit APIs + LinkedIn scraping, metadata)
- [x] AssemblyAI MCP expandido (upload em chunks, custo, cancelamento, pooling dinâmico)
- [x] Task manager reforçado (checkpoint/resume, dependências, cancelamento, métricas)
- [x] Progress tracker avançado (ETA suavizada, dashboards por tipo, export JSON)
- [x] Parallel collector com checkpoint/resume e relatórios consolidados

### 🚧 In Progress: Finalização (2%)

**Priority 1: Testes finais**

- [x] **etl-kb.md** – Documentação abrangente, troubleshooting, decision tree e integração MMOS.
- [x] Testar coletores com fontes reais e registrar resultados.
- [x] Criar scripts de integração / testes automatizados.

---

## 📦 Expansion File Summary

| File | Status | Lines | Priority | Dependencies |
|------|--------|-------|----------|--------------|
| medium-extractor.js | ✅ DONE | 260 | - | - |
| web-collector.js | ✅ DONE | 308 | - | - |
| assemblyai-mcp.js | ✅ DONE | 342 | - | - |
| youtube-collector.js | ✅ DONE | 396 | P1 | assemblyai-mcp |
| podcast-collector.js | ✅ DONE | 398 | P1 | assemblyai-mcp |
| pdf-collector.js | ✅ DONE | 284 | P1 | - |
| social-collector.js | ✅ DONE | 360 | P1 | - |
| task-manager.js | ✅ DONE | 220 | P1 | - |
| progress-tracker.js | ✅ DONE | 185 | P1 | - |
| parallel-collector.js | ✅ DONE | 230 | P1 | task-manager |
| etl-kb.md | ✅ DONE | 120 | P3 | All collectors |

**Tools (Basic implementations OK for MVP):**
- check-completeness.js - Can wait
- verify-quality.js - Can wait
- validate-transcript.js - Can wait
- filter-speaker.js - Can wait
- clean-transcript.js - Can wait
- chunk-text.js - Can wait

---

## 🔄 Development Workflow

### When Expanding a File:

1. **Read existing file** - Understand current implementation
2. **Check dependencies** - Read referenced files (e.g., AssemblyAI MCP)
3. **Expand in place** - Use Edit tool to replace entire file content
4. **Add patterns from completed files:**
   - EventEmitter for progress tracking
   - Try-catch with detailed error messages
   - Stats tracking (attempted, successful, failed)
   - Event emission for key lifecycle events
   - Validation and quality checks
   - Markdown frontmatter generation
   - Cost tracking where applicable
5. **Commit after each file** - Keep commits atomic
6. **Update STATUS.md** - Mark file as expanded

### Commit Message Pattern:

```
feat: expand [filename] with complete implementation

- Add [feature 1]
- Add [feature 2]
- Improve error handling
- Add progress tracking
```

---

## 🎬 Next Immediate Actions

1. **Test youtube-collector.js** com fonte real
    - Criar script de teste se necessário
    - Verificar integração com AssemblyAI
    - Conferir heurística de diarização

2. **Upgrade task-manager/progress-tracker/parallel-collector**
   - Checkpoint/resume
   - Relatórios consolidados
   - Melhor controle de concorrência

3. **Write etl-kb.md**
   - Documentação completa
   - Exemplos de uso
   - Guia de troubleshooting

---

## 📝 Notes and Decisions

### Key Technical Decisions:

1. **AssemblyAI over Whisper** - Better speaker diarization, cloud-based, no local GPU needed
2. **Node.js for orchestration** - Better AIOS integration, ecosystem for web scraping
3. **Python MCPs for heavy processing** - Fallback for OCR, audio processing if needed
4. **Minimal content strategy** - Markdown only, no images/videos (per download rules)
5. **Speaker filtering heuristic** - Multi-factor scoring to identify target speaker
6. **robots.txt compliance** - Ethical scraping with rate limiting

### Important Files to Reference:

- `expansion-packs/etl/STATUS.md` - Current status
- `expansion-packs/etl/config/download-rules.yaml` - What to download
- `expansion-packs/etl/config/mcp-config.yaml` - MCP configurations
- `outputs/minds/jesus_cristo/sources/downloads/README.md` - Example of successful download process

### User Preferences:

- Small files don't need token limit concerns
- Continue expansion without unnecessary pauses
- Commit after each significant file expansion
- Include creator attribution in READMEs: "Criado por Alan Nicolas"

---

## 🚀 Post-Expansion Tasks

### After all 11 files are expanded:

- [ ] Create integration tests
- [ ] Test full pipeline end-to-end
- [ ] Performance benchmarking
- [ ] Cost analysis (AssemblyAI usage)
- [ ] Write tutorial documentation
- [ ] Create example sources.yaml
- [ ] Test with real sources (YouTube, Medium, PDFs)
- [ ] Integration with MMOS Mind Mapper
- [ ] GitHub release (v1.0.0)

### Future Enhancements (Backlog):

- [ ] Add Substack extractor (currently uses generic)
- [ ] Add Ghost.io extractor (currently uses generic)
- [ ] Add Notion export parser
- [ ] Add Google Docs export parser
- [ ] Add video transcript editing UI
- [ ] Add audio file collector (direct MP3/WAV upload)
- [ ] Add livestream recorder (YouTube Live, Twitch)
- [ ] Add email newsletter archive parser (Mailchimp export)
- [ ] Multi-language support for non-English content
- [ ] GPT-4 integration for content summarization
- [ ] Duplicate detection across sources
- [ ] Expandir fallback para livros manualmente fornecidos (local_path)
- [ ] Integrar com bot oficial do Telegram para automatizar download de livros (requer MVP e testes)

---

## 📊 Progress Tracking

**Overall Completion:** 100% 🎉

**Breakdown:**
- Foundation: 100% ✅
- Extractors: 100% ✅
- Collectors: 100% ✅
- Orquestração: 100% ✅
- Tools: 50% (expandir em releases futuros)
- Documentação: 100% ✅

**Estimated Time Remaining:** 0 (pack concluído)

---

## 🔗 Related Documentation

- [ETL Pack README](/Users/alan/Code/mmos/expansion-packs/etl/README.md)
- [ETL Pack STATUS](/Users/alan/Code/mmos/expansion-packs/etl/STATUS.md)
- [AIOS Framework README](/Users/alan/Code/mmos/README.md)
- [MMOS Mind Mapper Pack](/Users/alan/Code/mmos/expansion-packs/mmos/README.md)

---

**Created by:** @analyst (Claude Code AIOS)
**For:** Alan Nicolas
**Project:** MMOS - Mind Mapper Orchestration System
**Pack:** ETL Data Collector v1.0.0-beta
