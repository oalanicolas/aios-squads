# Create Expansion Pack Template Task

## Purpose

To create a single output template for an AIOS expansion pack through interactive elicitation. This task can be used standalone to add a template to an existing pack or as part of the complete pack creation workflow.

## Inputs

- Target expansion pack directory (if adding to existing pack)
- Template requirements from user
- `expansion-template-tmpl.yaml` template (meta-template)
- Reference templates for pattern guidance

## Key Activities & Instructions

### 1. Identify Target Pack

- Ask: "Are you adding this template to an existing expansion pack or creating it standalone?"
- If existing pack:
  - Ask: "What is the pack name?"
  - Verify pack directory exists at `expansion-packs/{pack_name}/`
  - Load pack config.yaml to understand context
- If standalone:
  - Ask: "What pack name should this template belong to?"
  - Note that full pack structure should be created later

### 2. Template Identity & Purpose

- Ask: "What is the template name? (human-readable, e.g., 'Legal Contract')"
- Ask: "What is the template ID? (kebab-case, e.g., 'legal-contract-template')"
- Ask: "What type of document or artifact does this template generate?"
- Ask: "What is the purpose of outputs created from this template?"

### 3. Output Format Selection

- Ask: "What format should the output be?
  - Markdown (.md) - Documents, reports, documentation
  - YAML (.yaml) - Structured data, configuration
  - JSON (.json) - Data interchange, API responses
  - HTML (.html) - Web pages, formatted documents
  - Plain Text (.txt) - Simple text files
  - Other (specify)"
- Ask: "What is the output filename pattern?" (e.g., `docs/{project_name}-contract.md`)
- Ask: "What is the output title pattern?" (e.g., `"{project_name} Service Agreement"`)

### 4. Workflow Configuration

- Ask: "How should this template be used?
  A. Automated - Template filled automatically without user input
  B. Interactive - Template requires user elicitation to fill in details"
- If Interactive:
  - Ask: "What level of elicitation is needed?
    - Basic - Simple questions to fill placeholders
    - Advanced - Structured options with refinement capabilities"

### 5. Advanced Elicitation Design (If Applicable)

- If Advanced elicitation selected:
  - Ask: "What is the elicitation flow title?" (e.g., "Contract Generation Wizard")
  - Ask: "What are the main elicitation sections?"
  - For each elicitation section:
    - Ask: "What is the section ID?" (kebab-case)
    - Ask: "What options should be presented to the user?"
    - Document each option with description
  - Structure as custom_elicitation configuration

### 6. Template Complexity Assessment

- Ask: "What is the complexity level of this template?
  A. Simple - Single section with few placeholders
  B. Structured - Multiple organized sections
  C. Complex - Many sections with conditional logic
  D. Advanced - Nested sections, repeatable blocks, diagrams"
- Document complexity level

### 7. Sections Definition

- Ask: "What are the main sections of this template output?"
- For each section:
  - Ask: "What is the section ID?" (kebab-case)
  - Ask: "What is the section title?" (optional, human-readable)
  - Ask: "What instruction should guide generation of this section?"
  - Ask: "Should this section elicit user input?" (true/false)
  - Ask: "What is the structure/template for this section?"
  - Ask: "Are there conditions for including this section?" (optional)
  - Ask: "Can you provide examples for this section?" (optional)
  - Document section structure

### 8. Placeholders Identification

- Ask: "Let's identify all the variable information that needs to be filled in."
- For each section, identify placeholders:
  - Ask: "What information varies in this section?"
  - Ask: "What should we call each placeholder?" (e.g., `{{project_name}}`, `{{client_name}}`)
  - Ask: "Is this placeholder required or optional?"
  - Ask: "What is the expected format or type?" (text, date, number, etc.)
- Create comprehensive placeholder list with descriptions

### 9. Special Features Configuration

**Repeatable Sections:**
- Ask: "Are there any sections that should repeat multiple times?" (e.g., list of items)
- If yes:
  - Document repeatable section pattern
  - Define iteration variable (e.g., `{{item_number}}`)

**Conditional Sections:**
- Ask: "Are there any sections that should only appear under certain conditions?"
- If yes:
  - Ask: "What is the condition for including this section?"
  - Document conditional logic

**Diagrams:**
- Ask: "Should this template include any diagrams?" (Mermaid, etc.)
- If yes:
  - Ask: "What type of diagram?" (graph, flowchart, sequence, class, etc.)
  - Define diagram structure

**Nested Sections:**
- Ask: "Are there any sections that contain subsections?"
- If yes:
  - Define hierarchy and nesting structure

### 10. Examples Creation

- Ask: "Can you provide example outputs for each major section?"
- Gather:
  - Sample filled-in section content
  - Realistic placeholder values
  - Representative use cases
- Document 1-3 complete examples

### 11. Validation Rules

- Ask: "What validation should be performed on outputs generated from this template?"
- Prompt for:
  - Required sections/fields
  - Format validation rules
  - Domain-specific validation
  - Cross-field validation (dependencies between fields)
  - Output size or length limits
- Document validation criteria

### 12. Generate Template Definition

- Use `expansion-template-tmpl.yaml` meta-template
- Fill in all elicited information:
  - Template metadata (id, name, version)
  - Output configuration (format, filename, title)
  - Workflow configuration (mode, elicitation type)
  - Custom elicitation sections (if applicable)
  - All template sections with instructions
  - Placeholder documentation
  - Special features (repeatable, conditional, diagrams, nested)
  - Examples
  - Validation rules
- Ensure proper YAML syntax

### 13. Review & Refinement

- Present generated template definition to user
- Ask: "Please review the template definition. Would you like to refine any section?"
- Offer refinement options:
  1. Adjust section structure
  2. Add/remove sections
  3. Modify placeholders
  4. Update elicitation flow
  5. Improve examples
  6. Add special features (conditionals, repeatable, etc.)
  7. Strengthen validation rules
  8. Approve as-is

### 14. Save Template File

- Determine output location:
  - If adding to existing pack: `expansion-packs/{pack_name}/templates/{template_id}.yaml`
  - If standalone: `templates/{template_id}.yaml`
- Write template definition file
- Confirm file created successfully

### 15. Update Dependencies

- If template is referenced by an agent:
  - Update agent's dependencies section
- If template is used by a task:
  - Document task-template relationship
- If adding to existing pack:
  - Update README.md templates section
  - Update pack documentation

### 16. Test Template Generation

- Ask: "Would you like to test using this template to generate sample output?"
- If yes:
  - Create sample context with placeholder values
  - Execute template generation
  - Review generated output
  - Verify all sections appear correctly
  - Check placeholders are filled properly
  - Validate output format
  - Document any issues found
  - Refine template if needed

### 17. Memory Layer Integration

- Save template metadata to memory:
  - Template name and ID
  - Purpose and output format
  - Pack association
  - Sections structure
  - Placeholders list
  - Creation date
- Tag for retrieval:
  - `expansion-template`
  - `{output_format}`
  - `{pack_name}`

## Outputs

- Template definition file: `templates/{template_id}.yaml`
- Updated agent/task dependencies (if applicable)
- Updated README.md (if adding to existing pack)
- Sample generated output (from testing)

## Validation Criteria

- [ ] Template file has valid YAML syntax
- [ ] All required metadata fields are present
- [ ] Output configuration is complete and correct
- [ ] Sections are well-structured and logical
- [ ] All placeholders are documented
- [ ] Examples demonstrate expected output
- [ ] Elicitation flow is clear (if interactive)
- [ ] Special features are properly configured
- [ ] Validation rules are comprehensive
- [ ] File is saved in correct location
- [ ] Referenced by appropriate agents/tasks

## Integration with AIOS

This task creates templates that:
- Follow AIOS template definition standards
- Can be used by agents via tasks
- Support interactive elicitation patterns
- Produce structured, validated outputs
- Work with placeholder substitution system
- Integrate with expansion pack ecosystem

## Notes

- Templates should produce professional, high-quality outputs
- Placeholder names should be intuitive and descriptive
- Sections should be logically organized
- Elicitation should gather necessary information efficiently
- Examples help users understand template capabilities
- Validation ensures output quality and completeness
- Testing verifies template works as expected in practice

---

_Task Version: 1.0_
_Last Updated: 2025-09-30_
