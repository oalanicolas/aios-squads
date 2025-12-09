# AIOS Squads

> Modular AI Agent Teams for AIOS

## What are Squads?

Squads are specialized teams of AI agents that work together to accomplish domain-specific tasks. Each squad contains:

- **Agents**: Specialized AI personas with specific roles
- **Tasks**: Executable workflows the squad can perform
- **Templates**: Document and code templates
- **Knowledge**: Domain-specific data and guidelines

## Available Squads

### ETL Squad
Data extraction, transformation, and loading operations.
- YouTube transcript extraction
- Blog/article scraping
- Social media collection
- Data chunking and indexing

### Creator Squad
Content creation and course development.
- Course generation with pedagogical frameworks
- Blog post writing
- Content optimization

### MMOS Squad
Mind Mapping Operating System integration.
- Cognitive clone activation
- Mind synthesis and compilation
- Fidelity testing

## Installation

```bash
# Clone the repository
git clone https://github.com/allfluence/aios-squads.git
cd aios-squads

# Install dependencies
npm install

# Link to local aios-core (for development)
npm link @aios/core
```

## Requirements

- Node.js 18+
- [@aios/core](https://github.com/allfluence/aios-core) >=2.0.0

## Usage

Squads are loaded dynamically by AIOS core:

```javascript
// In your AIOS project
const { loadSquad } = require('@aios/core');

const etlSquad = await loadSquad('etl');
await etlSquad.executeTask('collect-youtube', { url: 'https://...' });
```

## Documentation

For detailed documentation, visit [AIOS Core Discussions](https://github.com/allfluence/aios-core/discussions).

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/allfluence/aios-core/blob/main/CONTRIBUTING.md).

## License

MIT License - see [LICENSE](./LICENSE)

---

Part of the [AIOS Framework](https://github.com/allfluence/aios-core)
