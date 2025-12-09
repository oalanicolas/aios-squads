template:
  id: expansion-task-template-v1
  name: Expansion Pack Task
  version: 1.0
  output:
    format: markdown
    filename: "tasks/{{task_id}}.md"
    title: "{{task_name}} Task Definition"

workflow:
  mode: interactive
  elicitation: advanced-elicitation
  custom_elicitation:
    title: "Task Workflow Elicitation"
    sections:
      - id: workflow-complexity
        options:
          - "Simple Task - Linear sequence of steps"
          - "Interactive Task - Requires user elicitation"
          - "Complex Task - Multiple sections with conditionals"
          - "Orchestration Task - Coordinates other tasks"
      - id: elicitation-mode
        options:
          - "No Elicitation - Execute without user input"
          - "Basic Elicitation - Simple questions"
          - "Advanced Elicitation - Interactive refinement"
          - "Expert Elicitation - Deep domain knowledge extraction"

sections:
  - id: initial-setup
    instruction: |
      Initial Setup for Task Definition

      This template creates a task workflow that can be executed by AIOS agents.

      Gather the following information:
      - Task ID (kebab-case, e.g., "create-legal-contract")
      - Task name (human-readable, e.g., "Create Legal Contract")
      - Task purpose and goal
      - Workflow steps
      - Required inputs
      - Expected outputs
      - Elicitation requirements
      - Validation criteria

      Output file location: `expansion-packs/{{pack_name}}/tasks/{{task_id}}.md`

  - id: task-header
    title: Task Header
    instruction: Create task header with metadata
    template: |
      # {{task_name}}

      **Task ID:** `{{task_id}}`
      **Purpose:** {{task_purpose}}
      **Workflow Mode:** {{workflow_mode}}
      **Elicitation:** {{elicitation_type}}

  - id: overview
    title: Task Overview
    instruction: Provide clear overview of what this task accomplishes
    template: |
      ## Overview

      {{task_overview}}

  - id: prerequisites
    title: Prerequisites
    instruction: List required inputs, documents, or conditions
    template: |
      ## Prerequisites

      Before executing this task, ensure you have:

      {{prerequisites}}

  - id: workflow
    title: Workflow Definition
    instruction: |
      Define the step-by-step workflow. Use sections for different phases.
      Include elicitation points where user input is needed.
    elicit: true
    template: |
      ## Workflow

      {{workflow_steps}}

  - id: section-example
    title: Example Workflow Section
    instruction: |
      Each workflow section should follow this pattern:
      - Clear section ID and title
      - Instruction for the LLM on what to do
      - Template structure for output
      - Examples (optional)
      - Elicitation specification if user input needed
    template: |
      ### Section {{section_number}}: {{section_title}}

      **Instruction:** {{section_instruction}}

      {{#if section_elicit}}
      **Elicitation Required:** Yes
      **Elicitation Type:** {{elicitation_type}}
      {{/if}}

      **Template:**
      ```
      {{section_template}}
      ```

      {{#if section_examples}}
      **Examples:**
      {{section_examples}}
      {{/if}}

  - id: elicitation-config
    title: Custom Elicitation Configuration
    condition: Uses advanced elicitation
    instruction: |
      If task uses advanced elicitation, define custom elicitation sections.
      Each section should present options or questions to gather user input.
    template: |
      ## Custom Elicitation

      ```yaml
      custom_elicitation:
        title: "{{elicitation_title}}"
        sections:
          {{elicitation_sections}}
      ```

  - id: validation
    title: Validation Criteria
    instruction: Define how to validate task completion and output quality
    template: |
      ## Validation

      Validate task completion by checking:

      {{validation_criteria}}

  - id: output-specification
    title: Output Specification
    instruction: Describe expected outputs and where they should be saved
    template: |
      ## Output

      **Format:** {{output_format}}
      **Filename:** {{output_filename}}
      **Location:** {{output_location}}

      {{output_structure}}

  - id: error-handling
    title: Error Handling
    instruction: Define how to handle common errors or edge cases
    template: |
      ## Error Handling

      {{error_scenarios}}

  - id: integration
    title: Integration Points
    instruction: Describe how this task integrates with other tasks or agents
    template: |
      ## Integration

      This task integrates with:

      {{integration_points}}

  - id: examples
    title: Usage Examples
    instruction: Provide concrete examples of task execution
    template: |
      ## Examples

      {{usage_examples}}

  - id: notes
    title: Implementation Notes
    template: |
      ## Notes

      {{implementation_notes}}

  - id: footer
    template: |
      ---

      _Task Version: {{version}}_
      _Last Updated: {{last_updated}}_
