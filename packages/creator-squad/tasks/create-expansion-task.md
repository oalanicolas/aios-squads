# Create Expansion Pack Task Task

## Purpose

To create a single workflow task for an AIOS expansion pack through interactive elicitation. This task can be used standalone to add a task to an existing pack or as part of the complete pack creation workflow.

## Inputs

- Target expansion pack directory (if adding to existing pack)
- Task requirements from user
- `expansion-task-tmpl.md` template
- Reference tasks for pattern guidance

## Key Activities & Instructions

### 1. Identify Target Pack

- Ask: "Are you adding this task to an existing expansion pack or creating it standalone?"
- If existing pack:
  - Ask: "What is the pack name?"
  - Verify pack directory exists at `expansion-packs/{pack_name}/`
  - Load pack config.yaml to understand context
- If standalone:
  - Ask: "What pack name should this task belong to?"
  - Note that full pack structure should be created later

### 2. Task Identity & Purpose

- Ask: "What is the task name? (human-readable, e.g., 'Create Legal Contract')"
- Ask: "What is the task ID? (kebab-case, e.g., 'create-legal-contract')"
- Ask: "What is the purpose of this task? What goal does it achieve?"
- Ask: "What problem does this task solve for the user?"

### 3. Workflow Complexity Assessment

- Ask: "What type of workflow is this task?
  A. Simple Linear - Step-by-step sequence without user input
  B. Interactive - Requires gathering information from user
  C. Complex - Multiple sections with conditional logic
  D. Orchestration - Coordinates multiple other tasks"
- Document selected workflow type

### 4. Prerequisites Definition

- Ask: "What does the user need before starting this task?"
- Prompt for:
  - Required input documents
  - Required data or information
  - Prerequisite tasks that should be completed first
  - Access requirements or permissions
  - Tools or systems needed
- Format as checklist

### 5. Input Requirements

- Ask: "What specific inputs does this task require?"
- For each input:
  - Ask: "What is the input name and format?"
  - Ask: "Is this input required or optional?"
  - Ask: "Where does this input come from?" (user upload, previous task output, database, etc.)
  - Ask: "How should this input be validated?"
- Document input specifications

### 6. Elicitation Design

- If task is Interactive, Complex, or Orchestration:
  - Ask: "How should we gather information from the user?
    A. Basic Elicitation - Simple yes/no and fill-in-the-blank questions
    B. Advanced Elicitation - Structured options with refinement loops
    C. Expert Elicitation - Deep domain knowledge extraction"
  - For Advanced/Expert elicitation:
    - Ask: "What are the main elicitation sections?"
    - For each section:
      - Ask: "What is the section name?"
      - Ask: "What options or questions should be presented?"
      - Document elicitation structure

### 7. Workflow Steps Definition

- Ask: "Let's break down the workflow. What are the main steps or sections?"
- For each step/section:
  - Ask: "What is the section name?"
  - Ask: "What should the LLM do in this section?"
  - Ask: "Does this section require user input?" (elicit: true/false)
  - Ask: "What is the expected output or result?"
  - Ask: "Are there conditions for including this section?" (optional)
  - If elicitation needed:
    - Ask: "What specific information should be gathered?"
    - Ask: "Are there multiple options to present?"
  - Document section structure

### 8. Output Specification

- Ask: "What does this task produce as output?"
- Ask: "What format should the output be?" (markdown, yaml, json, PDF, etc.)
- Ask: "What should the output filename pattern be?" (e.g., `{project_name}-contract.md`)
- Ask: "Where should the output be saved?" (e.g., `docs/contracts/`, `output/`)
- Ask: "What is the overall structure of the output?"

### 9. Validation Criteria

- Ask: "How do we know this task completed successfully?"
- Ask: "What quality checks should be performed on the output?"
- Prompt for validation criteria:
  - Completeness checks (all required sections present)
  - Format validation (correct structure)
  - Domain-specific validation (meets industry standards)
  - Security validation (no sensitive data exposure)
  - Integration validation (compatible with other systems)
- Document validation checklist

### 10. Error Handling

- Ask: "What are common errors or edge cases for this task?"
- For each error scenario:
  - Ask: "What causes this error?"
  - Ask: "How should the task handle it?"
  - Ask: "What message should be shown to the user?"
  - Ask: "Can the task recover or must it abort?"
- Document error handling procedures

### 11. Integration Points

- Ask: "Does this task integrate with other tasks or agents?"
- Prompt for:
  - Prerequisite tasks
  - Follow-up tasks
  - Agent collaboration points
  - External systems or APIs
  - Memory layer integration
- Document integration requirements

### 12. Examples Creation

- Ask: "Can you provide a concrete example of this task in action?"
- Gather:
  - Example inputs
  - Expected user interactions
  - Sample output
  - Common use case scenario
- Document 1-3 usage examples

### 13. Generate Task Definition

- Use `expansion-task-tmpl.md` template
- Fill in all elicited information:
  - Task metadata (ID, name, purpose)
  - Prerequisites checklist
  - Input requirements
  - Workflow sections with instructions
  - Elicitation configuration (if applicable)
  - Output specification
  - Validation criteria
  - Error handling procedures
  - Integration points
  - Usage examples
- Ensure proper markdown formatting

### 14. Review & Refinement

- Present generated task definition to user
- Ask: "Please review the task definition. Would you like to refine any section?"
- Offer refinement options:
  1. Adjust workflow steps
  2. Add/remove prerequisites
  3. Modify elicitation sections
  4. Update validation criteria
  5. Improve error handling
  6. Add more examples
  7. Refine output specification
  8. Approve as-is

### 15. Save Task File

- Determine output location:
  - If adding to existing pack: `expansion-packs/{pack_name}/tasks/{task_id}.md`
  - If standalone: `tasks/{task_id}.md`
- Write task definition file
- Confirm file created successfully

### 16. Update Dependencies

- If task is referenced by an agent:
  - Update agent's dependencies section
- If adding to existing pack:
  - Update README.md tasks section
  - Update pack documentation
- Document which agents can execute this task

### 17. Test Task Execution

- Ask: "Would you like to test executing this task?"
- If yes:
  - Activate appropriate agent
  - Execute task command
  - Verify workflow proceeds as expected
  - Check output quality
  - Document any issues found
  - Refine task if needed

### 18. Memory Layer Integration

- Save task metadata to memory:
  - Task name and ID
  - Purpose and workflow type
  - Pack association
  - Input/output specification
  - Creation date
- Tag for retrieval:
  - `expansion-task`
  - `{workflow_type}`
  - `{pack_name}`

## Outputs

- Task definition file: `tasks/{task_id}.md`
- Updated agent dependencies (if applicable)
- Updated README.md (if adding to existing pack)
- Usage instructions and examples

## Validation Criteria

- [ ] Task file has clear purpose and overview
- [ ] Prerequisites are well-defined
- [ ] Workflow steps are logical and complete
- [ ] Elicitation sections are well-structured (if applicable)
- [ ] Output specification is clear and detailed
- [ ] Validation criteria are comprehensive
- [ ] Error handling is thorough
- [ ] Examples demonstrate realistic usage
- [ ] File is saved in correct location
- [ ] Referenced by appropriate agents

## Integration with AIOS

This task creates workflows that:
- Follow AIOS task definition standards
- Can be executed by agents via commands
- Support interactive elicitation patterns
- Produce structured, validated outputs
- Integrate with templates and checklists
- Work within expansion pack ecosystem

## Notes

- Tasks should be focused on a single clear goal
- Workflow steps should be executable by LLM following instructions
- Elicitation should gather necessary information efficiently
- Validation ensures quality and completeness
- Examples help users understand task capabilities
- Testing ensures task works in practice

---

_Task Version: 1.0_
_Last Updated: 2025-09-30_
