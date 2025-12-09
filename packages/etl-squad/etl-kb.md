# ETL Data Collector - Knowledge Base

## 1. Visão Geral
- **Objetivo**: automatizar coleta, transcrição e normalização de fontes multimídia (web, áudio, PDFs, social).
- **Stack**: Node.js (orquestração/coleta), Python MCPs (OCR/análise pesada), AssemblyAI (transcrição), YAML/Markdown como formatos de saída.
- **Escopo principal**:
  - Web/blog posts (WordPress, Medium, genérico via Readability)
  - YouTube (áudio + diarização)
  - Podcasts (RSS + AssemblyAI)
  - PDFs (texto digital e escaneado com OCR)
  - Social (Twitter/X, Reddit, LinkedIn)

## 2. Arquitetura
### 2.1 Componentes
- `collectors/*`: agentes especializados por tipo de fonte.
- `mcp-client.js`: cliente MCP genérico (AssemblyAI, web-fetch, etc.).
- `mcps/assemblyai-mcp.js`: wrapper completo (upload chunked, custo, cancelamento).
- `orchestrator/*`: orchestration layer com TaskManager + ProgressTracker + ParallelCollector.
- `config/*`: regras de download, mapeamento de MCPs.
- `tools/*`: validadores e transformers (podem ser expandidos).

### 2.2 Fluxo principal
1. **Carrega regras** (`download-rules.yaml`).
2. **Inicializa coletors** com regras.
3. **Lê sources** (`sources.yaml`).
4. **ParallelCollector** cria fila de tarefas no `TaskManager`.
5. **Collectors** geram artefatos Markdown/JSON por fonte.
6. **ProgressTracker** emite dashboards e ETA.
7. **Relatório final** com sucessos/falhas + métricas.

## 3. Regras de Download (resumo)
- **Global**: sem imagens/vídeos; Markdown apenas; timeout 300s.
- **YouTube**: áudio mp3, AssemblyAI com diarização, full & filtered transcripts.
- **Podcast**: download + transcrever; transcrição filtrada para entrevistado.
- **Blogs**: remove nav/footer/sidebar, preserva links/code/blocos.
- **PDF**: detecta densidade, roda OCR (Tesseract) quando necessário, gera capítulos opcionais.
- **Social**: APIs preferenciais, fallback para scraping controlado; respeita rate limits e bloqueios configurados.

## 4. Setup Rápido
```bash
# instalar dependências
npm install
pip install -r config/python-requirements.txt

# exportar variáveis sensíveis
export ASSEMBLYAI_API_KEY=...
export TWITTER_BEARER_TOKEN=...
export REDDIT_CLIENT_ID=...
export REDDIT_CLIENT_SECRET=...

# execução exemplo
node scripts/orchestrator/parallel-collector.js \
  --config configs/etl.yaml \
  --sources inputs/sources.yaml \
  --output downloads/
```

## 5. Fonte -> Artefatos
| Tipo | Artefatos gerados | Observações |
|------|-------------------|-------------|
| Web/Blog | `article.md`, `metadata.json` | Markdown limpo com frontmatter |
| YouTube | `transcript.md`, `transcript.filtered.md`, `transcript.full.md`, `metadata.json` | AssemblyAI diarizado + fallback captions |
| Podcast | Mesmo padrão do YouTube | Metadados extraídos via RSS |
| PDF | `text.md`, `text.txt`, `chapter-*.md`, `metadata.json` | OCR automático se densidade baixa |
| Social | `content.md`, `metadata.json` | Twitter API + fallback, Reddit API/JSON, LinkedIn turndown |

## 6. Orquestração
### 6.1 TaskManager
- Suporta **checkpoint/resume** (arquivo JSON definido em `statePath`).
- Dependências por ID (ex.: processar transcrição só após download).
- Controle de cancelamento (CLI pode invocar `cancelTask`).
- Métricas internas (started/completed/failed/retried/cancelled + tempo médio).

### 6.2 ProgressTracker
- Dashboard em **tempo real** com barras coloridas.
- ETA suavizada (fator de suavização configurável).
- Estatísticas por tipo de fonte.
- Export JSON (`exportToJSON`) para logs externos.

### 6.3 ParallelCollector
- Carrega regras + fontes.
- Cria tarefas por tipo, respeitando `maxConcurrent`.
- Emite relatório final com métricas agregadas e histórico.
- Permite **cancelamento** e retomada automática quando `allowResume` está ativo.

## 7. Integração com MMOS Mind Mapper
- MMOS depende deste pack para **fase Research/Collection**.
- `collect-youtube`, `collect-podcast`, `collect-web`, etc., podem ser orquestrados via `ParallelCollector` ou chamados isoladamente.
- Checkout do estado salvo permite retomar coleções extensas (ex.: 100+ fontes).

## 8. Boas Práticas de Execução
1. **Segmentar fontes**: rodar em lotes (ex.: primeiro YouTube, depois podcasts) para facilitar debug.
2. **Monitorar custos**: `assemblyai-mcp` emite eventos `cost_estimate` e `cost_warning`.
3. **Logs persistentes**: habilitar `statePath` em `TaskManager` e guardar output de `ParallelCollector`.
4. **Chaves de API**: rotacionar tokens se atingir limites; respeitar `allow_scrape` para Twitter/LinkedIn.
5. **Storage**: manter `downloads/` organizado (`organize_by_type/source_id` já implementado).

## 9. Testes & Validação
- **Testes unitários** (pendente): coletores podem ser testados com fixtures mockadas.
- **Testes de integração** (prioridade atual):
  - Criar `inputs/sample-sources.yaml` com 1 fonte de cada tipo.
  - Rodar `parallel-collector` e verificar artefatos gerados.
  - Validar heurística de diarização (target speaker) manualmente.
- **Smoke tests**: executar `ProgressTracker.exportToJSON()` após coleta e checar métricas.

## 10. Troubleshooting
| Sintoma | Causa provável | Solução |
|--------|----------------|---------|
| `AssemblyAI API key required` | Variável `ASSEMBLYAI_API_KEY` ausente | Exportar chave antes de rodar |
| `Twitter API 403` | Token expirado ou scraping bloqueado | Renovar bearer token ou habilitar `allow_scrape` no download rules |
| PDF gera texto vazio | Documento escaneado sem OCR | Verificar se `ocr_if_scanned` está `true`; confirmar `pdftoppm` + `tesseract` instalados |
| Rate limit ao juntar muitas fontes | `maxConcurrent` muito alto | Ajustar `maxConcurrent` no `ParallelCollector`/`TaskManager` |
| Markdown com headers faltando | HTML fora do padrão (Medium paywall, etc.) | Revisar extractor específico; conferir `remove_elements` nas regras |
| Execução interrompida | Processo foi morto | Retomar com o mesmo `statePath` ativado; pendências voltam para fila |

## 11. Roadmap Pós-v1
- Adicionar novos coletores (Substack, Ghost, Notion, Google Docs).
- Expandir validators/transformers com métricas detalhadas.
- Adicionar scripts de benchmark (tempo/custo) por tipo de fonte.
- Integrar com monitoramento externo (Grafana/Prometheus via JSON exportado).

## 12. Referências
- [AssemblyAI Docs](https://www.assemblyai.com/docs)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [Reddit API](https://www.reddit.com/dev/api/)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [Readability.js](https://github.com/mozilla/readability)
