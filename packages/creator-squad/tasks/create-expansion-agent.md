# Create Expansion Pack Agent Task

## Purpose

To create a single domain-specific agent for an AIOS expansion pack through interactive elicitation. This task can be used standalone to add an agent to an existing pack or as part of the complete pack creation workflow.

## Inputs

- Target expansion pack directory (if adding to existing pack)
- Agent requirements from user
- `expansion-agent-tmpl.md` template
- Reference agents for pattern guidance

## Key Activities & Instructions

### 1. Identify Target Pack

- Ask: "Are you adding this agent to an existing expansion pack or creating it standalone?"
- If existing pack:
  - Ask: "What is the pack name?"
  - Verify pack directory exists at `expansion-packs/{pack_name}/`
  - Load pack config.yaml to understand context
- If standalone:
  - Ask: "What pack name should this agent belong to?"
  - Note that full pack structure should be created later

### 2. Agent Identity Elicitation

- Ask: "What is the agent's name? (human-readable, e.g., 'Sarah', 'Alex', 'Morgan')"
- Ask: "What is the agent's ID? (kebab-case, e.g., 'legal-contract-specialist')"
- Ask: "What is the agent's job title or role? (e.g., 'Senior Legal Contract Specialist')"
- Ask: "What icon/emoji represents this agent? (e.g., '⚖️' for legal, '🏥' for healthcare)"
- Ask: "When should users activate this agent? Describe the use case."

### 3. Persona Development

**Role & Identity:**
- Ask: "What is this agent's professional role and expertise?"
- Ask: "How many years of experience does this agent have in their domain?"
- Ask: "What specialized certifications or qualifications does this agent have?"

**Style & Approach:**
- Ask: "How should this agent communicate? Choose one or more:
  - Formal and professional
  - Friendly and approachable
  - Technical and precise
  - Educational and guiding
  - Consultative and advisory"
- Ask: "What is this agent's work style? (e.g., methodical, creative, analytical, collaborative)"

**Focus & Priorities:**
- Ask: "What is this agent's primary focus? (e.g., accuracy, speed, compliance, innovation)"
- Ask: "What values guide this agent's decisions? (e.g., client protection, risk mitigation, quality)"

### 4. Customization & Special Behaviors

- Ask: "Are there any special behaviors or rules this agent should follow?"
- Examples to prompt:
  - Must always verify compliance before proceeding
  - Should offer multiple solution options
  - Must document all decisions
  - Should collaborate with other specific agents
  - Has access to specific tools or databases
- Document as customization instructions

### 5. Core Principles Definition

- Ask: "What are the 3-7 core principles that guide this agent's work?"
- Examples to prompt:
  - Domain-specific best practices
  - Quality standards
  - Security requirements
  - Ethical guidelines
  - Regulatory compliance
- Format as bullet list

### 6. Commands Design

- Explain: "Commands are what users can type to invoke agent actions. They start with '*' (e.g., *help, *create-contract)"
- Ask: "What commands should this agent support?"
- For each command:
  - Ask: "What does this command do?"
  - Ask: "Does it map to a task file, template, or custom behavior?"
  - Document command and its purpose
- Standard commands to include:
  - `*help` - Show numbered list of available commands
  - `*chat-mode` - (Default) Conversational mode for guidance
  - `*exit` - Say goodbye and deactivate persona

### 7. Dependencies Identification

**Tasks:**
- Ask: "What task workflows will this agent execute?"
- List tasks as filenames (e.g., `create-contract.md`, `review-document.md`)

**Templates:**
- Ask: "What output templates will this agent use?"
- List templates as filenames (e.g., `contract-template.yaml`, `report-template.yaml`)

**Checklists:**
- Ask: "What validation checklists will this agent use?"
- List checklists as filenames (e.g., `contract-checklist.md`)

**Data/Knowledge Bases:**
- Ask: "What knowledge bases or reference data does this agent need?"
- List data files as filenames (e.g., `legal-kb.md`, `regulations-db.md`)

### 8. Knowledge Areas

- Ask: "What are this agent's areas of expertise?"
- List 5-10 knowledge areas, for example:
  - Contract law and interpretation
  - Risk assessment and mitigation
  - Regulatory compliance
  - Document drafting best practices

### 9. Capabilities Definition

- Ask: "What specific capabilities does this agent have?"
- List concrete capabilities, for example:
  - Draft complex legal contracts
  - Perform risk analysis on agreements
  - Generate compliance documentation
  - Provide regulatory guidance

### 10. Security Considerations

**Code Generation Security:**
- Ask: "Will this agent generate code? If yes, what security measures should be in place?"
- Default security rules:
  - No eval() or dynamic code execution
  - Sanitize all user inputs
  - Validate file paths for traversal attempts
  - No hardcoded credentials

**Validation Security:**
- Ask: "What validation checks should this agent perform on outputs?"
- Document domain-specific validations

**Memory Access Security:**
- Default memory security:
  - Scope queries to relevant domain only
  - Rate limit memory operations
  - No exposure of sensitive information

### 11. Generate Agent Definition

- Use `expansion-agent-tmpl.md` template
- Fill in all elicited information:
  - Agent metadata (name, id, title, icon, whenToUse)
  - Customization instructions
  - Persona (role, style, identity, focus)
  - Core principles
  - Commands
  - Dependencies
  - Knowledge areas
  - Capabilities
  - Security rules
- Generate activation instructions
- Generate greeting message

### 12. Review & Refinement

- Present generated agent definition to user
- Ask: "Please review the agent definition. Would you like to refine any section?"
- Offer refinement options:
  1. Adjust persona characteristics
  2. Add/remove/modify commands
  3. Update dependencies
  4. Refine knowledge areas or capabilities
  5. Strengthen security rules
  6. Improve customization instructions
  7. Approve as-is

### 13. Save Agent File

- Determine output location:
  - If adding to existing pack: `expansion-packs/{pack_name}/agents/{agent_id}.md`
  - If standalone: `agents/{agent_id}.md`
- Write agent definition file
- Confirm file created successfully

### 14. Update Pack Documentation

- If adding to existing pack:
  - Update README.md agents section
  - Add agent to pack's config.yaml if needed
  - Update any references to agents list

### 15. Test Agent Activation

- Ask: "Would you like to test activating this agent?"
- If yes:
  - Provide activation command: `@{agent_id}`
  - Explain expected greeting
  - Explain available commands
  - Test basic interaction

### 16. Memory Layer Integration

- Save agent metadata to memory:
  - Agent name and ID
  - Domain and expertise
  - Pack association
  - Creation date
- Tag for retrieval:
  - `expansion-agent`
  - `{domain}`
  - `{pack_name}`

## Outputs

- Agent definition file: `agents/{agent_id}.md`
- Updated README.md (if adding to existing pack)
- Activation and usage instructions

## Validation Criteria

- [ ] Agent file has valid YAML configuration block
- [ ] All required metadata fields are present
- [ ] Persona is coherent and domain-appropriate
- [ ] Commands map to tasks/templates or are self-contained
- [ ] Dependencies reference files that exist or will be created
- [ ] Security rules are appropriate for agent's capabilities
- [ ] Activation greeting is clear and informative
- [ ] File is saved in correct location

## Integration with AIOS

This task creates agents that:
- Follow AIOS agent definition standards
- Can be activated with @agent-id syntax
- Integrate with memory layer
- Support standard command patterns
- Work within expansion pack structure

## Notes

- Agent personas should be authentic and domain-appropriate
- Commands should be intuitive and follow naming conventions
- Dependencies should be realistic and implementable
- Security rules must be comprehensive for agent's capabilities
- Testing activation ensures agent works as expected

---

_Task Version: 1.0_
_Last Updated: 2025-09-30_
