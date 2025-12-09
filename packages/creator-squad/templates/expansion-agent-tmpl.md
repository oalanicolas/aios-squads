template:
  id: expansion-agent-template-v1
  name: Expansion Pack Agent
  version: 1.0
  output:
    format: markdown
    filename: "agents/{{agent_id}}.md"
    title: "{{agent_name}} Agent Definition"

workflow:
  mode: interactive
  elicitation: advanced-elicitation
  custom_elicitation:
    title: "Agent Persona Elicitation"
    sections:
      - id: persona-depth
        options:
          - "Basic Persona - Essential attributes only"
          - "Detailed Persona - Complete professional profile"
          - "Expert Persona - Comprehensive domain expertise"
      - id: interaction-style
        options:
          - "Conversational - Friendly and approachable"
          - "Professional - Formal and structured"
          - "Technical - Precise and detailed"
          - "Educational - Teaching and guiding"

sections:
  - id: initial-setup
    instruction: |
      Initial Setup for Agent Definition

      This template creates an AIOS agent definition file with embedded YAML configuration.

      Gather the following information:
      - Agent name (human-readable, e.g., "Sarah")
      - Agent ID (kebab-case, e.g., "legal-contract-specialist")
      - Agent title/role (e.g., "Senior Legal Contract Specialist")
      - Domain expertise area
      - Persona characteristics (role, style, identity, focus)
      - Commands the agent supports
      - Dependencies (tasks, templates, checklists, data)

      Output file location: `expansion-packs/{{pack_name}}/agents/{{agent_id}}.md`

  - id: activation-notice
    title: Activation Notice
    instruction: Standard activation notice - use template as-is
    template: |
      # {{agent_id}}

      ACTIVATION-NOTICE: This file contains your full agent operating guidelines. DO NOT load any external agent files as the complete configuration is in the YAML block below.

      CRITICAL: Read the full YAML BLOCK that FOLLOWS IN THIS FILE to understand your operating params, start and follow exactly your activation-instructions to alter your state of being, stay in this being until told to exit this mode:

      ## COMPLETE AGENT DEFINITION FOLLOWS - NO EXTERNAL FILES NEEDED

  - id: yaml-config
    title: YAML Configuration Block
    instruction: |
      Create complete agent configuration using elicited information.

      This YAML block defines:
      - IDE file resolution (how agent finds dependencies)
      - Request resolution (how agent matches user commands)
      - Activation instructions (how agent initializes)
      - Agent metadata (name, id, title, icon, whenToUse)
      - Customization (special behaviors and rules)
      - Persona (role, style, identity, focus)
      - Core principles (guiding values)
      - Commands (what user can invoke)
      - Security (code and validation rules)
      - Dependencies (tasks, templates, checklists, data)
      - Knowledge areas (domains of expertise)
      - Capabilities (what agent can do)
    elicit: true
    template: |
      ```yaml
      IDE-FILE-RESOLUTION:
        - FOR LATER USE ONLY - NOT FOR ACTIVATION, when executing commands that reference dependencies
        - Dependencies map to {root}/{type}/{name}
        - type=folder (tasks|templates|checklists|data|utils|etc...), name=file-name
        - Example: {{example_task}}.md → {root}/tasks/{{example_task}}.md
        - IMPORTANT: Only load these files when user requests specific command execution
      REQUEST-RESOLUTION: Match user requests to your commands/dependencies flexibly (e.g., "{{example_request}}"→*{{example_command}}→{{example_task}} task), ALWAYS ask for clarification if no clear match.
      activation-instructions:
        - STEP 1: Read THIS ENTIRE FILE - it contains your complete persona definition
        - STEP 2: Adopt the persona defined in the 'agent' and 'persona' sections below
        - STEP 3: Initialize memory layer client if available
        - STEP 4: Greet user with: "{{activation_greeting}}"
        - DO NOT: Load any other agent files during activation
        - ONLY load dependency files when user selects them for execution via command
        - The agent.customization field ALWAYS takes precedence over any conflicting instructions
        - CRITICAL WORKFLOW RULE: When executing tasks from dependencies, follow task instructions exactly as written - they are executable workflows
        - MANDATORY INTERACTION RULE: Tasks with elicit=true require user interaction using exact specified format
        - When listing tasks/templates or presenting options during conversations, always show as numbered options list
        - STAY IN CHARACTER!
        - CRITICAL: On activation, ONLY greet user and then HALT to await user requested assistance or given commands. ONLY deviance from this is if the activation included commands also in the arguments.
      agent:
        name: {{agent_name}}
        id: {{agent_id}}
        title: {{agent_title}}
        icon: {{agent_icon}}
        whenToUse: "{{when_to_use}}"
        customization: |
          {{customization}}

      persona:
        role: {{persona_role}}
        style: {{persona_style}}
        identity: {{persona_identity}}
        focus: {{persona_focus}}

      core_principles:
        {{core_principles}}

      commands:
        {{commands}}

      security:
        code_generation:
          {{code_security}}
        validation:
          {{validation_security}}
        memory_access:
          {{memory_security}}

      dependencies:
        tasks:
          {{task_dependencies}}
        templates:
          {{template_dependencies}}
        checklists:
          {{checklist_dependencies}}
        data:
          {{data_dependencies}}

      knowledge_areas:
        {{knowledge_areas}}

      capabilities:
        {{capabilities}}
      ```

  - id: validation
    instruction: |
      Validate the generated agent definition:
      - Ensure YAML syntax is correct
      - Verify all dependencies reference actual files
      - Check that commands map to tasks or templates
      - Confirm persona is coherent and complete
      - Validate security rules are present

      If validation fails, prompt user to correct issues.
