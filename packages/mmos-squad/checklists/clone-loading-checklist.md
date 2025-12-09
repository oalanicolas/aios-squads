# Clone Loading Checklist

**Purpose:** Validate successful cognitive clone activation
**Used by:** Mirror (emulator agent) - activate-clone.md task
**Version:** 1.0.0

---

## Pre-Activation Validation

- [ ] **Mind directory exists**
  - Path: `expansion-packs/mmos/minds/{mind_name}/`
  - Directory is accessible and readable

- [ ] **system-prompt.md found**
  - Path: `expansion-packs/mmos/minds/{mind_name}/system-prompt.md`
  - File is not empty (> 100 bytes)
  - File is readable (permissions OK)

- [ ] **system-prompt.md is valid**
  - File can be opened without errors
  - Content is parseable (valid UTF-8)
  - Contains expected structure (not corrupted)

---

## System Prompt Loading

- [ ] **system-prompt.md loaded successfully**
  - Full content read into memory
  - No I/O errors during read
  - Content length > 0

- [ ] **Token count calculated**
  - Tokens counted using appropriate method
  - Count is reasonable (e.g., 5k-50k tokens)
  - Count stored for budget tracking

- [ ] **Version identified**
  - Version extracted from frontmatter (if present)
  - Or default to "unknown" gracefully
  - Version displayed to user

- [ ] **Last updated date identified**
  - Date extracted from frontmatter or file mtime
  - Or default to "unknown" gracefully
  - Date displayed to user

---

## Metadata Handling

- [ ] **metadata.yaml checked**
  - Checked if file exists (optional)
  - If exists, loaded without errors
  - If missing, defaults applied

- [ ] **Fidelity level extracted**
  - Value from metadata.yaml or default "unknown"
  - Displayed to user

- [ ] **Last validated date extracted**
  - Value from metadata.yaml or default "unknown"
  - Displayed to user

- [ ] **Display name extracted**
  - Value from metadata.yaml or derived from mind_name
  - Properly formatted for display

---

## Knowledge Base Handling

- [ ] **KB directory checked**
  - Path: `expansion-packs/mmos/minds/{mind_name}/kb/`
  - Checked if directory exists (optional)
  - If missing, proceed without KB (not an error)

- [ ] **KB files discovered**
  - All `.md` and `.txt` files listed
  - Recursive scan of kb/ directory
  - File count stored

- [ ] **KB tokens counted**
  - Total tokens across all KB files calculated
  - Sum is accurate
  - Count stored for decision-making

- [ ] **KB loading decision made**
  - If kb_tokens <= 20k: auto-load
  - If kb_tokens > 20k: user prompted OR override applied
  - Decision logged clearly

- [ ] **KB content loaded (if approved)**
  - All approved KB files read successfully
  - Content stored in memory or context
  - No I/O errors during load

---

## Token Budget Validation

- [ ] **Total tokens calculated**
  - sum = prompt_tokens + kb_tokens (if loaded)
  - Calculation is correct

- [ ] **Budget percentage calculated**
  - percentage = (total_tokens / TOKEN_BUDGET) * 100
  - Displayed to user

- [ ] **Token budget not exceeded**
  - total_tokens <= TOKEN_BUDGET
  - OR user explicitly approved override
  - Warning shown if close to limit (>80%)

---

## Performance Tracking

- [ ] **Load time measured**
  - Start time recorded at activation begin
  - End time recorded at completion
  - Duration calculated in milliseconds

- [ ] **Load time is acceptable**
  - Cold load: < 1000ms (first time)
  - Warm load: < 500ms (subsequent)
  - If slower, investigate bottleneck

---

## Activation Report

- [ ] **Activation greeting displayed**
  - Display name shown correctly
  - Version shown (or "unknown")
  - System prompt tokens shown
  - KB status shown (loaded/skipped/not available)
  - Fidelity level shown
  - Last validated date shown
  - Load time shown
  - Total tokens shown
  - Budget percentage shown

- [ ] **Activation report saved**
  - Report generated using clone-activation-report.yaml template
  - Saved to: `temp/emulator/activation-report-{mind_name}-{timestamp}.yaml`
  - File is valid YAML
  - All fields populated

---

## Persona Embodiment

- [ ] **Emulator state updated**
  - active = true
  - mind_name, display_name, version stored
  - system_prompt content accessible
  - kb_content accessible (if loaded)
  - activated_at timestamp recorded

- [ ] **Persona elements identified**
  - Communication style parsed from system-prompt
  - Core principles identified
  - Frameworks/mental models noted
  - Signature phrases extracted (if any)

- [ ] **Agent in character**
  - Test: Ask a simple domain question
  - Response uses clone's voice/style
  - Response references clone's frameworks
  - Response stays within knowledge boundaries

---

## Post-Activation Functionality

- [ ] ***help command works**
  - Lists all available commands
  - Commands are relevant to embodied clone
  - No errors displayed

- [ ] **Clone responds to questions**
  - Can answer domain-specific questions
  - Uses appropriate vocabulary and style
  - References loaded KB when relevant

- [ ] **Clone stays in character**
  - Multiple interactions maintain persona
  - No breaking character unintentionally
  - *exit command properly deactivates

---

## Error Handling Verification

- [ ] **Graceful error handling**
  - Missing mind → clear error message
  - Missing system-prompt → clear error message
  - Invalid file format → clear error message
  - KB exceeds limit → user prompted appropriately

- [ ] **Error messages are helpful**
  - Explain what went wrong
  - Suggest corrective actions
  - Provide alternative commands

- [ ] **No crashes**
  - All errors caught and handled
  - User never sees stack traces
  - System remains stable

---

## Warnings & Edge Cases

- [ ] **Old system-prompt warning**
  - If last_updated > 30 days ago
  - Warning displayed to user
  - Suggested action: update mind

- [ ] **No metadata warning**
  - If metadata.yaml missing
  - Warning displayed: "Fidelity unknown"
  - Proceeds without blocking

- [ ] **Large KB warning**
  - If kb_tokens > 20k
  - Options presented clearly
  - User decision respected

- [ ] **No KB warning**
  - If kb/ directory missing or empty
  - Info displayed: "No KB available"
  - Note: "Responses may lack specific examples"

---

## Sign-Off

**Activation validated by:** {{tester_name}}
**Date:** {{date}}
**Mind tested:** {{mind_name}}
**Result:** ✅ PASS / ⚠️ PASS WITH WARNINGS / ❌ FAIL

**Notes:**
{{any_observations_or_issues_encountered}}

---

## Failure Criteria

**Activation FAILS if:**
- ❌ Mind directory does not exist
- ❌ system-prompt.md not found
- ❌ system-prompt.md cannot be read (I/O error)
- ❌ system-prompt.md is corrupted (parsing fails)
- ❌ Token budget exceeded without user approval
- ❌ Activation crashes or hangs
- ❌ Clone does not embody persona at all

**Activation SUCCEEDS WITH WARNINGS if:**
- ⚠️ KB exceeds limit (but user chose to skip or override)
- ⚠️ metadata.yaml missing (defaults used)
- ⚠️ system-prompt.md is old (>30 days)
- ⚠️ Load time is slow but acceptable (<2000ms)

**Activation SUCCEEDS CLEANLY if:**
- ✅ All checklist items pass
- ✅ No errors or warnings
- ✅ Clone behaves authentically
- ✅ Performance within targets

---

**Checklist Version:** 1.0.0
**Last Updated:** 2025-10-14
**Owner:** Mirror (emulator agent)
