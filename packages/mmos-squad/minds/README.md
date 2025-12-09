# 🤖 Clones Lendário.ai - Guia de Boas Práticas

Este diretório contém todos os clones de personalidades desenvolvidos pela Academia Lendar[IA]. Este README estabelece padrões e práticas para manter qualidade e consistência.

## 📁 Estrutura Padrão de Pastas

Cada clone deve seguir esta estrutura obrigatória, com suporte a **clone generalista** e **clones especialistas**:

```
nome-do-clone/
├── 📝 docs/                    # Documentação principal do clone
│   ├── README.md
│   └── PRD.md                  # Product Requirements Document
├── 📋 logs/                    # Relatórios temporários (convenção timestamp)
├── 📚 sources/                 # Material fonte organizado
│   ├── books/                  # PDFs, livros
│   ├── interviews/             # Transcrições de entrevistas
│   ├── speeches/               # Palestras, apresentações  
│   ├── articles/               # Artigos, blog posts
│   ├── social-media/           # Posts de redes sociais
│   └── videos/                 # Transcrições de vídeos
├── 📊 analysis/                # Inferências sobre personalidade e padrões
│   ├── personality-profile.json
│   ├── writing-style-analysis.md
│   └── behavioral-patterns.md
├── 🔧 templates/               # Padrões reutilizáveis extraídos
│   ├── communication-templates.md
│   └── signature-phrases.md
├── 🏗️ frameworks/              # Sistemas e metodologias específicas
│   ├── signature-frameworks.md
│   └── decision-patterns.md
├── 🧠 kb/                      # Knowledge base geral (COMPLETO)
├── 📄 kb.md                    # Manifest do knowledge base geral
├── ⚡ system-prompts/           # Clone GENERALISTA (todas as áreas)
│   ├── YYYYMMDD-HHMM-vX.Y-generalista-descriptor.md
│   └── ...
└── 🎯 specialists/             # Clones especializados
    ├── especialidade-1/
    │   ├── kb/                 # KB específico da especialidade
    │   ├── kb.md               # Manifest específico
    │   └── system-prompts/     # Versões do clone especializado
    │       ├── YYYYMMDD-HHMM-vX.Y-especialidade-descriptor.md
    │       └── ...
    └── especialidade-2/
        └── ...
```

## Processo (Outputs por Etapa)

Para detalhes completos dos outputs esperados em cada etapa, consulte [docs/OUTPUTS_GUIDE.md]

## 🎯 Conceito: Clone Generalista vs. Especialistas

### ⚡ **Clone Generalista** (`/system-prompts/`)
- **Propósito:** Domina TODAS as áreas de expertise da personalidade
- **KB Source:** Knowledge base completo (`/kb/`)
- **Quando usar:** Consultas amplas, estratégia geral, múltiplas áreas
- **Exemplo:** "Como estruturar uma campanha completa de lançamento?"

### 🎯 **Clones Especialistas** (`/specialists/*/system-prompts/`)
- **Propósito:** Foco LASER em área específica de expertise
- **KB Source:** Knowledge base filtrado (`/specialists/*/kb/`)
- **Quando usar:** Execução específica, máxima especialização
- **Exemplo:** "Escreva sequência de 5 emails para este produto"

### 💡 **Exemplos de Especialistas:**
- `copywriter-email/` - Especialista em email marketing
- `copywriter-vsl/` - Especialista em video sales letters
- `gestor-agencia/` - Especialista em gestão de agência
- `estrategista-marketing/` - Especialista em estratégia
- `vendedor-consultivo/` - Especialista em vendas

## 🚫 REGRAS OBRIGATÓRIAS

### ❌ O QUE NUNCA FAZER

1. **NUNCA deixar arquivos de programação nas pastas dos clones**
   - ❌ Sem arquivos `.py`, `.js`, `.sh`, `.bat`
   - ❌ Sem scripts de automação
   - ❌ Sem código temporário

2. **NUNCA deixar logs na pasta raiz**
   - ❌ Sem arquivos de relatório na raiz
   - ❌ Sem arquivos temporários soltos
   - ❌ Sem documentos de debug

3. **NUNCA criar especialistas sem propósito claro**
   - ❌ Sem sobreposição entre especialistas
   - ❌ Sem especialistas muito genéricos
   - ❌ Sem justificativa para separação

### ✅ PRÁTICAS RECOMENDADAS

1. **Use recursos do AIOS para automação**
   - ✅ Scripts Python ficam em projetos AIOS separados
   - ✅ Automação via agentes especializados
   - ✅ Integração via APIs e ferramentas

2. **Mantenha organização impecável**
   - ✅ Siga a estrutura de pastas obrigatória
   - ✅ Use convenção de nomenclatura consistente
   - ✅ Documente tudo em markdown

3. **Processamento paralelo inteligente**
   - ✅ Sources alimentam analysis/, templates/, frameworks/ em paralelo
   - ✅ Especialistas compartilham material base
   - ✅ KB específicos são derivados do material comum

4. **Versionamento rigoroso de system prompts**
   - ✅ Use convenção timestamp + versão semântica
   - ✅ Documente mudanças em changelog interno
   - ✅ Mantenha histórico completo de evolução

## 📋 Convenção de Nomenclatura

### Pastas e Arquivos Gerais
- **kebab-case**: `nome-da-pasta`
- **Inglês**: Nomes em inglês sempre
- **Descritivo**: Nome deve ser autoexplicativo
- **Sem espaços**: Substitua por hífens
- **Sem caracteres especiais**: Apenas letras, números, hífen

### System Prompts (Versionamento)
```
YYYYMMDD-HHMM-vX.Y-tipo-descriptor.md
```

**Componentes:**
- **YYYYMMDD-HHMM**: Timestamp de criação
- **vX.Y**: Versão semântica (v1.0, v1.1, v2.0)
- **tipo**: generalista, email, vsl, gestao, etc.
- **descriptor**: initial, enhanced, advanced, improved, etc.

**Exemplos:**
```
✅ 20250928-1800-v1.0-generalista-initial.md
✅ 20250928-1900-v1.1-email-enhanced.md  
✅ 20250929-0900-v2.0-vsl-advanced.md
```

### Logs (Convenção Existente)
```
YYYYMMDD-HHMM-nome-do-arquivo.md
```

## 🔧 Fluxo de Desenvolvimento

### 1. Criação do Clone Base
```bash
# Use o script automático
./create-clone-structure.sh novo-clone
```

### 2. Coleta e Processamento Paralelo
```
sources/ (material bruto)
    ↓
    ├─→ analysis/     # IA analisa personalidade geral
    ├─→ templates/    # IA extrai padrões reutilizáveis  
    ├─→ frameworks/   # IA identifica sistemas completos
    └─→ chunks/       # IA prepara para vetorização
    
Depois tudo converge para:
    ↓
   kb/ (knowledge base geral)
```

### 3. Criação do Clone Generalista
- **System prompt**: Domina todas as áreas
- **KB source**: Knowledge base completo
- **Teste**: Validar amplitude e profundidade

### 4. Criação de Especialistas
- **Identificar áreas**: Definir especializações necessárias
- **KB específico**: Filtrar material relevante por área
- **System prompts**: Foco laser na especialidade
- **Limitações**: Definir claramente escopo restrito

### 5. Validação e Iteração
- **Teste generalista**: Consultas amplas e estratégicas
- **Teste especialistas**: Tarefas específicas e técnicas
- **Comparação**: Generalista vs. especialista na mesma área
- **Refinamento**: Iterar system prompts conforme performance

## 🎯 Indicadores de Qualidade

### ✅ Clone de Alta Qualidade

#### **Base (Comum a Todos):**
- **Estrutura**: 100% conforme padrão
- **Documentação**: README completo e PRD detalhado
- **Fontes**: Verificadas e organizadas
- **Templates**: Funcionais e testados
- **Análises**: Profundas e estruturadas
- **Limpeza**: Sem arquivos desnecessários

#### **Clone Generalista:**
- **Amplitude**: Cobre todas as áreas de expertise
- **Transição**: Conecta áreas naturalmente
- **Contexto**: Usa knowledge base completo eficientemente
- **Flexibilidade**: Adapta-se ao nível da pergunta

#### **Clones Especialistas:**
- **Foco**: Limitação rígida à área específica
- **Profundidade**: Máximo detalhamento na especialidade
- **Performance**: Resposta superior ao generalista na área
- **Consistência**: Mantém personalidade base

### ⚠️ Sinais de Problemas

- **Arquivos Python** na pasta do clone
- **Logs** na pasta raiz
- **Estrutura** não padronizada
- **System prompts** sem versionamento
- **Especialistas** com sobreposição
- **KB** desatualizado entre versões

## 🔍 Checklist de Validação

Antes de considerar um clone completo, execute:

```bash
./validate-clone.sh nome-do-clone
```

### **Validações Automáticas:**
- [ ] Estrutura de pastas obrigatória
- [ ] Ausência de arquivos de código
- [ ] Logs organizados em pasta dedicada
- [ ] Convenção de nomenclatura
- [ ] Arquivos de documentação básica

### **Validações Manuais:**
- [ ] Clone generalista funcional
- [ ] Especialistas com propósito claro
- [ ] System prompts versionados corretamente
- [ ] KB geral e específicos alinhados
- [ ] Performance superior dos especialistas em suas áreas

## 📚 Recursos AIOS Recomendados

### Agentes Especializados
- **Research Agent**: Para coleta de fontes
- **Analysis Agent**: Para análise de personalidade
- **Content Agent**: Para extração de templates e frameworks
- **Specialist Agent**: Para criação de KB específicos
- **Quality Agent**: Para validação final

### Ferramentas
- **Parallel Processing**: Para análise simultânea
- **KB Filtering**: Para criação de especialistas
- **Version Control**: Para system prompts
- **Performance Testing**: Para comparação generalista vs. especialista

## 🚀 Casos de Uso

### **Workflow Típico:**

```
Pergunta estratégica/ampla
    ↓
Clone Generalista
    ↓
Resposta abrange múltiplas áreas
    ↓
Para execução específica
    ↓
Clone Especialista
    ↓
Execução laser-focada
```

### **Exemplos Práticos:**

#### **Clone Generalista:**
- "Como Dan Kennedy estruturaria uma campanha completa?"
- "Qual a filosofia de negócios de Dan Kennedy?"
- "Como aplicar princípios Kennedy em startup?"

#### **Clone Especialista (Email):**
- "Escreva sequência de emails para este produto"
- "Otimize este subject line"
- "Crie follow-up para lista fria"

## 📋 REGRAS DE LOGS E RELATÓRIOS

### ❌ NUNCA criar arquivos de log/relatório na pasta /clones/
- ❌ Sem arquivos ANALISE_*.md na raiz
- ❌ Sem arquivos STATUS_*.md na raiz
- ❌ Sem arquivos PADRONIZACAO_*.md na raiz
- ❌ Sem arquivos REORGANIZACAO_*.md na raiz
- ❌ Sem arquivos CONFORMIDADE_*.md na raiz

### ✅ SEMPRE usar a pasta /logs/ para relatórios
- ✅ Localização: `/logs/` (fora de /clones/)
- ✅ Formato obrigatório: `YYYYMMDD-HHMM-NOME.md`
- ✅ Exemplo: `20250928-2220-ANALISE_ESTRUTURAL.md`

### Arquivos Permitidos em /clones/:
- ✅ `README.md` (este arquivo - documentação oficial)
- ✅ `clone_system/` (pasta com scripts de sistema)
- ✅ Pastas dos clones (apenas)
- ❌ NUNCA arquivos .sh, .py, .js na raiz
- ❌ NUNCA logs, changelogs, ou relatórios na raiz

## 📞 Arquivos de Referência

- **../logs/** - Todos os relatórios, status e histórico (incluindo CHANGELOG)
- **clone_system/** - Scripts de validação e criação
  - create-clone-structure.sh - Script para criar novos clones
  - validate-clone.sh - Script de validação de clones
  - validate-logs.sh - Script de validação de logs

---

*Este documento contém apenas regras e práticas imutáveis. Para status dos clones, consulte ../logs/*
