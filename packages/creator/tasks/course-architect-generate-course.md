---
task_name: "generate-course"
task_version: "2.7"
required_agent_version: ">=2.2"
description: "Initialize course structure with greenfield/brownfield detection, MMOS persona integration, file organization, ICP extraction, voice pattern extraction, learning objectives inference, and smart elicitation with gap analysis"
last_updated: "2025-10-18"
---

# Task: Generate Course

**Task ID:** generate-course
**Version:** 2.2
**Purpose:** Initialize course structure with greenfield/brownfield detection and unified brief document
**Owner:** Course Architect Agent
**Estimated Time:** 30-60 seconds (initialization only)
**Elicit:** true

---

## Overview

**WORKFLOW v2.1 - Greenfield/Brownfield Detection + Unified Brief**

This task initializes a course by detecting whether you're creating from scratch (greenfield) or upgrading existing materials (brownfield), validating the mode against folder state, and setting up the appropriate workflow.

**What This Task Does:**
1. Prompts for course slug (short identifier)
2. **NEW: Asks greenfield vs brownfield mode**
3. **NEW: Validates mode against folder existence (4 scenarios)**
4. **NEW: Branches to appropriate workflow**
5. Creates `/outputs/courses/{course-slug}/` directory structure (greenfield only)
6. Copies `course-brief.md` template to `COURSE-BRIEF.md` (greenfield only)
7. **HALTS and notifies user with mode-specific next steps**

**What This Task Does NOT Do:**
- Does NOT generate course content (that's `continue-course` task)
- Does NOT ask 15-20 interactive questions (v1.0 deprecated)
- Does NOT elicit requirements incrementally
- Does NOT extract brownfield materials yet (Phase 2: Stories 3.2-3.4)

**Success Criteria:**
- Mode selection validated against folder state (100% accuracy)
- Appropriate workflow executed (greenfield or brownfield)
- creation_mode metadata persisted to COURSE-BRIEF.md
- User notified with clear, context-aware next steps
- Error recovery options provided for conflicts

---

## Input Parameters

### Required Parameters

1. **course_slug** (string, required)
   - Description: Short identifier for the course (used in folder/file names)
   - Example: "clone-ia-express", "python-data-science", "team-onboarding"
   - Validation:
     - Lowercase letters, numbers, hyphens only
     - 3-50 characters
     - Must not already exist in `/outputs/courses/`
   - Format: kebab-case (e.g., "my-course-name")

### Elicitation

```yaml
elicitation:
  step: "Gather course slug, creation mode, and MMOS persona selection"

  questions:
    1_course_slug:
      prompt: |
        What is the course identifier (slug)?

        This will be used for:
        - Folder name: /outputs/courses/{slug}/
        - Brief file: /outputs/courses/{slug}/COURSE-BRIEF.md

        Format: lowercase, hyphens only (e.g., "my-course-name")

        Course slug:

      validation:
        - Must be 3-50 characters
        - Must be lowercase letters, numbers, hyphens only

      examples:
        - "clone-ia-express"
        - "python-data-science"
        - "team-onboarding-v2"

    2_creation_mode:
      prompt: |
        Is this course:

        1. Greenfield - Creating from scratch (no existing materials)
           → Start with blank slate, fill COURSE-BRIEF manually
           → Folder should NOT exist yet

        2. Brownfield - Upgrading/migrating existing course materials
           → Extract content from existing files
           → Folder should already exist with materials

        Your choice (1 or 2):

      validation:
        - Must be 1 or 2
        - Will be validated against folder existence

      default_suggestion: |
        (Checking folder existence to suggest default...)

    3_mmos_persona:
      prompt: |
        MMOS Instructor Persona Integration:

        I can load instructor voice from MMOS cognitive clones (if available).

        Options:
        1. Yes - Scan for MMOS minds and let me select one
        2. No - I'll define voice manually or use transcript extraction

        Use MMOS persona? (1 or 2):

      validation:
        - Must be 1 or 2

      conditional_flow:
        if_yes:
          action: "Call mmos_integrator.detect_available_minds()"
          next: "Show MMOS selection menu (if minds found)"
        if_no:
          action: "Skip MMOS integration"
          next: "Continue to file organization (brownfield) or template copy (greenfield)"

      note: |
        MMOS integration provides:
        - Authentic instructor voice (95%+ fidelity)
        - No need for transcript extraction
        - Auto-populated Section 4 in COURSE-BRIEF
        - System prompt loaded during lesson generation
```

---

## Processing Pipeline

### Step 1: Brief Initialization

**1.1. Validate Course Slug**

```yaml
slug_validation:
  step: "Validate and sanitize course slug"

  checks:
    1_format:
      - Must be lowercase letters, numbers, hyphens only
      - Must be 3-50 characters
      - Regex: ^[a-z0-9-]{3,50}$

  sanitization:
    - Convert to lowercase
    - Replace spaces with hyphens
    - Remove special characters
    - Trim to 50 chars if needed

  output:
    validated_slug: "{sanitized-course-slug}"
```

**1.2. Validate Creation Mode vs Folder State**

```yaml
mode_validation:
  step: "Validate creation mode matches folder existence"

  inputs:
    - validated_slug (from step 1.1)
    - creation_mode (1=greenfield, 2=brownfield from elicitation)

  checks:
    folder_path: "outputs/courses/{slug}/"
    folder_exists: "Check if path exists"
    file_count: "Count files recursively (if exists)"

  validation_scenarios:

    scenario_1_greenfield_pass:
      condition: "mode=greenfield AND folder does NOT exist"
      result: SUCCESS
      message: |
        ✓ Greenfield mode validated
        ✓ Folder does not exist (will be created)

        Proceeding to create course structure...

    scenario_2_greenfield_conflict:
      condition: "mode=greenfield AND folder EXISTS"
      result: ERROR
      message: |
        ❌ CONFLICT: Greenfield mode selected but folder already exists!

        Found: outputs/courses/{slug}/
        Contains: {file_count} files

        This suggests you meant "Brownfield" (upgrade existing course).

        Recovery options:
        1. Change to Brownfield mode (recommended)
        2. Delete existing folder and continue as Greenfield (⚠️ DESTRUCTIVE)
        3. Choose different slug

        What would you like to do? (1/2/3):

      recovery_actions:
        option_1_switch_to_brownfield:
          action: "Set creation_mode = brownfield"
          next: "Re-run validation (should pass scenario_3)"

        option_2_delete_folder:
          action: "Delete outputs/courses/{slug}/ recursively"
          confirmation: "Are you SURE? This will delete {file_count} files. Type 'DELETE' to confirm:"
          if_confirmed: "Delete folder and proceed to step 1.3"
          if_not_confirmed: "Abort and re-prompt options"

        option_3_change_slug:
          action: "Re-prompt for slug (back to elicitation step 1)"

    scenario_3_brownfield_pass:
      condition: "mode=brownfield AND folder EXISTS"
      result: SUCCESS
      message: |
        ✓ Brownfield mode validated
        ✓ Folder exists: outputs/courses/{slug}/
        ✓ Found {file_count} files

        Next: Analyzing existing materials...

    scenario_4_brownfield_conflict:
      condition: "mode=brownfield AND folder does NOT exist"
      result: ERROR
      message: |
        ❌ CONFLICT: Brownfield mode selected but no folder found!

        Expected: outputs/courses/{slug}/

        Brownfield mode requires existing materials to upgrade.

        Recovery options:
        1. Change to Greenfield mode (create new course)
        2. Create folder manually and add materials, then retry
        3. Check slug spelling (typo?)

        What would you like to do? (1/2/3):

      recovery_actions:
        option_1_switch_to_greenfield:
          action: "Set creation_mode = greenfield"
          next: "Re-run validation (should pass scenario_1)"

        option_2_manual_setup:
          action: "Halt workflow"
          instructions: |
            Please create the folder and add your materials:

            1. Create folder: mkdir -p outputs/courses/{slug}/
            2. Add your existing course materials to this folder
            3. Run this command again: *generate-course

        option_3_check_slug:
          action: "Re-prompt for slug (back to elicitation step 1)"

  output:
    creation_mode: "greenfield | brownfield"
    folder_state:
      exists: "true | false"
      file_count: "{number}"
      validated_at: "{timestamp}"
```

**1.2.1. MMOS Persona Selection (Optional)**

```yaml
mmos_persona_selection:
  step: "Detect and select MMOS instructor persona (if requested)"

  applies_to: "Both greenfield and brownfield modes"

  prerequisites:
    - User answered Question 3 (Use MMOS persona?)
    - If "Yes" → Proceed with MMOS detection
    - If "No" → Skip this step entirely

  import:
    module: "expansion-packs/creator-os/lib/mmos_integrator.py"
    class: "MMOSIntegrator"

  actions:
    1_detect_mmos_minds:
      description: "Scan outputs/minds/ for available MMOS personas"

      execution: |
        from lib.mmos_integrator import MMOSIntegrator

        integrator = MMOSIntegrator()
        available_minds = integrator.detect_available_minds()

      detection_logic:
        - Scan outputs/minds/ directory
        - Validate MMOS structure (identity-core.yaml, cognitive-spec.yaml, etc.)
        - Extract metadata (name, description, version)
        - Check for system prompts
        - Return sorted list

      output:
        - List of MMOSMindMetadata objects
        - 0-N minds available

    2_handle_no_minds:
      description: "Handle case where no MMOS minds found"

      condition: "len(available_minds) == 0"

      message: |
        ℹ️  No MMOS minds detected in outputs/minds/

        To use MMOS persona integration, you need at least one MMOS mind.

        Options:
        1. Continue without MMOS (use manual voice or transcript extraction)
        2. Create MMOS mind first, then return

        Your choice (1/2):

      handling:
        option_1_continue:
          action: "Set mmos_enabled = False, proceed to next step"

        option_2_create_mind:
          action: "Halt workflow"
          instructions: |
            To create an MMOS mind:

            1. Go to expansion-packs/mmos-mind-mapper/
            2. Run: python scripts/pipeline.py
            3. Follow the MMOS creation workflow
            4. Return and run *generate-course again

    3_elicit_selection:
      description: "Interactive MMOS mind selection"

      condition: "len(available_minds) > 0"

      execution: |
        selected_mind = integrator.elicit_mmos_selection(available_minds)

      display_format: |
        ════════════════════════════════════════════════════════════
        🧠 MMOS INSTRUCTOR PERSONAS DETECTED
        ════════════════════════════════════════════════════════════

        I found {count} MMOS cognitive clone(s) available:

        [1] João Lozano
            → Empreendedor Digital | Tom: Inspirador, pragmático
            → Source: outputs/minds/joao_lozano/
            ✅ Has system prompt

        [2] Pedro Valério
            → Tech Educator | Tom: Didático, hands-on
            → Source: outputs/minds/pedro_valerio/
            ✅ Has system prompt

        [N+1] None (I'll define voice manually)

        ════════════════════════════════════════════════════════════

        💡 TIP: Using MMOS persona ensures lessons sound exactly like
               the original instructor (95%+ voice fidelity).

        ════════════════════════════════════════════════════════════

        → Use MMOS instructor persona for this course?

           Your choice (1-N+1): _

      validation:
        - Must be valid number in range 1 to N+1
        - N+1 = "None" option

      output:
        - selected_mind: MMOSMindMetadata object (or None)
        - mmos_enabled: true/false

    4_load_voice_profile:
      description: "Load voice profile from selected MMOS mind"

      condition: "selected_mind is not None"

      execution: |
        voice_profile = integrator.load_voice_profile(selected_mind)

      extraction_sources:
        - analysis/identity-core.yaml → tone, values, worldview
        - analysis/cognitive-spec.yaml → style, decision-making
        - synthesis/communication-style.md → language patterns, phrases
        - synthesis/frameworks.md → teaching philosophy (if exists)

      output:
        - MMOSVoiceProfile object with complete voice data
        - Confidence score 0-100%

    5_store_mmos_config:
      description: "Store MMOS config for later use"

      execution: |
        mmos_config = {
            "enabled": True,
            "mind_slug": selected_mind.slug,
            "mind_name": selected_mind.name,
            "mind_version": selected_mind.version,
            "voice_source": "mmos",
            "system_prompt_path": integrator.get_system_prompt_path(selected_mind),
            "voice_profile": voice_profile,
            "selected_at": datetime.now().isoformat()
        }

      note: |
        This config will be:
        1. Added to COURSE-BRIEF.md frontmatter (Step 1.4)
        2. Used to pre-fill Section 4 (Voice) in COURSE-BRIEF
        3. Used to skip transcript extraction (Step 2.6)
        4. Used to skip voice questions in gap analysis (Step 3)
        5. Loaded during lesson generation (Story 3.9)

      output:
        - mmos_config dict (persisted in memory for this session)

    6_display_summary:
      description: "Show MMOS selection summary"

      message: |
        ✓ MMOS persona selected: {mind_name}

        Voice profile loaded:
        - Tone: {tone}
        - Style: {style}
        - Recurring phrases: {count}
        - Core values: {count}
        - Confidence: {score}%

        System prompt: {system_prompt_path}

        → Voice will be auto-populated in COURSE-BRIEF Section 4
        → Transcript extraction will be skipped (MMOS voice takes priority)

  error_handling:
    corrupted_mind:
      scenario: "Mind folder missing required files"
      action: "Exclude from available_minds list, continue"
      message: |
        ⚠️  Warning: MMOS mind `{slug}` is incomplete (skipping)

        Missing files: {missing_files}

        Recommendation: Re-run MMOS pipeline for this mind.

    no_system_prompt:
      scenario: "Mind has no system prompt for lesson generation"
      action: "Allow selection but warn user"
      message: |
        ⚠️  Warning: Mind `{slug}` has no system prompt

        You can still use voice profile for Section 4, but lesson
        generation won't have full MMOS persona injection.

        Continue with this mind? (yes/no):

    version_mismatch:
      scenario: "Mind uses old MMOS version (v1.0)"
      action: "Allow selection but warn user"
      message: |
        ⚠️  Warning: Mind `{slug}` uses MMOS v{version} (old format)

        CreatorOS works best with MMOS v2.0+.

        Recommendation: Upgrade mind or choose another.

        Continue anyway? (yes/no):

  output:
    mmos_selection_result:
      mmos_enabled: true/false
      selected_mind: MMOSMindMetadata | None
      voice_profile: MMOSVoiceProfile | None
      mmos_config: dict | None
```

**1.3. Create Folder Structure (Greenfield Only)**

```yaml
folder_creation:
  step: "Create course directory structure"

  applies_to: "Only runs in GREENFIELD mode"

  skip_if: "creation_mode = brownfield (folder already exists)"

  base_path: "outputs/courses/{course-slug}/"

  directories_to_create:
    - outputs/courses/{course-slug}/
    - outputs/courses/{course-slug}/lessons/
    - outputs/courses/{course-slug}/assessments/
    - outputs/courses/{course-slug}/resources/

  error_handling:
    if_permission_denied: ERROR - "Cannot create directory - check permissions"

  output:
    created_paths: [list of created directories]
```

**1.4. Copy Brief Template (Greenfield Only)**

```yaml
template_copy:
  step: "Copy unified brief template to course folder"

  applies_to: "Only runs in GREENFIELD mode"

  skip_if: "creation_mode = brownfield (brief will be extracted from existing materials)"

  source:
    template_path: "expansion-packs/creator-os/templates/course-brief.md"

  destination:
    brief_path: "outputs/courses/{course-slug}/COURSE-BRIEF.md"

  actions:
    1_check_template:
      - Verify template exists at source path
      - If not found: ERROR - "Template not found. Check CreatorOS installation."

    2_copy_template:
      - Copy template to destination
      - Preserve all content exactly
      - Set file permissions: 644 (rw-r--r--)

    3_update_metadata:
      - Replace placeholders in brief frontmatter:
        - course_slug: {course-slug}
        - created_date: {current_timestamp}
        - creation_mode: "greenfield"
        - folder_state_at_start:
            exists: false
            file_count: 0
            has_legacy_materials: false
        - status: "🟡 Aguardando Preenchimento"

    4_add_mmos_config:
      description: "Add MMOS persona config if MMOS was selected"

      condition: "mmos_config is not None and mmos_config['enabled'] == True"

      action: |
        # Update frontmatter with MMOS config
        mmos_persona:
          enabled: true
          mind_slug: {mmos_config['mind_slug']}
          mind_name: {mmos_config['mind_name']}
          mind_version: {mmos_config['mind_version']}
          voice_source: mmos
          system_prompt_path: {mmos_config['system_prompt_path']}
          selected_at: {mmos_config['selected_at']}
          confidence_score: {mmos_config['voice_profile'].confidence_score}

    5_prefill_section_4:
      description: "Pre-fill Section 4 (Voice) if MMOS was selected"

      condition: "mmos_config is not None and mmos_config['enabled'] == True"

      execution: |
        integrator.prefill_course_brief(
            voice_profile=mmos_config['voice_profile'],
            course_slug=course_slug
        )

      result: |
        Section 4 (Voice & Personality) auto-populated with:
        - Instructor name
        - Tone & style
        - Recurring phrases
        - Teaching philosophy
        - Core values
        - Status: 🟢 (loaded from MMOS)

  output:
    brief_file_path: "outputs/courses/{course-slug}/COURSE-BRIEF.md"
    mmos_integrated: true/false
```

**1.5. Create README Placeholder**

```yaml
readme_creation:
  step: "Create placeholder README with next steps"

  file: "outputs/courses/{course-slug}/README.md"

  content: |
    # Course: {course-slug}

    **Status:** 🟡 Awaiting Brief Completion

    ---

    ## Next Steps

    1. **Fill the Course Brief:**
       - Open: `COURSE-BRIEF.md`
       - Complete ALL 8 sections (estimated time: 45-90 minutes)
       - Save the file

    2. **Continue Course Generation:**
       - Run: `*continue-course {course-slug}`
       - The system will read your brief and generate the full course

    ---

    **Created:** {timestamp}
    **Framework:** AIOS Course Creation Workflow v2.0
```

**1.6. Workflow Branching**

```yaml
workflow_branching:
  step: "Route to appropriate workflow based on creation mode"

  greenfield_workflow:
    condition: "creation_mode = greenfield"
    next_step: "Step 1.7 - User Notification & HALT (Greenfield)"
    description: "User must fill COURSE-BRIEF.md manually before generation"

  brownfield_workflow:
    condition: "creation_mode = brownfield"
    next_step: "Step 1.7 - User Notification & HALT (Brownfield)"
    description: "User should prepare materials before running extraction workflow (Phase 2)"
```

**1.7. User Notification & HALT**

**For Greenfield Mode:**

```yaml
notification_greenfield:
  step: "Notify user and HALT workflow"

  applies_to: "creation_mode = greenfield"

  message_to_user: |
    ✓ Course structure initialized successfully!

    📁 Created:
    - Folder: /outputs/courses/{course-slug}/
    - Brief: /outputs/courses/{course-slug}/COURSE-BRIEF.md
    - README: /outputs/courses/{course-slug}/README.md

    ---

    📋 **NEXT STEP - Fill the Course Brief:**

    1. Open: `outputs/courses/{course-slug}/COURSE-BRIEF.md`
    2. Complete ALL 8 sections (estimated time: 45-90 minutes):
       - Section 1: Basic Information (5-10 min)
       - Section 2: ICP & Target Audience (15-25 min)
       - Section 3: Content & Pedagogy (20-30 min)
       - Section 4: Voice & Personality (10-15 min)
       - Section 5: Format & Delivery (5-10 min)
       - Section 6: Commercial & Launch (10-15 min)
       - Section 7: Additional Context (5-10 min)
       - Section 8: Final Checklist (2 min)
    3. Save the file

    ---

    **When ready, run:**
    ```
    *continue-course {course-slug}
    ```

    This will read your brief and generate the complete course.

  workflow_state: "HALTED"
  next_task: "continue-course"
```

**For Brownfield Mode:**

```yaml
notification_brownfield:
  step: "Notify user and HALT workflow"

  applies_to: "creation_mode = brownfield"

  message_to_user: |
    ✓ Brownfield mode activated!

    📁 Detected:
    - Folder: /outputs/courses/{course-slug}/
    - Files found: {file_count}

    ---

    📋 **NEXT STEPS - Brownfield Workflow:**

    **Phase 2: Material Extraction (Future Implementation)**

    The system will extract content from your existing materials to:
    1. Generate COURSE-BRIEF.md automatically (from existing content)
    2. Identify ICP from audience descriptions
    3. Extract instructor voice patterns
    4. Map existing structure to course outline

    **For now (Phase 1 - Manual Path):**

    1. Create COURSE-BRIEF.md manually in: outputs/courses/{course-slug}/
    2. Fill all sections based on your existing materials
    3. Run: *continue-course {course-slug}

    ---

    **Status:** Brownfield workflow is planned for Story 3.2-3.4 (Phase 2)
    **Current workaround:** Use greenfield flow with manual COURSE-BRIEF.md

  workflow_state: "HALTED"
  next_task: "continue-course (after manual COURSE-BRIEF.md creation)"
  note: "Automated brownfield extraction coming in Phase 2 (Stories 3.2-3.4)"
```

---

### Step 2: File Organization (Brownfield Only)

**This step runs ONLY in brownfield mode after validation passes (Scenario 3).**

**2.1. File Inventory & Categorization**

```yaml
file_organization:
  step: "Organize existing materials into canonical structure"

  applies_to: "Only runs in BROWNFIELD mode (creation_mode = brownfield)"

  skip_if: "creation_mode = greenfield (no existing files to organize)"

  prerequisites:
    - Brownfield mode validated (Scenario 3 passed)
    - Folder exists with files

  import:
    module: "expansion-packs/creator-os/lib/file_organizer.py"
    class: "FileOrganizer"

  actions:
    1_scan_files:
      description: "Recursively scan course folder and build inventory"

      execution: |
        from lib.file_organizer import FileOrganizer

        organizer = FileOrganizer(course_slug)
        inventory = organizer.scan()

      output:
        - List of FileMetadata objects with categorization
        - Total files scanned
        - Categories detected

    2_dry_run_preview:
      description: "Show user what WOULD be done (don't move yet)"

      execution: |
        result = organizer.organize(dry_run=True)

      display: |
        📊 File Organization Preview

        Found {result.files_scanned} files:
        - {count_transcripts} transcripts → /legado/transcripts/
        - {count_videos} videos → /legado/videos/
        - {count_icp} ICP documents → /legado/
        - {count_profiles} instructor profiles → /legado/
        - {count_resources} resources → /resources/
        - {count_images} images → /resources/
        - {count_lessons} lessons → /lessons/ (preserved)
        - {count_structured} structured data → root (preserved)
        - {count_unknown} unknown files → /legado/other/

        Duration: {result.duration_seconds:.2f} seconds

      output:
        - Preview of all movements
        - No files actually moved

    3_user_approval:
      description: "Ask user to approve organization plan"

      prompt: |
        Review the organization plan above.

        This will organize your {result.files_scanned} files into the canonical structure.
        No files will be deleted (only moved). A full audit log will be generated.

        Options:
        1. Approve and execute organization
        2. Skip organization (I'll organize manually)
        3. Cancel and exit

        Your choice (1/2/3):

      validation:
        - Must be 1, 2, or 3

      handling:
        option_1_approve:
          action: "Proceed to step 2.2 (Execute Organization)"

        option_2_skip:
          action: "Skip to Step 3 (User Notification - Manual Path)"
          note: "User will organize files manually before continuing"

        option_3_cancel:
          action: "Abort workflow"
          message: "Organization cancelled. You can run *generate-course again when ready."

  categorization_rules:
    1_structured_data:
      files: ["COURSE-BRIEF.md", "curriculum.yaml", "course-outline.md", "PRD.md"]
      action: "KEEP in root (preserve as-is)"

    2_lessons:
      pattern: "^\d+\.\d+-.*\.md$"
      action: "KEEP in /lessons/ or MOVE to /lessons/"

    3_transcripts:
      extensions: [".txt", ".srt", ".vtt"]
      keywords: ["transcript", "transcription", "legenda"]
      action: "MOVE to /legado/transcripts/"

    4_videos:
      extensions: [".mp4", ".mov", ".avi", ".mkv", ".webm"]
      action: "MOVE to /legado/videos/"

    5_icp_docs:
      keywords: ["icp", "avatar", "persona", "audience", "target"]
      content_phrases: ["ideal customer", "público-alvo"]
      action: "MOVE to /legado/"

    6_instructor_profiles:
      keywords: ["professor", "instrutor", "teacher", "bio"]
      heuristic: "Capitalized person names (e.g., 'Adriano de Marqui.md')"
      action: "MOVE to /legado/"

    7_resources:
      extensions: [".pdf", ".docx", ".xlsx", ".pptx", ".zip"]
      action: "MOVE to /resources/"

    8_images:
      extensions: [".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp"]
      action: "MOVE to /resources/"

    9_unknown:
      description: "Doesn't match any category above"
      action: "MOVE to /legado/other/"

  error_handling:
    - Symlink loops: Skip with warning, continue scan
    - Permission denied: Skip file, log error, continue
    - Corrupted files: Log warning, include in inventory
    - Duplicate files: Compare checksums, rename if different
```

**2.2. Execute Organization (If Approved)**

```yaml
execute_organization:
  step: "Move files to canonical locations (safe migration)"

  applies_to: "Only runs if user approved in step 2.1.3"

  actions:
    1_create_folders:
      description: "Create canonical folder structure"

      folders:
        - /lessons/
        - /assessments/
        - /resources/
        - /legado/
        - /legado/transcripts/
        - /legado/videos/
        - /legado/other/

      execution: |
        organizer._create_canonical_structure()

    2_move_files:
      description: "Execute file movements (NOT copies, actual moves)"

      execution: |
        result = organizer.organize(dry_run=False)

      safety_features:
        - Never delete files (only move)
        - Atomic operations (move all or rollback)
        - Duplicate detection with checksum comparison
        - Auto-rename duplicates (file-1.md, file-2.md, etc.)

      validation:
        - File count before == file count after
        - No data loss (100% files accounted for)

    3_generate_audit_log:
      description: "Create detailed Markdown log of all movements"

      output_path: "outputs/courses/{slug}/organization-log-{timestamp}.md"

      log_format: |
        # File Organization Audit Log

        **Course:** {course_slug}
        **Organized At:** {timestamp}
        **Total Files:** {total_files}
        **Files Moved:** {files_moved}
        **Files Kept:** {files_kept}
        **Duration:** {duration_seconds}s

        ---

        ## Summary

        - ✅ {count} transcripts → /legado/transcripts/
        - ✅ {count} videos → /legado/videos/
        - ✅ {count} ICP docs → /legado/
        - ... (all categories)

        ---

        ## Detailed Movements

        ### Transcripts (X files)
        | Original Path | New Path | Size | Action |
        |---------------|----------|------|--------|
        | ... | ... | ... | MOVED |

        ### Videos (X files)
        | Original Path | New Path | Size | Action |
        |---------------|----------|------|--------|
        | ... | ... | ... | MOVED |

        ... (all categories)

        ---

        ## Rollback Command

        To undo this organization:
        ```bash
        ./expansion-packs/creator-os/scripts/undo-organization.sh {slug} {timestamp}
        ```

      features:
        - Human-readable Markdown format
        - Grouped by category
        - Includes rollback script command
        - Full traceability

    4_display_summary:
      description: "Show organization results to user"

      message: |
        ✓ Folder organization complete!

        📊 Summary:
        - 📁 Created: /legado/transcripts/, /legado/videos/, /resources/
        - 📝 Organized: {total_files} files
          - {count_transcripts} transcripts → /legado/transcripts/
          - {count_videos} videos → /legado/videos/
          - {count_icp} ICP documents → /legado/
          - {count_profiles} instructor profiles → /legado/
          - {count_resources} resources → /resources/
          - {count_unknown} unknown → /legado/other/
        - ⏱️ Duration: {duration}s
        - ✅ Zero files lost (100% preserved)

        📋 Audit log: {audit_log_path}

        Next: Extracting intelligence from organized materials...

  output:
    organization_result:
      success: true/false
      files_moved: {count}
      files_kept: {count}
      audit_log_path: "{path}"
      errors: [list of errors]
```

**2.3. Update Brownfield Notification**

```yaml
notification_brownfield_after_organization:
  step: "Update user notification with organization results"

  applies_to: "Brownfield mode after successful organization"

  message_to_user: |
    ✓ Brownfield mode activated and materials organized!

    📁 Organized:
    - Folder: /outputs/courses/{course-slug}/
    - Files organized: {files_moved} moved, {files_kept} kept
    - Audit log: {audit_log_filename}

    ---

    📋 **NEXT STEPS - Brownfield Workflow:**

    **Phase 2: Material Extraction (Stories 3.3-3.5) - Coming Soon**

    The system will extract content from your organized materials to:
    1. Generate COURSE-BRIEF.md automatically (Story 3.3: ICP Extraction)
    2. Extract instructor voice patterns (Story 3.4: Voice Extraction)
    3. Infer learning objectives (Story 3.5: Objectives Inference)

    **For now (Phase 1 - Manual Path):**

    1. Review organized files in canonical structure
    2. Create COURSE-BRIEF.md manually based on organized materials
    3. Run: *continue-course {course-slug}

    ---

    **Status:** File organization complete (Story 3.2 ✓)
    **Next:** Stories 3.3-3.5 will automate COURSE-BRIEF generation from your organized materials

  workflow_state: "HALTED (awaiting Phase 2 or manual COURSE-BRIEF)"
  next_task: "continue-course (after COURSE-BRIEF.md creation)"
```

---

### Step 2.5: ICP Extraction (Brownfield Only)

**This step runs ONLY in brownfield mode after file organization (Step 2).**

**2.5.1. Extract ICP Data from Organized Files**

```yaml
icp_extraction:
  step: "Extract ICP (Ideal Customer Profile) data from legacy files"

  applies_to: "Only runs in BROWNFIELD mode (creation_mode = brownfield)"

  skip_if: "creation_mode = greenfield (no legacy files to extract from)"

  prerequisites:
    - Brownfield mode validated (Scenario 3 passed)
    - File organization complete (Step 2.2) or skipped (manual organization)
    - COURSE-BRIEF.md exists (from greenfield template or manual creation)

  import:
    module: "expansion-packs/creator-os/lib/icp_extractor.py"
    class: "ICPExtractor"

  actions:
    1_find_icp_files:
      description: "Search for ICP-related files in /legado/ and root"

      execution: |
        from lib.icp_extractor import ICPExtractor

        extractor = ICPExtractor(course_slug)
        icp_files = extractor.find_icp_files()

      detection_strategies:
        - Filename patterns (ICP.md, avatar.md, persona.md, publico-alvo.md)
        - Content keywords ("ideal customer", "público-alvo", "target audience")
        - Confidence scoring (filename match = 85-95%, content match = 40-75%)

      output:
        - List of ICPFile objects ranked by confidence
        - Top 3 candidates displayed to user

    2_extract_icp_data:
      description: "Parse Markdown structure and extract ICP data"

      execution: |
        icp_data = extractor.extract_icp(icp_files)

      parsing_logic:
        - Detect section headers (## Demografia, ## Dores, etc.)
        - Extract key-value pairs (**Idade:** 30-40)
        - Extract bullet lists (pain points, goals)
        - Merge data from multiple files (unique items only)
        - Calculate confidence score based on completeness

      output:
        - ICPData object with structured data
        - Confidence score (0-100%)
        - Completeness flags for each subsection

    3_export_to_yaml:
      description: "Save extracted data to YAML for reference"

      execution: |
        yaml_path = extractor.export_to_yaml(icp_data)

      output_path: "outputs/courses/{course-slug}/icp-extracted.yaml"

      yaml_structure: |
        icp_extracted:
          source_file: "legado/ICP.md"
          extraction_timestamp: "2025-10-18T10:30:00Z"
          confidence_score: 95
          demographics:
            age_range: "35-45"
            location: "Brasil (urbano)"
            occupation: ["Empreendedor", "Executivo"]
            income: "R$ 10k-50k/mês"
          psychographics:
            moment_of_life: "Transição consciente"
            mental_state: "Saturado de informação"
            values: ["Eficiência", "Autenticidade"]
          pain_points:
            - "Sobrecarga cognitiva"
            - "Falta de tempo para executar"
          goals:
            - "Executar com foco"
            - "Sistema sustentável"
          archetypes: []
          completeness:
            demographics: true
            psychographics: true
            pain_points: true
            goals: true

    4_prefill_course_brief:
      description: "Auto-populate COURSE-BRIEF.md Section 2 with extracted data"

      execution: |
        success = extractor.prefill_course_brief(icp_data)

      brief_section_format: |
        ## 2️⃣ PÚBLICO-ALVO & ICP

        🟢 **Status:** Extracted from `legado/ICP.md` (95% confidence)

        **Extracted:**
        - Demographics ✅
        - Psychographics ✅
        - Pain Points ✅
        - Goals ✅

        ---

        ### 2.1. Quem é o aluno ideal?

        **Demografia básica:**

        - **Idade:** 35-45 anos
        - **Localização:** Brasil (urbano)
        - **Ocupação:** Empreendedor, Executivo
        - **Renda:** R$ 10k-50k/mês

        **Contexto psicográfico:**

        - **Momento de Vida:** Transição consciente
        - **Estado Mental:** Saturado de informação
        - **Valores:** Eficiência, Autenticidade

        ---

        ### 2.2. Dores & Problemas (CRITICAL!)

        **Dores/frustrações específicas:**

        - Sobrecarga cognitiva (infinite consumption loop)
        - Falta de tempo para executar (sempre consumindo, nunca fazendo)

        ---

        ### 2.3. Desejo & Transformação

        **O que o avatar DESEJA alcançar com este curso?**

        **Objetivos:**

        - Executar com foco (menos ruído mental)
        - Sistema sustentável (não depende de willpower)

        ---

        📝 **Instruções:** Review extracted data for accuracy. Edit if needed, then change status to ✅.

      status_indicators:
        complete: "🟢 (all 4 subsections filled)"
        partial: "🟡 (2-3 subsections filled)"
        incomplete: "🔴 (0-1 subsections filled)"

    5_user_review:
      description: "Show extracted ICP to user for approval/editing"

      display: |
        ✓ ICP extraction complete!

        📊 Extracted ICP Data:
        - Source: {icp_data.source_file}
        - Confidence: {icp_data.confidence_score}%
        - Completeness: {filled_count}/4 subsections

        Demographics:
          {preview_demographics}

        Psychographics:
          {preview_psychographics}

        Pain Points ({len}):
          {preview_pain_points}

        Goals ({len}):
          {preview_goals}

        ---

        ✅ COURSE-BRIEF.md Section 2 updated
        💾 Data exported to: icp-extracted.yaml

        ---

        📝 **Next Steps:**

        1. Open COURSE-BRIEF.md and review Section 2
        2. Edit/refine extracted data if needed
        3. Change status indicator to ✅ when satisfied
        4. Continue with *continue-course {course-slug}

      prompt: |
        Review the extracted ICP data in COURSE-BRIEF.md Section 2.

        Options:
        1. Looks good - Continue to next step
        2. I need to edit the data first - Pause workflow
        3. Re-run extraction (if I updated source files)

        Your choice (1/2/3):

      handling:
        option_1_continue:
          action: "Proceed to Step 3 (User Notification)"

        option_2_pause:
          action: "HALT workflow"
          message: |
            Workflow paused for manual editing.

            Please:
            1. Open: outputs/courses/{course-slug}/COURSE-BRIEF.md
            2. Edit Section 2 as needed
            3. Save the file
            4. Run: *continue-course {course-slug} when ready

        option_3_rerun:
          action: "Re-execute Step 2.5.1 (find_icp_files)"
          note: "Useful if user updated source ICP files"

  error_handling:
    no_icp_files_found:
      scenario: "extractor.find_icp_files() returns empty list"
      action: "Insert empty template with 🔴 status and placeholders"
      message: |
        ⚠️  No ICP files found in /legado/ or root folder.

        COURSE-BRIEF.md Section 2 filled with empty template.
        Please fill manually or add ICP files to /legado/ and re-run.

    malformed_markdown:
      scenario: "Parsing fails due to unrecognized structure"
      action: "Log warning, skip file, try next candidate"
      message: |
        ⚠️  Found ICP file but failed to parse structure: {file_path}

        Reason: No recognizable section headers found.
        Fallback: Trying next candidate file...

    partial_extraction:
      scenario: "Only 1-2 subsections extracted (low completeness)"
      action: "Insert partial data with 🟡 status, add missing placeholders"
      message: |
        ⚠️  Partial extraction from {file_path}

        Extracted:
        - Demographics {✅/❌}
        - Psychographics {✅/❌}
        - Pain Points {✅/❌}
        - Goals {✅/❌}

        Please fill missing sections manually in COURSE-BRIEF.md.

    pdf_files_found:
      scenario: "ICP files are PDFs (not supported in v1)"
      action: "Log info message, skip PDF, continue with .md files"
      message: |
        ℹ️  Found ICP file in PDF format: {file_path}

        PDF parsing not supported in v1.
        Recommendation: Convert to Markdown and re-run, or fill manually.

  output:
    icp_extraction_result:
      success: true/false
      files_found: {count}
      confidence_score: {0-100}
      brief_updated: true/false
      yaml_exported: true/false
      yaml_path: "{path}"
```

---

### Step 2.6: Voice Extraction (Brownfield Only)

**This step runs ONLY in brownfield mode after ICP extraction (Step 2.5).**

**2.6.1. Extract Voice Patterns from Transcripts**

```yaml
voice_extraction:
  step: "Extract instructor voice patterns from video/audio transcripts"

  applies_to: "Only runs in BROWNFIELD mode (creation_mode = brownfield)"

  skip_if:
    - "creation_mode = greenfield (no legacy transcripts to extract from)"
    - "mmos_config['enabled'] = true (MMOS voice takes priority)"

  prerequisites:
    - Brownfield mode validated (Scenario 3 passed)
    - File organization complete (Step 2.2) or skipped
    - ICP extraction complete (Step 2.5) or skipped
    - COURSE-BRIEF.md exists

  priority_check:
    description: "Check if MMOS persona was selected (takes priority over transcript extraction)"

    condition: "mmos_config is not None and mmos_config['enabled'] == True"

    action: "Skip voice extraction entirely - MMOS voice already loaded"

    message: |
      ℹ️  Skipping transcript voice extraction

      MMOS persona already selected: {mmos_config['mind_name']}

      Voice profile loaded from MMOS mind (Section 4 already populated).
      Transcript extraction not needed.

      Next: Proceeding to learning objectives inference...

    output:
      voice_source: "mmos"
      voice_extraction_skipped: true
      reason: "MMOS persona takes priority"

  import:
    module: "expansion-packs/creator-os/lib/voice_extractor.py"
    class: "VoiceExtractor"

  actions:
    0_check_mmos_priority:
      description: "Verify MMOS voice is not already loaded"

      execution: |
        if mmos_config and mmos_config.get('enabled'):
            print("ℹ️  MMOS persona detected - skipping transcript extraction")
            return None  # Skip to Step 2.7

    1_find_transcripts:
      description: "Search for transcript files in organized structure"

      execution: |
        from lib.voice_extractor import VoiceExtractor

        extractor = VoiceExtractor(course_slug, ai_client)
        transcript_files = extractor.find_transcripts()

      detection_strategies:
        - Filename patterns (transcript*.txt, aula*.txt, lesson*.txt)
        - Content validation (must contain conversational markers)
        - Multi-format support (plain text, Markdown, SRT, VTT)
        - Priority search paths (/legado/transcripts/, /legado/, /transcripts/, root)

      output:
        - List of TranscriptFile objects ranked by confidence
        - Top 5 candidates displayed to user

    2_sample_transcripts:
      description: "Select representative sample (3-5 files)"

      execution: |
        sampled = extractor.sample_transcripts(transcript_files)

      sampling_strategy:
        - "≤5 transcripts: Analyze all"
        - "6-20 transcripts: First, middle, last + 2 random (5 total)"
        - ">20 transcripts: First, last + 3 from middle third (5 total)"

      output:
        - 0-5 sampled transcripts for analysis
        - Sampling decision logged for transparency

    3_analyze_with_ai:
      description: "Use AI to extract voice patterns from each sample"

      execution: |
        voice_profile = extractor.analyze_voice(use_cache=True)

      ai_configuration:
        model: "gpt-4o-mini"  # Fast, cheap, good for pattern extraction
        temperature: 0.3  # Low variance (consistent extractions)
        max_retries: 3  # Retry on API failures

      analysis_dimensions:
        - Signature greeting (first 3 sentences)
        - Tone & style (formal/casual, warm/authoritative)
        - Recurring phrases (top 10 with counts)
        - Teaching approach (theory vs practice, uses analogies, etc.)
        - Interaction patterns (direct address, checks understanding)
        - Personality traits (builds confidence, addresses objections)

      caching:
        - Results cached in /legado/.voice-analysis-cache.yaml
        - Cache invalidated if transcript files change
        - Reduces cost on re-runs

      output:
        - VoiceProfile object with aggregated patterns
        - Confidence score (0-100) based on consistency

    4_export_results:
      description: "Export voice profile for reference"

      execution: |
        # Voice profile automatically includes all data
        # No separate YAML export needed (unlike ICP)

      output:
        - Voice patterns stored in VoiceProfile object
        - Cached in .voice-analysis-cache.yaml

    5_prefill_course_brief:
      description: "Auto-populate COURSE-BRIEF.md Section 4 with voice profile"

      execution: |
        success = extractor.prefill_course_brief(voice_profile)

      brief_section_format: |
        ## 4️⃣ VOZ & PERSONALIDADE (MMOS INTEGRATION)

        🟢 **Status:** Extracted from 5 transcripts (92% confidence)

        ### Instrutor

        **Saudação Assinatura:**
        > "Fala, lendário! Tudo certo com você?"

        ### Tom e Estilo

        - **Tom:** Warm, conversational, peer-to-peer mentor
        - **Estilo:** Casual yet professional, builds confidence

        ### Frases Recorrentes

        As lições devem incorporar estas frases naturalmente:
        - "Tá?" (52x - checking understanding)
        - "Olha só..." (38x - introducing new concept)
        - "Então vamos lá..." (27x - transitioning to practice)
        - "Mão na massa" (19x - call to action)
        - "Eu sei que..." (16x - acknowledging concerns)

        ### Padrões de Ensino

        - **Approach:** Practice-first (80/20 rule - doing over explaining)
        - ✅ Uses analogies and metaphors frequently
        - ✅ Anticipates student objections/concerns proactively
        - ✅ Checks understanding with rhetorical questions
        - ✅ Explains WHY before HOW (purpose first)

        ### Traços de Personalidade

        - **Builds confidence:** "você consegue", "está indo bem"
        - **Addresses objections:** "eu sei que você pode estar pensando..."
        - **Real-world focus:** References client projects, market scenarios
        - **Patient & empathetic:** Normalizes struggles, acknowledges learning curves

        ---

        📝 **Instruções:** Voice profile will be injected into lesson generation prompts automatically.
        Review for accuracy and edit if needed, then change status to ✅.

      status_indicators:
        complete: "🟢 (≥3 transcripts, ≥80% confidence)"
        partial: "🟡 (1-2 transcripts or 60-79% confidence)"
        incomplete: "🔴 (0 transcripts or <60% confidence)"

    6_user_review:
      description: "Show extracted voice profile to user for approval/editing"

      display: |
        ✓ Voice extraction complete!

        📊 Extracted Voice Profile:
        - Transcripts analyzed: {voice_profile.transcripts_analyzed}
        - Confidence: {voice_profile.confidence_score}%

        Signature greeting:
          "{voice_profile.signature_greeting}"

        Tone & Style:
          {voice_profile.tone}
          {voice_profile.style}

        Recurring phrases ({len}):
          {preview_top_5}

        Teaching approach:
          {preview_approach}

        Personality traits:
          {preview_traits}

        ---

        ✅ COURSE-BRIEF.md Section 4 updated

        ---

        📝 **Next Steps:**

        1. Open COURSE-BRIEF.md and review Section 4
        2. Edit/refine extracted voice patterns if needed
        3. Change status indicator to ✅ when satisfied
        4. Continue with *continue-course {course-slug}

      prompt: |
        Review the extracted voice profile in COURSE-BRIEF.md Section 4.

        Options:
        1. Looks good - Continue to next step
        2. I need to edit the data first - Pause workflow
        3. Re-run extraction (if I updated transcript files)

        Your choice (1/2/3):

      handling:
        option_1_continue:
          action: "Proceed to Step 3 (User Notification)"

        option_2_pause:
          action: "HALT workflow"
          message: |
            Workflow paused for manual editing.

            Please:
            1. Open: outputs/courses/{course-slug}/COURSE-BRIEF.md
            2. Edit Section 4 as needed
            3. Save the file
            4. Run: *continue-course {course-slug} when ready

        option_3_rerun:
          action: "Re-execute Step 2.6.1 (find_transcripts) with --no-cache"
          note: "Useful if user updated/added transcript files"

  error_handling:
    no_transcripts_found:
      scenario: "extractor.find_transcripts() returns empty list"
      action: "Insert empty template with 🔴 status and recommendations"
      message: |
        ⚠️  No transcript files found in /legado/transcripts/ or other locations.

        COURSE-BRIEF.md Section 4 filled with empty template.

        Recommendations:
        1. Add transcript files to /legado/transcripts/
        2. Or use MMOS mind if available
        3. Or fill voice profile manually

    transcripts_too_short:
      scenario: "All transcripts < 100 words (not representative)"
      action: "Log warning, insert empty template with 🔴 status"
      message: |
        ⚠️  Found transcript files but all are too short (<100 words each)

        Transcripts need to be substantial enough to extract voice patterns.
        Please add longer transcripts or fill Section 4 manually.

    api_failure:
      scenario: "OpenAI API error (rate limit, outage, etc.)"
      action: "Retry up to 3 times with exponential backoff"
      message: |
        ❌ Voice analysis failed (API error: {error})

        Action: Retrying in {wait_time} seconds (attempt {attempt}/3)...

        If retries fail: Section 4 will be marked 🔴 for manual filling.
        Cached partial results (if any) will be preserved.

    low_confidence:
      scenario: "Confidence score < 60% (inconsistent patterns)"
      action: "Insert extracted data with 🟡 status and warning"
      message: |
        ⚠️  Voice patterns extracted but confidence is LOW ({confidence}%)

        Possible reasons:
        - Multiple instructors in course
        - Different content types (lecture vs workshop)
        - Transcription quality issues

        Recommendation: Review extracted patterns carefully and edit as needed.

    parsing_error:
      scenario: "AI returns malformed YAML"
      action: "Log error, retry once, fallback to empty template if retry fails"
      message: |
        ⚠️  AI response parsing error

        Retrying analysis...
        If retry fails, Section 4 will be marked 🔴 for manual filling.

  output:
    voice_extraction_result:
      success: true/false
      transcripts_found: {count}
      transcripts_analyzed: {count}
      confidence_score: {0-100}
      brief_updated: true/false
      cached: true/false
```

---

### Step 2.7: Learning Objectives Inference (Brownfield Only)

**This step runs ONLY in brownfield mode after voice extraction (Step 2.6).**

**2.7.1. Infer Learning Objectives from Lessons**

```yaml
objectives_inference:
  step: "Infer learning objectives from existing lesson content"

  applies_to: "Only runs in BROWNFIELD mode (creation_mode = brownfield)"

  skip_if: "creation_mode = greenfield (no legacy lessons to infer from)"

  prerequisites:
    - Brownfield mode validated (Scenario 3 passed)
    - File organization complete (Step 2.2) or skipped
    - ICP extraction complete (Step 2.5) or skipped
    - Voice extraction complete (Step 2.6) or skipped
    - COURSE-BRIEF.md exists

  import:
    module: "expansion-packs/creator-os/lib/objectives_inferencer.py"
    class: "ObjectivesInferencer"

  actions:
    1_find_legacy_lessons:
      description: "Search for lesson files in organized structure"

      execution: |
        from lib.objectives_inferencer import ObjectivesInferencer

        inferencer = ObjectivesInferencer(course_slug)
        lessons = inferencer.find_legacy_lessons()

      detection_strategies:
        - Filename patterns (1.1-*.md, aula-*.md, lesson-*.md)
        - Content validation (must have headers - structured content)
        - Multi-path search (/lessons/, /legado/, root)

      output:
        - List of LessonFile objects with titles and content types
        - Total lessons found

    2_infer_lesson_objectives:
      description: "Match lessons to pedagogical patterns and infer objectives"

      execution: |
        lesson_objectives = []
        for lesson in lessons:
            objective = inferencer.infer_lesson_objective(lesson)
            lesson_objectives.append(objective)

      pattern_matching:
        - Installation lessons → Apply level ("Install and configure {tool}")
        - Concept lessons → Understand level ("Explain {topic}")
        - Workshop lessons → Apply level ("Apply {skill} to practice")
        - Why-use lessons → Evaluate level ("Evaluate benefits of {tool}")
        - Troubleshooting → Analyze level ("Troubleshoot {problem}")
        - Advanced → Create level ("Develop advanced {technique}")

      output:
        - List of LessonObjective objects
        - Each with Bloom's level, confidence score, source lesson

    3_synthesize_course_objectives:
      description: "Aggregate lesson objectives to 3-5 course-level objectives"

      execution: |
        course_objectives = inferencer.synthesize_course_objectives(lesson_objectives)

      aggregation_strategy:
        - Group by Bloom's level and semantic similarity
        - Cluster similar lessons (e.g., all "installation" lessons → 1 objective)
        - Prioritize higher Bloom's levels (Apply, Create > Understand)
        - Generalize specific objectives to cover multiple lessons
        - Limit to maximum 5 course objectives

      output:
        - List of 3-5 CourseObjective objects
        - Each with aggregated confidence, source lessons list

    4_prefill_course_brief:
      description: "Auto-populate COURSE-BRIEF.md Section 3.2 with objectives"

      execution: |
        success = inferencer.prefill_course_brief(course_objectives)

      brief_section_format: |
        ### 3.2. Objetivos de Aprendizagem

        🟢 **Status:** Inferred from 38 legacy lessons (82% avg confidence)

        **Objetivos do Curso:**

        1. **Build a functional second brain in Obsidian for knowledge management**
           - Bloom's Level: Apply
           - Source: 1.3-instalacao.md, 1.4-config.md, 2.1-markdown.md
           - Confidence: 85%

        2. **Organize knowledge using sustainable note-taking systems**
           - Bloom's Level: Understand
           - Source: 3.1-pastas.md, 3.2-tags.md, 3.3-properties.md
           - Confidence: 78%

        3. **Connect ideas using bi-directional links and graph visualization**
           - Bloom's Level: Apply
           - Source: 4.1-links.md, 4.2-backlinks.md, 4.3-graph.md
           - Confidence: 92%

        ---
        📝 **Instruções:**
        - These objectives were inferred from your existing lessons.
        - Review for accuracy and alignment with your vision.
        - Edit to refine wording or add/remove objectives.
        - Ensure objectives match what students will ACTUALLY achieve.
        - When satisfied, change status to ✅.

        📚 **Bloom's Taxonomy Reference:**
        - **Understand:** Explain, describe, summarize
        - **Apply:** Use, implement, execute (hands-on)
        - **Analyze:** Compare, troubleshoot, examine
        - **Evaluate:** Assess, justify, critique
        - **Create:** Design, build, develop (original work)

      status_indicators:
        complete: "🟢 (≥10 lessons, ≥80% avg confidence)"
        partial: "🟡 (5-9 lessons or 60-79% avg confidence)"
        incomplete: "🔴 (<5 lessons or <60% avg confidence)"

    5_user_review:
      description: "Show inferred objectives to user for approval/editing"

      display: |
        ✓ Learning objectives inference complete!

        📊 Inferred Course Objectives:
        - Total lessons analyzed: {total_lessons}
        - Objectives generated: {len(course_objectives)}
        - Average confidence: {avg_confidence}%

        Objectives:
        {preview_objectives}

        ---

        ✅ COURSE-BRIEF.md Section 3.2 updated

        ---

        📝 **Next Steps:**

        1. Open COURSE-BRIEF.md and review Section 3.2
        2. Edit/refine inferred objectives if needed
        3. Change status indicator to ✅ when satisfied
        4. Continue with *continue-course {course-slug}

      prompt: |
        Review the inferred learning objectives in COURSE-BRIEF.md Section 3.2.

        Options:
        1. Looks good - Continue to next step
        2. I need to edit the objectives first - Pause workflow
        3. Re-run inference (if I updated lesson files)

        Your choice (1/2/3):

      handling:
        option_1_continue:
          action: "Proceed to Step 3 (User Notification)"

        option_2_pause:
          action: "HALT workflow"
          message: |
            Workflow paused for manual editing.

            Please:
            1. Open: outputs/courses/{course-slug}/COURSE-BRIEF.md
            2. Edit Section 3.2 as needed
            3. Save the file
            4. Run: *continue-course {course-slug} when ready

        option_3_rerun:
          action: "Re-execute Step 2.7.1 (find_legacy_lessons)"
          note: "Useful if user updated/added lesson files"

  error_handling:
    no_lessons_found:
      scenario: "inferencer.find_legacy_lessons() returns empty list"
      action: "Insert empty template with 🔴 status and instructions"
      message: |
        ⚠️  No legacy lesson files found in /lessons/, /legado/, or root folder.

        COURSE-BRIEF.md Section 3.2 filled with empty template.
        Please define objectives manually or add lesson files and re-run.

    too_few_lessons:
      scenario: "Less than 3 lessons found"
      action: "Insert inferred objectives with 🟡 status and warning"
      message: |
        ⚠️  Only {count} lessons found - objectives may be incomplete.

        Inferred Objectives:
        - {Objective 1}
        - {Objective 2}

        **Recommendation:** Add at least 1-2 more objectives manually to cover full course scope.

    low_confidence:
      scenario: "Average confidence < 50%"
      action: "Insert objectives with 🔴 status and warning"
      message: |
        🔴 **Status:** Inferred from {count} lessons ({avg_confidence}% avg confidence - LOW)

        **Warning:** Lesson titles are unclear or generic.
        Objectives below are best guesses - review carefully.

        Inferred Objectives:
        - {Objective 1} (Confidence: 45%)
        - {Objective 2} (Confidence: 31%)

        **Recommendation:** Refine these objectives based on actual course content.

    imbalanced_blooms:
      scenario: "All objectives at same Bloom's level (e.g., all Understand)"
      action: "Insert objectives with 🟡 status and recommendation"
      message: |
        🟡 **Status:** All lessons detected as "{dominant_level}" type.

        **Notice:** Course appears {observation} (no {missing_types} detected).

        Inferred Objectives (all "{dominant_level}" level):
        - {Objective 1}
        - {Objective 2}
        ...

        **Recommendation:** Consider adding {recommendation_level} objectives with hands-on projects.

      examples:
        all_understand:
          observation: "theory-heavy"
          missing_types: "hands-on practice"
          recommendation_level: "Apply/Create"

        all_apply:
          observation: "practice-focused"
          missing_types: "conceptual foundation"
          recommendation_level: "Understand"

  output:
    objectives_inference_result:
      success: true/false
      lessons_found: {count}
      lesson_objectives_generated: {count}
      course_objectives_generated: {count}
      avg_confidence: {0-100}
      brief_updated: true/false
```

---

### Step 3: Gap Analysis & Smart Elicitation (Brownfield Only)

**This step runs ONLY in brownfield mode after all extraction steps (2.5, 2.6, 2.7).**

**3.1. Analyze COURSE-BRIEF Completeness**

```yaml
gap_analysis:
  step: "Analyze which sections are complete, partial, or missing"

  applies_to: "Only runs in BROWNFIELD mode (creation_mode = brownfield)"

  skip_if: "creation_mode = greenfield (no auto-fill to analyze)"

  prerequisites:
    - Brownfield mode validated (Scenario 3 passed)
    - File organization complete (Step 2.2) or skipped
    - ICP extraction complete (Step 2.5) or skipped
    - Voice extraction complete (Step 2.6) or skipped
    - Learning objectives inference complete (Step 2.7) or skipped
    - COURSE-BRIEF.md exists

  import:
    module: "expansion-packs/creator-os/lib/gap_analyzer.py"
    class: "GapAnalyzer"

  actions:
    1_analyze_completeness:
      description: "Scan COURSE-BRIEF.md and determine section statuses"

      execution: |
        from lib.gap_analyzer import GapAnalyzer

        analyzer = GapAnalyzer(course_slug, mmos_config=mmos_config)
        completeness_map = analyzer.analyze_completeness()

      mmos_integration:
        description: "Handle MMOS persona if enabled"

        condition: "mmos_config is not None and mmos_config['enabled'] == True"

        action: |
          # If MMOS persona was selected, mark Section 4 (Voice) as 🟢
          if mmos_config and mmos_config.get('enabled'):
              completeness_map["section_4_voice"]["status"] = "🟢"
              completeness_map["section_4_voice"]["source"] = "mmos"
              completeness_map["section_4_voice"]["skip_questions"] = True

        note: |
          When MMOS persona is enabled:
          - Section 4 automatically marked as 🟢 (complete)
          - No voice-related questions will be generated
          - Gap analysis summary will show "Loaded from MMOS mind"

      analysis_dimensions:
        - Section 1: Basic Information (title, slug, category, duration)
        - Section 2: ICP (demographics, psychographics, pain points, goals)
        - Section 3: Content (objectives, framework, prerequisites)
        - Section 4: Voice (tone, style, phrases, greeting) [AUTO-COMPLETE if MMOS]
        - Section 5: Format (lesson duration, format, assessments)
        - Section 6: Commercial (pricing, launch date, upsells)
        - Section 7: Context (references to legacy materials)
        - Section 8: Checklist (final validation items)

      status_indicators:
        complete: "🟢 (100% completeness, no action needed)"
        partial: "🟡 (50-99% completeness, needs confirmation)"
        incomplete: "🔴 (0-49% completeness, needs elicitation)"

      output:
        - CompletenessMap with overall score (0-100%)
        - Section-level status (🟢/🟡/🔴)
        - Subsection/field-level status
        - Analyzed timestamp
        - MMOS voice bypass flag (if enabled)

    2_calculate_question_count:
      description: "Estimate how many questions will be asked"

      execution: |
        expected_count = analyzer.calculate_expected_question_count(creation_mode)

      calculation:
        - Greenfield (0% completeness): 15 questions
        - Brownfield (80% completeness): 3 questions
        - Brownfield (50% completeness): 7-8 questions
        - Minimum: 3 questions (always ask critical fields)

      output:
        - Expected question count (3-15)

    3_generate_questions:
      description: "Generate targeted questions for gaps only"

      execution: |
        questions = analyzer.generate_questions(completeness_map)

      question_generation_rules:
        - "🟢 sections: Skip entirely (no questions)"
        - "🟡 sections: Generate confirmation questions (show data, ask for validation)"
        - "🔴 sections: Generate full elicitation questions"

      question_types:
        confirmation: "Show extracted data, ask yes/no/show_source"
        elicitation: "Ask for missing data with options"
        multiple_choice: "Single selection from options"
        multiple_select: "Multiple selections from options"
        text: "Free-form text answer"

      output:
        - List of Question objects (0-15 questions)
        - Questions ordered by section priority

  output:
    gap_analysis_result:
      overall_score: {0-100}
      sections_complete: {count}
      sections_partial: {count}
      sections_missing: {count}
      questions_generated: {count}
      questions_saved: {count}  # vs baseline of 15
```

**3.2. Display Summary & Run Interactive Elicitation**

```yaml
smart_elicitation:
  step: "Present questions to user and collect answers"

  import:
    module: "expansion-packs/creator-os/lib/elicitation_engine.py"
    class: "ElicitationEngine"

  actions:
    1_display_summary:
      description: "Show three-tier summary (Complete/Confirmation/Missing)"

      execution: |
        from lib.elicitation_engine import ElicitationEngine

        engine = ElicitationEngine(questions)
        engine.display_summary(completeness_map)

      display_format: |
        📊 BRIEF ANALYSIS COMPLETE

        I analyzed your existing materials and auto-filled these sections:

        ═══════════════════════════════════════════════════════════

        ✅ COMPLETE (No action needed):

        🟢 ICP (Section 2)
           ✓ Demographics extracted from `legado/ICP.md`
           ✓ Psychographics extracted
           ✓ Pain points extracted (3 items)
           ✓ Goals extracted (3 items)

        🟢 Voice & Personality (Section 4)
           ✓ Analyzed 5 transcripts
           ✓ Signature greeting: "Fala, lendário!"
           ✓ Tone: Warm, conversational
           ✓ Recurring phrases: 10 identified

        ═══════════════════════════════════════════════════════════

        🔄 NEEDS CONFIRMATION (Please review):

        🟡 Learning Objectives (Section 3.2)
           Inferred from 38 legacy lessons

           → Do these objectives accurately reflect your course goals?

        ═══════════════════════════════════════════════════════════

        ❓ MISSING (Need your input):

        🔴 Course Category (Section 1)
           → What category does this course belong to?

        🔴 Assessment Types (Section 5)
           → What assessment types fit this course?

        🔴 Pricing (Section 6)
           → What's the pricing model?

        ═══════════════════════════════════════════════════════════

        📋 SUMMARY:
           Complete sections: 3/8 (38%)
           Needs confirmation: 1
           Missing data: 3 questions

           Total questions: 4 (saved you 11 questions with smart extraction!)

           Estimated time: 5-7 minutes

        ═══════════════════════════════════════════════════════════

      output:
        - Summary displayed to user
        - Questions grouped by type

    2_run_interactive_flow:
      description: "Ask questions one by one and collect answers"

      execution: |
        answers = engine.run_interactive_flow()

      interaction_format: |
        ──────────────────────────────────────────────────────────
        Question 1/4
        ──────────────────────────────────────────────────────────

        [Question prompt displayed]

        [Options displayed]

        Your choice (1-N): _

      validation:
        - Validate input type (number for choices, text for text)
        - Validate range (1-N for choices)
        - Validate minimum length for text (if specified)
        - Allow retry on invalid input

      output:
        - Dict of question_id → Answer objects
        - Timestamps for each answer

    3_persist_answers:
      description: "Write answers back to COURSE-BRIEF.md"

      execution: |
        final_completeness = analyzer.persist_answers(answers)

      persistence_logic:
        - Confirmation="Yes" → Mark section 🟢 (confirmed)
        - Confirmation="No" → Mark section 🟡 (manual edit required)
        - Elicitation answer → Fill missing field, mark 🟢

      output:
        - Updated COURSE-BRIEF.md
        - Final CompletenessMap (re-analyzed)

    4_display_completion_summary:
      description: "Show before/after completeness scores"

      execution: |
        engine.display_completion_summary(completeness_map, final_completeness)

      display_format: |
        ═══════════════════════════════════════════════════════════
        📊 ELICITATION COMPLETE
        ═══════════════════════════════════════════════════════════

        Completeness Score:
          Before: 38%
          After:  92%
          Improvement: +54%

        Section Status Updates:
          🔴 → 🟢  Basic Information
          🟡 → 🟢  Learning Objectives
          🔴 → 🟢  Format & Delivery
          🔴 → 🟢  Commercial & Launch

        ═══════════════════════════════════════════════════════════
        ✅ COURSE-BRIEF.md updated successfully
        ═══════════════════════════════════════════════════════════

      output:
        - Summary displayed to user

  error_handling:
    no_questions_needed:
      scenario: "All sections 🟢 (100% complete)"
      action: "Skip elicitation entirely"
      message: |
        ✅ No questions needed - all sections are complete!

        COURSE-BRIEF.md is ready for generation.

    user_interrupted:
      scenario: "User cancels elicitation mid-flow (Ctrl+C)"
      action: "Save partial answers, mark as incomplete"
      message: |
        ⚠️  Elicitation interrupted

        Partial answers saved to COURSE-BRIEF.md.
        Remaining sections marked for manual completion.

        To resume: *continue-course {course-slug}

    validation_failed:
      scenario: "User provides invalid input repeatedly"
      action: "Skip question, mark for manual completion"
      message: |
        ⚠️  Input validation failed 3 times

        Skipping this question - please fill manually in COURSE-BRIEF.md.
        Moving to next question...

  output:
    elicitation_result:
      questions_asked: {count}
      questions_answered: {count}
      questions_skipped: {count}
      final_completeness: {0-100}
      brief_updated: true/false
```

**3.3. Final Validation Gate**

```yaml
final_validation:
  step: "Validate all sections 🟢 before proceeding"

  actions:
    1_validate_brief_complete:
      description: "Check all 8 sections are 🟢"

      execution: |
        is_complete = analyzer.validate_brief_complete()

      validation_rules:
        - All sections must be 🟢 (100% complete)
        - If any 🟡 or 🔴: Show error with instructions
        - Provide recovery commands (*validate-brief, *edit-brief)

      output:
        - True if all sections complete
        - Raises BriefIncompleteError if incomplete

    2_handle_incomplete_brief:
      description: "Handle incomplete sections gracefully"

      error_message: |
        ❌ BRIEF INCOMPLETE

        The following sections are not complete:
          - {section_name_1} (🟡 needs review)
          - {section_name_2} (🔴 missing data)

        Please review COURSE-BRIEF.md and fill these sections manually.

        When done, run: *continue-course {course-slug} --validate-brief

        Or to edit interactively: *edit-brief {course-slug}

      recovery_options:
        option_1_manual_edit:
          action: "HALT workflow, user edits COURSE-BRIEF.md"
          next_step: "User runs *continue-course when ready"

        option_2_retry_elicitation:
          action: "Re-run Step 3 (Gap Analysis & Elicitation)"
          command: "*continue-course {course-slug} --retry-elicitation"

    3_mark_brief_complete:
      description: "Update COURSE-BRIEF.md status on success"

      execution: |
        # Update frontmatter status
        status: ✅ Complete

      output:
        - COURSE-BRIEF.md status updated to ✅
        - Ready to proceed to content generation

  output:
    validation_result:
      success: true/false
      sections_complete: {count}
      sections_incomplete: {count}
      incomplete_section_names: [list]
```

---

### Step 4: WORKFLOW HALTED

**This task STOPS here.** The user must now:

**For Greenfield:**
1. Fill `COURSE-BRIEF.md` manually (45-90 minutes)
2. Run `*continue-course {course-slug}` to generate content

**For Brownfield (after Step 3 complete):**
1. Review COURSE-BRIEF.md (all sections now 🟢 or 🟡)
2. Edit any 🟡 sections manually if needed
3. Run `*continue-course {course-slug}` to generate content

**Note:** Steps 4-7 (Pedagogical Design, Curriculum Generation, Validation, Output) are now part of the `continue-course` task.

---

## Error Handling

```yaml
error_scenarios:

  - error: "Course slug invalid format"
    trigger: "Slug contains invalid characters or wrong length"
    recovery:
      1: "Show validation rules"
      2: "Suggest sanitized version"
      3: "Ask user to provide new slug"
    example_message: |
      ❌ Invalid course slug: "{input_slug}"

      Rules:
      - Lowercase letters, numbers, hyphens only
      - 3-50 characters
      - Example: "my-course-name"

      Suggested: "{sanitized_slug}"

      Please provide a valid slug:

  - error: "Invalid creation mode selection"
    trigger: "User provides value other than 1 or 2 for mode selection"
    recovery:
      1: "Re-prompt with clear options"
      2: "Show folder existence status to help decide"
    example_message: |
      ❌ Invalid selection: "{input_value}"

      Please choose:
      1. Greenfield (creating new course from scratch)
      2. Brownfield (upgrading existing course materials)

      Note: Checking outputs/courses/{slug}/... {exists|does not exist}
      Suggestion: Choose {recommended_mode} based on folder state

      Your choice (1 or 2):

  - error: "Greenfield conflict - folder exists"
    trigger: "User selected greenfield but folder already exists"
    recovery:
      1: "Switch to brownfield mode (recommended)"
      2: "Delete folder and continue (destructive)"
      3: "Choose different slug"
    example_message: |
      ❌ CONFLICT: Greenfield mode selected but folder already exists!

      Found: outputs/courses/{slug}/
      Contains: {file_count} files

      This suggests you meant "Brownfield" (upgrade existing course).

      Recovery options:
      1. Change to Brownfield mode (recommended)
      2. Delete existing folder and continue as Greenfield (⚠️ DESTRUCTIVE)
      3. Choose different slug

      What would you like to do? (1/2/3):

  - error: "Brownfield conflict - folder missing"
    trigger: "User selected brownfield but folder doesn't exist"
    recovery:
      1: "Switch to greenfield mode"
      2: "Create folder manually and retry"
      3: "Check slug spelling"
    example_message: |
      ❌ CONFLICT: Brownfield mode selected but no folder found!

      Expected: outputs/courses/{slug}/

      Brownfield mode requires existing materials to upgrade.

      Recovery options:
      1. Change to Greenfield mode (create new course)
      2. Create folder manually and add materials, then retry
      3. Check slug spelling (typo?)

      What would you like to do? (1/2/3):

  - error: "Folder deletion cancelled"
    trigger: "User chose to delete folder but didn't confirm with 'DELETE'"
    recovery:
      1: "Return to mode conflict recovery options"
    example_message: |
      ⚠️ Deletion cancelled (confirmation not received)

      Returning to recovery options...

      What would you like to do?
      1. Change to Brownfield mode (recommended)
      2. Try delete again (type 'DELETE' to confirm)
      3. Choose different slug

  - error: "Template not found"
    trigger: "expansion-packs/creator-os/templates/course-brief.md not found"
    recovery:
      1: "Check if CreatorOS expansion pack installed"
      2: "Verify file path"
      3: "Provide manual template link"
    example_message: |
      ❌ Course brief template not found at:
      expansion-packs/creator-os/templates/course-brief.md

      Please verify:
      1. CreatorOS expansion pack is installed
      2. Template file exists at expected location

      Installation guide: expansion-packs/creator-os/README.md

  - error: "Permission denied"
    trigger: "Cannot create directory or write files"
    recovery:
      1: "Check file system permissions"
      2: "Suggest manual directory creation"
    example_message: |
      ❌ Permission denied: Cannot create /outputs/courses/{slug}/

      Please check:
      1. Write permissions for /outputs/courses/ directory
      2. Disk space available
      3. Path is accessible

      Manual fix: mkdir -p outputs/courses/{slug}
```

---

## Performance Targets

```yaml
performance:
  target_time: "< 60 seconds"
  target_cost: "$0 (no AI generation, just file operations)"

  breakdown:
    validation: "< 1 second"
    folder_creation: "< 1 second"
    template_copy: "< 1 second"
    readme_creation: "< 1 second"
    notification: "< 1 second"
```

---

## Success Metrics

```yaml
success_criteria:
  initialization:
    - Folder structure created: 100%
    - Template copied correctly: 100%
    - README generated: 100%
    - User notified with next steps: 100%

  user_experience:
    - Clear instructions provided
    - Next steps obvious (*continue-course command)
    - Error messages helpful and actionable
```

---

## Example Usage

### Example 1: Greenfield - New Course from Scratch

```bash
*generate-course

# Prompt: What is the course identifier (slug)?
> clone-ia-express

# Prompt: Is this course:
# 1. Greenfield - Creating from scratch (no existing materials)
# 2. Brownfield - Upgrading/migrating existing course materials
# Your choice (1 or 2):
> 1

# System validates: folder doesn't exist ✓

# Output:
✓ Greenfield mode validated
✓ Folder does not exist (will be created)

Proceeding to create course structure...

✓ Course structure initialized successfully!

📁 Created:
- Folder: /outputs/courses/clone-ia-express/
- Brief: /outputs/courses/clone-ia-express/COURSE-BRIEF.md
- README: /outputs/courses/clone-ia-express/README.md

---

📋 **NEXT STEP - Fill the Course Brief:**

1. Open: `outputs/courses/clone-ia-express/COURSE-BRIEF.md`
2. Complete ALL 8 sections (estimated time: 45-90 minutes)
3. Save the file

**When ready, run:**
```
*continue-course clone-ia-express
```
```

### Example 2: Brownfield - Upgrade Existing Course

```bash
*generate-course

# Prompt: What is the course identifier (slug)?
> dominando-obsidian

# Prompt: Is this course:
# 1. Greenfield - Creating from scratch (no existing materials)
# 2. Brownfield - Upgrading/migrating existing course materials
# Your choice (1 or 2):
> 2

# System validates: folder exists with 42 files ✓

# Output:
✓ Brownfield mode validated
✓ Folder exists: outputs/courses/dominando-obsidian/
✓ Found 42 files

Next: Analyzing existing materials...

---

✓ Brownfield mode activated!

📁 Detected:
- Folder: /outputs/courses/dominando-obsidian/
- Files found: 42

---

📋 **NEXT STEPS - Brownfield Workflow:**

**Phase 2: Material Extraction (Future Implementation)**

The system will extract content from your existing materials to:
1. Generate COURSE-BRIEF.md automatically (from existing content)
2. Identify ICP from audience descriptions
3. Extract instructor voice patterns
4. Map existing structure to course outline

**For now (Phase 1 - Manual Path):**

1. Create COURSE-BRIEF.md manually in: outputs/courses/dominando-obsidian/
2. Fill all sections based on your existing materials
3. Run: *continue-course dominando-obsidian

---

**Status:** Brownfield workflow is planned for Story 3.2-3.4 (Phase 2)
**Current workaround:** Use greenfield flow with manual COURSE-BRIEF.md
```

### Example 3: Error - Greenfield Conflict (Folder Exists)

```bash
*generate-course

# Prompt: What is the course identifier (slug)?
> clone-ia-express

# Prompt: Is this course:
# 1. Greenfield - Creating from scratch (no existing materials)
# 2. Brownfield - Upgrading/migrating existing course materials
# Your choice (1 or 2):
> 1

# System checks: folder DOES exist!

# Output:
❌ CONFLICT: Greenfield mode selected but folder already exists!

Found: outputs/courses/clone-ia-express/
Contains: 15 files

This suggests you meant "Brownfield" (upgrade existing course).

Recovery options:
1. Change to Brownfield mode (recommended)
2. Delete existing folder and continue as Greenfield (⚠️ DESTRUCTIVE)
3. Choose different slug

What would you like to do? (1/2/3):
> 1

# User chooses option 1 - system switches to brownfield
✓ Switched to Brownfield mode
✓ Folder exists: outputs/courses/clone-ia-express/
✓ Found 15 files

[... continues with brownfield workflow ...]
```

### Example 4: Error - Brownfield Conflict (Folder Missing)

```bash
*generate-course

# Prompt: What is the course identifier (slug)?
> new-course

# Prompt: Is this course:
# 1. Greenfield - Creating from scratch (no existing materials)
# 2. Brownfield - Upgrading/migrating existing course materials
# Your choice (1 or 2):
> 2

# System checks: folder does NOT exist!

# Output:
❌ CONFLICT: Brownfield mode selected but no folder found!

Expected: outputs/courses/new-course/

Brownfield mode requires existing materials to upgrade.

Recovery options:
1. Change to Greenfield mode (create new course)
2. Create folder manually and add materials, then retry
3. Check slug spelling (typo?)

What would you like to do? (1/2/3):
> 1

# User chooses option 1 - system switches to greenfield
✓ Switched to Greenfield mode
✓ Folder does not exist (will be created)

[... continues with greenfield workflow ...]
```

---

## Related Tasks

- **`continue-course`** - Reads filled COURSE-BRIEF.md and generates full course content (Steps 2-5 from v1.0)
- **`update-course`** - Modifies existing course based on feedback (future)
- **`export-course`** - Exports course to platform format (future)

---

## Migration Notes (v1.0 → v2.0)

**Breaking Changes:**
- ❌ **REMOVED:** Interactive elicitation (15-20 questions)
- ❌ **REMOVED:** Mode selection (generic/expert/legacy)
- ❌ **REMOVED:** Immediate content generation
- ✅ **ADDED:** Unified brief document approach
- ✅ **ADDED:** Two-step workflow (generate-course → continue-course)

**Why Changed:**
1. **Context Loss:** v1.0 required maintaining context across 15-20 Q&A rounds
2. **Interruptions:** User had to stay present for entire generation (15-45 min)
3. **No Iteration:** Couldn't revise requirements without regenerating
4. **Better UX:** v2.0 allows users to thoughtfully fill brief offline, review, iterate

**Migration Path:**
- If using v1.0 workflow: Switch to v2.0 by using `*generate-course` + `*continue-course`
- Old v1.0 task backed up at: `expansion-packs/creator-os/tasks/generate-course-v1-backup.md`

---

**Task Version:** 2.7
**Last Updated:** 2025-10-18
**Maintainer:** CreatorOS Team (Sarah - PO)
**Changelog:**
- v2.7 (2025-10-18): **Story 3.7 Implementation - MMOS Persona Integration**
  - Added Question 3: MMOS persona selection (both greenfield and brownfield)
  - Added Step 1.2.1: MMOS Persona Selection with detection and interactive selection
  - Created lib/mmos_integrator.py for MMOS mind detection and voice profile extraction
  - Implemented MMOS mind validation (identity-core.yaml, cognitive-spec.yaml, system prompts)
  - Added metadata extraction from MMOS minds (name, description, version)
  - Implemented interactive MMOS mind selection prompt with detailed display
  - Added voice profile extraction from MMOS files (tone, style, phrases, teaching philosophy)
  - Implemented COURSE-BRIEF frontmatter update with mmos_persona config
  - Implemented COURSE-BRIEF Section 4 auto-population with MMOS voice data
  - Added MMOS priority check in Step 2.6 (skips transcript extraction if MMOS enabled)
  - Updated Gap Analysis (Step 3.1) to mark Section 4 as 🟢 when MMOS enabled
  - Implemented voice question bypass in gap analysis (no voice elicitation needed)
  - Added system prompt path storage for lesson generation integration (Story 3.9)
  - MMOS integration works with both greenfield and brownfield workflows
  - Comprehensive error handling (no minds, corrupted minds, version mismatch)
  - Voice fidelity target: 95% (authentic instructor voice from MMOS)
- v2.6 (2025-10-18): **Story 3.6 Implementation - Gap Analysis & Smart Elicitation**
  - Added Step 3: Gap Analysis & Smart Elicitation (brownfield only)
  - Created lib/gap_analyzer.py for COURSE-BRIEF completeness analysis
  - Implemented section-level status detection (🟢/🟡/🔴) for all 8 sections
  - Added subsection/field-level granularity for fine-grained gap detection
  - Implemented placeholder detection (empty vs auto-filled fields)
  - Created lib/elicitation_engine.py for interactive question flow
  - Implemented three-tier summary display (Complete/Confirmation/Missing)
  - Added smart question generation (skip 🟢, confirm 🟡, elicit 🔴)
  - Created templates/elicitation-questions.yaml question bank (23 questions)
  - Implemented multiple question types (confirmation, multiple_choice, multiple_select, text)
  - Added answer persistence back to COURSE-BRIEF.md
  - Implemented final validation gate (all sections must be 🟢)
  - Added question count estimation (3-15 based on completeness)
  - Smart elicitation runs automatically after all extractions (brownfield only)
  - Reduces questions by 60-80% for good brownfield scenarios
- v2.5 (2025-10-18): **Story 3.5 Implementation - Learning Objectives Inference**
  - Added Step 2.7: Learning Objectives Inference (brownfield only)
  - Created pedagogical-patterns.yaml template with 6 lesson type patterns
  - Created blooms-taxonomy.yaml reference data with action verbs and examples
  - Implemented lib/objectives_inferencer.py for AI-free pattern-based inference
  - Added lesson file discovery (1.1-*.md, aula-*.md, lesson-*.md patterns)
  - Implemented pedagogical intent extraction from filenames
  - Added Bloom's Taxonomy classification (6 levels: Remember → Create)
  - Implemented multi-lesson aggregation to 3-5 course-level objectives
  - Added semantic clustering by lesson pattern type
  - Implemented COURSE-BRIEF.md Section 3.2 auto-population with status indicators
  - Added educational annotations about Bloom's Taxonomy and good objectives
  - Implemented confidence scoring based on pattern match quality
  - Added comprehensive error handling (no lessons, too few lessons, low confidence, imbalanced Bloom's)
  - Objectives inference runs automatically after voice extraction (brownfield only)
- v2.4 (2025-10-18): **Story 3.4 Implementation - Voice Extraction from Transcripts**
  - Added Step 2.6: Voice Extraction (brownfield only)
  - Integrated lib/voice_extractor.py module for AI-powered voice pattern analysis
  - Implemented multi-format transcript discovery (plain text, Markdown, SRT, VTT)
  - Added smart sampling strategy (3-5 representative transcripts based on course size)
  - Implemented AI analysis with GPT-4o-mini for voice pattern extraction (greeting, tone, phrases, teaching approach, personality)
  - Added multi-transcript aggregation with consistency scoring
  - Implemented COURSE-BRIEF.md Section 4 auto-population with status indicators (🟢/🟡/🔴)
  - Added caching mechanism (.voice-analysis-cache.yaml) to avoid re-analysis
  - Implemented user review checkpoint with edit/continue/rerun options
  - Added comprehensive error handling (no transcripts, API failures, low confidence, parsing errors)
  - Voice extraction runs automatically after ICP extraction (with user approval)
- v2.3 (2025-10-18): **Story 3.3 Implementation - ICP Extraction Engine**
  - Added Step 2.5: ICP Extraction (brownfield only)
  - Integrated lib/icp_extractor.py module for intelligent ICP data extraction
  - Implemented multi-strategy file discovery (filename patterns + content keywords)
  - Added Markdown parsing for structured ICP data (demographics, psychographics, pain points, goals)
  - Implemented multi-file merging with unique item aggregation
  - Added confidence scoring (0-100%) based on completeness
  - Implemented YAML export (icp-extracted.yaml) for traceability
  - Added COURSE-BRIEF.md Section 2 auto-population with status indicators (🟢/🟡/🔴)
  - Implemented user review checkpoint with edit/continue/rerun options
  - Added comprehensive error handling (no files, malformed MD, partial extraction, PDF fallback)
  - ICP extraction runs automatically after file organization (with user approval)
- v2.2 (2025-10-18): **Story 3.2 Implementation - File Inventory & Organization**
  - Added Step 2: File Organization (brownfield only)
  - Integrated lib/file_organizer.py module for intelligent categorization
  - Added dry-run preview with user approval checkpoint
  - Implemented 8-category file classification (transcripts, videos, ICP, profiles, resources, images, lessons, structured data, unknown)
  - Added canonical folder structure creation (/legado/transcripts/, /legado/videos/, /resources/, etc.)
  - Implemented safe file movement with duplicate detection and checksums
  - Added audit log generation with rollback command
  - Updated brownfield workflow notification to reflect organization status
  - Organization runs automatically after brownfield mode validation (with user approval)
- v2.1 (2025-10-18): **Story 3.1 Implementation - Greenfield/Brownfield Detection**
  - Added creation mode elicitation (greenfield vs brownfield)
  - Added folder existence validation with 4 scenarios
  - Added creation_mode metadata to COURSE-BRIEF.md frontmatter
  - Added workflow branching (greenfield → manual brief, brownfield → extraction)
  - Added comprehensive error recovery for mode/folder conflicts
  - Updated examples to show all validation scenarios
- v2.0 (2025-10-17): Refactored to unified brief document workflow. Split into generate-course (init) + continue-course (generation).
- v1.0 (2025-10-15): Initial interactive elicitation workflow (deprecated).
