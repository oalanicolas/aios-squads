# AIOS Squads - Packages

Squads extend Synkra AIOS beyond traditional software development, providing specialized agent teams, templates, and workflows for specific domains and industries. Each squad is a self-contained ecosystem designed to bring the power of AI-assisted workflows to any field.

## Naming Convention

All squads follow the same naming convention as the core framework (`aios-core/`):

- **Agent-specific tasks:** Use `{agent-id}-{task-name}.md` format
  - Example: `youtube-specialist-collect-youtube.md`, `blog-writer-generate-blog-post.md`
- **Shared tasks:** Use `{task-name}.md` format (NO prefix)
  - Example: `collect-all-sources.md`, `execute-mmos-pipeline.md`

This convention ensures consistency across the entire AIOS ecosystem and makes it easy to identify which agent owns which task.

## Available Squads

### Official Squads (This Repository)

| Squad | Version | Status | Description |
|-------|---------|--------|-------------|
| **etl-squad** | 2.0.0 | Production | Blog collection utilities with 100% success rate |
| **creator-squad** | 1.0.0 | Production | Expansion pack creator tool |

### Private Squads (Separate Repositories)

The following squads are available in private repositories:
- **mmos** - Mind Mapping Operating System (SynkraAI/mmos)
- **certified-partners** - Premium partner packs (SynkraAI/certified-partners)

## Squad Structure

Each squad follows this structure:

```
{squad-name}/
├── config.yaml          # Squad manifest
├── package.json         # npm package config
├── README.md            # Documentation
├── agents/              # Agent definitions
├── tasks/               # Executable tasks
├── templates/           # Document templates
├── checklists/          # Validation checklists
├── data/                # Knowledge base
├── scripts/             # Utility scripts
└── deprecated/          # Legacy code (if any)
```

## Creating New Squads

See [Squads Guide](https://github.com/SynkraAI/aios-core/blob/main/docs/guides/squads-guide.md) for creating new squads.

## Migration History

**2025-12-18:** Rebranding to SynkraAI
- Updated all references from `allfluence` to `SynkraAI`
- Updated peerDependency to `@aios-fullstack/core`

**2025-11-12:** Applied naming convention migration (Story 4.5.3)
- All agent-specific tasks now use `{agent-id}-` prefix
- All agent dependencies updated
- 100% compliance achieved
