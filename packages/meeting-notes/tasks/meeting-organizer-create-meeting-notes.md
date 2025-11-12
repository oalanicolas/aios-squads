# Create Meeting Notes Task

## Purpose

To create a structured meeting notes document that captures attendees, agenda, discussions, decisions, and action items in a clear, professional format.

## Inputs

- Meeting information (date, time, attendees)
- Meeting purpose and agenda
- Discussion points
- Decisions made
- Action items with owners and deadlines

## Key Activities & Instructions

### 1. Meeting Context Gathering

- Ask: "What is the meeting title or purpose?"
- Ask: "When is/was the meeting? (Date and time)"
- Ask: "Who attended the meeting?"
- Ask: "Who organized or facilitated the meeting?"

### 2. Agenda & Objectives

- Ask: "What was the meeting agenda or key topics?"
- Ask: "What were the main objectives for this meeting?"
- Document planned discussion topics

### 3. Discussion Capture

- Ask: "What were the main discussion points?"
- For each topic:
  - Ask: "What was discussed regarding this topic?"
  - Ask: "Were there different viewpoints or concerns raised?"
  - Document key points and perspectives

### 4. Decisions Documentation

- Ask: "What decisions were made during the meeting?"
- For each decision:
  - Ask: "What was decided?"
  - Ask: "Who made or approved this decision?"
  - Ask: "What is the rationale?"
  - Document decision and context

### 5. Action Items Tracking

- Ask: "What action items came out of this meeting?"
- For each action item:
  - Ask: "What needs to be done?"
  - Ask: "Who is responsible?"
  - Ask: "What is the deadline?"
  - Ask: "Are there any dependencies or blockers?"
  - Document action item details

### 6. Next Steps & Follow-up

- Ask: "Are there any follow-up meetings planned?"
- Ask: "What are the immediate next steps?"
- Ask: "Who should receive these notes?"

### 7. Generate Meeting Notes Document

- Use `meeting-notes-template.yaml` template
- Fill in all gathered information
- Structure notes with clear sections
- Ensure action items are prominent and actionable
- Include meeting metadata (date, attendees, etc.)

### 8. Review & Refinement

- Present generated notes to user
- Ask: "Would you like to add or modify anything in these notes?"
- Offer refinement options:
  1. Add missing discussion points
  2. Clarify decisions
  3. Add or modify action items
  4. Update attendee list
  5. Approve as-is

### 9. Save Notes File

- Determine filename: `meetings/meeting-notes-{YYYY-MM-DD}-{meeting-slug}.md`
- Write notes document
- Confirm file created successfully

### 10. Distribution

- Ask: "Would you like me to prepare these notes for distribution?"
- If yes:
  - Generate summary version for quick reading
  - Highlight urgent action items
  - List attendees who should receive notes

## Outputs

- Meeting notes document: `meetings/meeting-notes-{date}-{topic}.md`
- Action items summary (if requested)
- Distribution list (if applicable)

## Validation Criteria

- [ ] Meeting metadata (date, time, attendees) is complete
- [ ] Agenda and objectives are clearly stated
- [ ] Discussion points are organized by topic
- [ ] All decisions are explicitly documented
- [ ] Action items have owners and deadlines
- [ ] Next steps are clearly defined
- [ ] Document is well-formatted and professional
- [ ] File is saved in correct location

## Integration with AIOS

This task:
- Uses meeting-notes-template.yaml for output generation
- Can be executed by meeting-organizer agent
- Integrates with action tracking workflows
- Supports follow-up meeting planning

## Notes

- Keep discussion summaries concise but complete
- Always capture decisions explicitly, even if they seem obvious
- Action items should be specific and measurable
- Include relevant context for future reference
- Consider confidentiality when documenting sensitive discussions

---

_Task Version: 1.0_
_Last Updated: 2025-09-30_
