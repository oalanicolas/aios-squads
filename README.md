# AIOS Squads

> Equipes de AI agents trabalhando com você - Modular AI Agent Teams for Synkra AIOS

## What are Squads?

Squads are specialized teams of AI agents that work together to accomplish domain-specific tasks. Each squad contains:

- **Agents**: Specialized AI personas with specific roles
- **Tasks**: Executable workflows the squad can perform
- **Templates**: Document and code templates
- **Knowledge**: Domain-specific data and guidelines

## Available Squads

### ETL Squad (v2.0.0) - Production Ready
Lightweight blog collection utilities with proven 100% success rate.
- Smart blog post discovery
- Platform-specific extraction (WordPress, Medium, Substack)
- Speaker diarization for transcript filtering
- Data chunking and indexing

### Creator Squad (v1.0.0) - Production Ready
Expansion pack creator tool for building custom AIOS extensions.
- Automated expansion pack scaffolding
- Agent, task, and template creation
- Checklist and workflow generation

### MMOS Squad (Private)
Mind Mapping Operating System integration - Available in private repository.

## Installation

```bash
# Clone the repository
git clone https://github.com/SynkraAI/aios-squads.git
cd aios-squads

# Install dependencies
npm install

# Link to local aios-core (for development)
npm link @aios-fullstack/core
```

## Requirements

- Node.js 18+
- [@aios-fullstack/core](https://github.com/SynkraAI/aios-core) >=2.0.0

## Usage

Squads are loaded dynamically by AIOS core:

```javascript
// In your AIOS project
const { loadSquad } = require('@aios-fullstack/core');

const etlSquad = await loadSquad('etl');
await etlSquad.executeTask('collect-blog', { url: 'https://...' });
```

## Documentation

For detailed documentation, visit:
- [AIOS Core Discussions](https://github.com/SynkraAI/aios-core/discussions)
- [Squads Guide](https://github.com/SynkraAI/aios-core/blob/main/docs/guides/squads-guide.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/SynkraAI/aios-core/blob/main/CONTRIBUTING.md).

## License

MIT License - see [LICENSE](./LICENSE)

---

Part of the [Synkra AIOS Framework](https://github.com/SynkraAI/aios-core)
