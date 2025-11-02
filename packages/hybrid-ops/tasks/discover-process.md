# Discover Process Task

## Purpose

To understand an existing or new process through structured discovery, identifying pain points, automation opportunities, and current state. This task captures the foundation that all subsequent hybrid process design will build upon.

## Inputs

- User's process requirements and domain knowledge
- Existing process documentation (if available)
- Stakeholder availability for interviews
- Templates from `expansion-packs/hybrid-ops/templates/`

## Key Activities & Instructions

### 1. Determine Process Context

**Ask the user:**
"Are we mapping an existing process or designing a new one from scratch?"

- **If Existing Process:** Proceed to comprehensive discovery (Section 2)
- **If New Process:** Skip to high-level design capture (Section 3)

### 2. Capture Current State (For Existing Processes)

**2.1 Stakeholder Discovery**

Interview key stakeholders and document:
- **Who performs** each step currently?
- **What tools/systems** are used?
- **How long** does each step take?
- **What are the pain points** and bottlenecks?
- **What goes wrong** most often?

**Elicitation Questions:**
```
- "Who are the primary stakeholders involved in this process?"
- "Walk me through the process step-by-step as it works today."
- "What tools or systems does the team currently use?"
- "Where do delays or errors typically occur?"
- "What manual work would you most like to eliminate?"
```

**2.2 Document Current Workflow**

Capture the as-is workflow:
- List all current tasks/steps
- Identify handoff points between people/systems
- Document data that flows between steps
- Note decision points and approval gates

**2.3 Map Pain Points**

Identify and prioritize issues:
- **Bottlenecks:** Where does work pile up?
- **Errors:** Where do mistakes happen most?
- **Rework:** What gets done twice?
- **Manual work:** What's tedious and repetitive?
- **Communication gaps:** Where do handoffs fail?

**2.4 Inventory Tools & Systems**

List all systems involved:
- Name and purpose of each tool
- Who has access
- What data is stored where
- Integration points (APIs, exports, etc.)

### 3. Identify Automation Opportunities

**3.1 Assess Tasks for Automation**

For each identified task, evaluate:

**HIGH Automation Potential:**
- Repetitive tasks (same steps every time)
- Rule-based decisions (if-then logic)
- Data validation and formatting
- API integrations
- Report generation
- Notifications and routing

**MEDIUM Automation Potential:**
- Tasks with some variability
- Requires data lookup + simple judgment
- Content generation with templates
- Workflow orchestration

**LOW Automation Potential:**
- High creativity required
- Complex judgment calls
- Customer-facing interactions
- Strategic decision-making
- Exception handling

**3.2 Identify Hybrid Candidates**

Recommend hybrid (agent + human) execution for:
- Tasks that CAN be automated but need human oversight
- Tasks with 80%+ predictable patterns, 20% edge cases
- Tasks where confidence thresholds determine escalation

### 4. Generate Discovery Document

**4.1 Use Discovery Template**

Load template: `templates/process-discovery-tmpl.yaml`

**4.2 Populate Template Sections**

Fill in all discovered information:
- Process overview and purpose
- Current state documentation
- Stakeholder list with roles
- Pain points (prioritized)
- Tool/system inventory
- Automation opportunity assessment
- Recommended migration strategy

**4.3 Save Discovery Document**

Output to: `output/discovery/{process_id}-discovery.md`

### 5. Review with Stakeholders

**Present findings:**
- Share discovery document with stakeholders
- Confirm accuracy of captured information
- Validate prioritization of pain points
- Get agreement on automation candidates

**Refine if needed:**
- Incorporate stakeholder feedback
- Adjust automation recommendations
- Update discovery document

## Outputs

- **Discovery Document** (`output/discovery/{process_id}-discovery.md`)
  - Current state mapped
  - Pain points identified and prioritized
  - Tool/system inventory complete
  - Automation opportunities assessed

- **Stakeholder Summary**
  - List of all stakeholders with roles
  - Contact information
  - Availability for future phases

- **Migration Candidate List**
  - Tasks ranked by automation potential (High/Medium/Low)
  - Recommended approach (Agent/Human/Hybrid) for each
  - Estimated effort and ROI

## Next Steps

**Handoff to Phase 2: Process Architecture Design**

When discovery is complete:
1. Confirm: Discovery document reviewed and approved by stakeholders
2. Confirm: Process scope clearly defined
3. Confirm: Key stakeholders identified and available
4. **Activate:** `@hybridOps:process-architect` for Phase 2
5. **Pass:** Discovery document as input to architecture design

**Success Criteria for Handoff:**
- [ ] Discovery document complete and stakeholder-approved
- [ ] All pain points documented
- [ ] Automation candidates identified
- [ ] Tool/system inventory complete
- [ ] Process boundaries clearly defined
