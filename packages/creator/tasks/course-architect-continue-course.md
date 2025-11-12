---
task_name: "continue-course"
task_version: "2.2"
required_agent_version: ">=2.0"
description: "Read filled course brief and generate complete course content with pedagogical rigor using GPS Framework + Didática Lendária"
last_updated: "2025-10-18"
---

# Task: Continue Course Generation

**Task ID:** continue-course
**Version:** 2.1
**Purpose:** Read filled course brief and generate complete course content with pedagogical rigor
**Owner:** Course Architect Agent
**Estimated Time:** 15-45 minutes (depending on course size)
**Elicit:** false

---

## Overview

**WORKFLOW v2.0 - Brief-Driven Generation**

This task continues course generation after the user has filled the unified COURSE-BRIEF.md document. It reads the brief, validates completeness, and generates all course content (lessons, assessments, resources) with pedagogical frameworks and optional MMOS persona voice.

**Prerequisites:**
1. Course initialized with `*generate-course {slug}`
2. `COURSE-BRIEF.md` filled completely (all 8 sections)

**What This Task Does:**
1. Loads and validates filled COURSE-BRIEF.md
2. Applies pedagogical framework (Bloom's, ADDIE, Microlearning, etc.)
3. Generates course structure and curriculum
4. Creates lesson content with instructor voice (if specified)
5. Generates assessments and resources
6. Validates alignment, completeness, voice fidelity
7. Outputs final course files

**Success Criteria:**
- Course structure pedagogically sound (alignment score 90%+)
- Lessons maintain instructor voice (fidelity 85-90%+ if MMOS persona used)
- Human-in-the-loop workflow with preview/approval checkpoints
- Requires <20% manual editing after generation
- Output: Markdown lessons, YAML curriculum, database logging

---

## Input Parameters

### Required Parameters

1. **course_slug** (string, required)
   - Description: Course identifier (same as used in `*generate-course`)
   - Example: "clone-ia-express", "python-data-science"
   - Validation:
     - Must exist in `/outputs/courses/{slug}/`
     - Must have filled `COURSE-BRIEF.md`

---

## Processing Pipeline

### Step 1: Load & Validate Course Brief

**1.1. Check Course Exists**

```yaml
course_existence_check:
  step: "Verify course was initialized"

  checks:
    1_folder_exists:
      - Check if /outputs/courses/{slug}/ exists
      - If not: ERROR - "Course not found. Run *generate-course first."

    2_brief_exists:
      - Check if /outputs/courses/{slug}/COURSE-BRIEF.md exists
      - If not: ERROR - "Course brief not found."

  output:
    course_path: "/outputs/courses/{slug}/"
```

**1.2. Load Course Brief**

```yaml
brief_loading:
  step: "Read and parse COURSE-BRIEF.md"

  actions:
    1_read_file:
      - Read /outputs/courses/{slug}/COURSE-BRIEF.md
      - Parse frontmatter (YAML)
      - Extract all 8 sections

    2_parse_sections:
      section_1_basic_info:
        - course_title
        - tagline
        - duration (total_hours, modules, lessons)
        - knowledge_level
        - prerequisites

      section_2_icp:
        - demographics
        - psychographics
        - pain_levels (superficial, real, deep)
        - archetypes
        - success_metrics

      section_3_content:
        - learning_objectives
        - preliminary_outline
        - pedagogical_framework
        - content_depth
        - practical_ratio

      section_4_voice:
        - mode (generic, mmos, custom)
        - instructor_name
        - persona_source (if mmos)
        - voice_profile (if custom)

      section_5_format:
        - teaching_style
        - course_structure
        - content_formats
        - engagement_tactics

      section_6_commercial:
        - pricing_model
        - target_revenue
        - launch_timeline

      section_7_additional:
        - existing_materials
        - company_culture
        - constraints
        - custom_notes

      section_8_checklist:
        - Verify all checkboxes marked

  output:
    course_config: {parsed_brief_object}
```

**1.3. Validate Brief Completeness**

```yaml
brief_validation:
  step: "Ensure all required fields are filled"

  required_fields:
    - course_title
    - duration (total_hours, modules, lessons)
    - target_audience (demographics, psychographics)
    - learning_objectives (3-7 objectives)
    - pedagogical_framework
    - teaching_style
    - voice_mode

  validation_checks:
    1_required_fields:
      - Check all required fields present
      - Check no placeholder text remaining (e.g., "[PREENCHER]", "___")

    2_quality_checks:
      - Learning objectives use action verbs (Bloom's taxonomy)
      - Duration ratios realistic (3h ≠ 50 lessons)
      - ICP detailed enough (not just "entrepreneurs")

  if_validation_fails:
    - Show list of missing/incomplete fields
    - HALT and ask user to complete brief
    - Do NOT proceed with generation

  example_error: |
    ❌ Course brief incomplete. Please fill the following:

    Missing fields:
    - Section 2: ICP Demographics (currently placeholder)
    - Section 3: Learning Objectives (need 3-7, found 1)
    - Section 4: Instructor name (required for expert mode)

    Complete the brief and run *continue-course again.
```

**1.4. Load Instructor Persona (if mode=mmos or custom)**

```yaml
persona_loading:
  step: "Load MMOS mind or extract custom instructor profile from brief"

  if_mmos_persona:
    paths:
      personality_profile: "outputs/minds/{mind_name}/synthesis/personality-profile.json"
      system_prompt: "outputs/minds/{mind_name}/synthesis/system-prompt-generalista.md"
      cognitive_spec: "outputs/minds/{mind_name}/analysis/cognitive-spec.yaml"

    extraction:
      voice_parameters:
        - tone: Extract from communication_style
        - complexity: Extract from depth_of_analysis
        - sentence_length: Analyze from system_prompt samples
        - vocabulary_level: Extract jargon frequency
        - formality: Map from cognitive preferences

      style_markers:
        - signature_phrases: Extract recurring phrases (3+ mentions)
        - example_types: "research" vs "stories" vs "cases"
        - metaphor_frequency: "rare" | "occasional" | "frequent"
        - transitions: Preferred connectors

      instructor_profile:
        name: "{mind_name}"
        source: "MMOS Clone"
        authority: Extract from Layer 3 (Knowledge) + Layer 4 (Skills)
        beliefs: Extract from Layer 5 (Values) + Layer 6 (Obsessions)
        personality: Extract from Layer 8 (Paradoxes) + communication_style
        fidelity_target: 0.90  # MMOS personas target 90%+

  if_custom_persona:
    extraction_from_brief:
      - Read Section 4.1 (Instrutor / Persona)
      - Parse tone, personality traits, signature phrases
      - Extract "things instructor NEVER does/says"
      - Build voice_parameters object

    voice_parameters_mapping:
      - Analyze provided profile text from brief
      - Extract tone, complexity, style markers
      - Generate voice_parameters object similar to MMOS format
      - fidelity_target: 0.85  # Custom personas target 85%+

  if_generic:
    - Use teaching_style from brief as primary guide
    - No persona fidelity validation needed
    - Standard professional voice

  output:
    instructor_persona:
      name: "{instructor_name or 'Generic'}"
      source: "MMOS Clone" | "Custom Profile" | "Generic"
      voice_parameters: {...}
      style_markers: {...}
      authority: {...}
      beliefs: [...]
      personality: "..."
      fidelity_target: 0.85 | 0.90 | null
```

---

### Step 2: Pedagogical Design

**(Implementation from v1.0 - adapted for brief-driven approach)**

**2.1. Framework Application**

```yaml
pedagogical_design:
  step: "Apply selected framework from brief to course structure"

  input_source: course_config.pedagogical_framework

  frameworks:
    blooms_taxonomy:
      description: "6 levels of cognitive complexity"
      levels:
        1_remember: "Recall facts, terms, concepts"
        2_understand: "Explain ideas, summarize"
        3_apply: "Use information in new situations"
        4_analyze: "Break down, find patterns"
        5_evaluate: "Justify decisions, critique"
        6_create: "Design, construct, produce"

      application:
        - Map learning objectives (from brief Section 3.2) to Bloom's levels
        - Ensure progression: start lower (remember/understand), end higher (evaluate/create)
        - Each lesson targets 1-2 levels
        - Assessments match objective levels

    addie:
      description: "5-phase instructional design process"
      phases:
        1_analysis: "ICP from brief Section 2"
        2_design: "Learning objectives from brief Section 3.2"
        3_development: "Generate lessons, assessments"
        4_implementation: "User handles post-generation"
        5_evaluation: "Formative + summative assessments"

      application:
        - Analysis phase: Use ICP from brief
        - Design phase: Use objectives + outline from brief
        - Development: Generate content
        - Implementation & Evaluation: User responsibility

    microlearning:
      description: "Short, focused lessons (5-10 min each)"
      principles:
        - One concept per lesson
        - Maximum 10-15 minutes per lesson
        - Immediately actionable
        - No fluff, direct to the point

      application:
        - Break course into micro-lessons
        - Target: 5-10 min reading (1000-1500 words)
        - Each lesson = 1 key takeaway + 1 action step

      ideal_for:
        - Busy professionals (check ICP from brief)
        - Founders, executives
        - Corporate onboarding

    kolb:
      description: "Experiential learning cycle"
      stages:
        1_concrete_experience: "Do something (exercise, simulation)"
        2_reflective_observation: "Reflect on what happened"
        3_abstract_conceptualization: "Form theories, connect to concepts"
        4_active_experimentation: "Apply in new context"

      application:
        - Each module follows Kolb's 4 stages
        - Lesson sequence: Practice → Reflect → Learn → Experiment

    backward_design:
      description: "Start with end goals, work backwards"
      steps:
        1_identify_outcomes: "Use objectives from brief Section 3.2"
        2_determine_assessment: "Design final project first"
        3_design_learning_experiences: "Build lessons that scaffold"

      application:
        - Define final project/capstone first
        - Reverse-engineer: What knowledge/skills needed?
        - Build lessons that scaffold toward final outcome

  output:
    selected_framework: "{from_brief or auto-recommended}"
    framework_guidelines: "{specific rules for this framework}"
```

**2.2. Course Structure Generation**

```yaml
structure_generation:
  step: "Generate detailed course outline based on brief"

  input_sources:
    - course_title (brief Section 1.1)
    - target_audience (brief Section 2)
    - learning_objectives (brief Section 3.2)
    - preliminary_outline (brief Section 3.3)
    - duration (brief Section 1.2)
    - framework (brief Section 3.4 or auto-recommended)
    - teaching_style (brief Section 3.4)

  prompt_to_llm: |
    Design a detailed course structure based on:

    Course: {course_config.course_title}
    Target Audience: {course_config.icp}
    Learning Objectives: {course_config.learning_objectives}
    Duration: {course_config.duration.total_hours} hours ({course_config.duration.modules} modules, {course_config.duration.lessons} lessons)
    Framework: {course_config.pedagogical_framework}
    Style: {course_config.teaching_style}
    Instructor: {course_config.instructor_name if expert mode}

    Preliminary Outline from Brief:
    {course_config.preliminary_outline}

    Instructions:
    1. Refine the preliminary outline from the brief
    2. Add learning objectives per lesson (Bloom's verb)
    3. Add estimated duration per lesson
    4. Add key concepts/activities per lesson
    5. Add assessment checkpoints
    6. Follow {framework} principles
    7. Match {quality_reference} quality standards

  llm_model: "claude-sonnet-4"
  temperature: 0.7
  max_tokens: 3000

  output_example:
    course_outline:
      title: "{from_brief}"
      total_duration: "{from_brief}"
      num_modules: {from_brief}
      num_lessons: {from_brief}

      modules:
        - module_id: 1
          module_title: "{generated_or_refined_from_brief}"
          module_objectives:
            - "Objective 1 (Bloom: Level)"
            - "Objective 2 (Bloom: Level)"
          duration: "X hours"

          lessons:
            - lesson_id: "1.1"
              lesson_title: "{generated_or_refined}"
              learning_objectives:
                - "Specific learnable outcome"
              duration: "X min"
              key_concepts:
                - "Concept 1"
                - "Concept 2"
              activities:
                - "Exercise: Description"
              prerequisites: "None or specific"

            - lesson_id: "1.2"
              # ... (continue pattern)

      assessments:
        - type: "quiz"
          location: "End of Module 1"
          format: "10 multiple choice + 2 short answer"

        - type: "project"
          location: "End of Module 2"
          format: "Build and submit deliverable"

      resources:
        - "Template: Name"
        - "Tool List: Name"
        - "Reading: Name"
```

**2.3. Preview & User Approval**

```yaml
preview_approval:
  step: "Present outline to user for confirmation (HITL Checkpoint)"

  display:
    summary: |
      ✓ Course structure generated!

      Title: {title}
      Duration: {total_hours} hours
      Modules: {num_modules}
      Lessons: {num_lessons}
      Framework: {pedagogical_framework}
      Style: {teaching_style}

      Outline:
      {formatted_outline_preview}

    full_outline:
      - Show complete structure (modules, lessons, objectives)
      - Display estimated durations
      - List assessments and resources

  user_actions:
    prompt: |
      Review the course structure above. What would you like to do?

      1. Approve and generate full content
      2. Adjust structure (modify modules/lessons)
      3. Change pedagogical approach
      4. Regenerate with different parameters

    validation: User must approve before content generation

  if_approved:
    next: "Step 3: Curriculum Generation"

  if_adjustments:
    - Collect feedback
    - Regenerate outline with changes
    - Loop back to preview_approval
```

---

### Step 3: Curriculum Generation

**(Implementation from v1.0 - adapted for brief-driven approach)**

**3.1. Generate curriculum.yaml from approved outline**

```yaml
curriculum_yaml_generation:
  step: "Convert outline to structured curriculum.yaml"

  input_sources:
    - course_outline (from Step 2.2 approved output)
    - course_config (from Step 1.2 brief)

  output_file: "outputs/courses/{slug}/curriculum.yaml"

  structure:
    course_id: "{uuid}"
    title: "{from_brief}"
    slug: "{slug}"
    version: "1.0"
    created_at: "{timestamp}"

    metadata:
      total_duration_hours: {from_brief}
      knowledge_level: "{from_brief}"
      target_audience: "{from_brief}"
      pedagogical_framework: "{from_brief}"
      teaching_style: "{from_brief}"

    modules:
      - module_id: 1
        module_title: "{from_outline}"
        duration_minutes: {calculated}
        lessons:
          - lesson_id: "1.1"
            lesson_title: "{from_outline}"
            duration_minutes: {from_outline}
            learning_objectives: [...]
            bloom_level: "{from_outline}"
          - lesson_id: "1.2"
            # ...
```

---

### Step 4: Curriculum Approval Checkpoint (MANDATORY HALT)

**CRITICAL:** This is a human-in-the-loop checkpoint that HALTS the workflow to prevent costly mistakes.

**Story:** STORY-3.8 - Curriculum Approval Checkpoint

**4.1. Display Curriculum Summary**

```yaml
curriculum_summary_display:
  step: "Present clear curriculum overview"

  library: "lib/curriculum_approval.py"
  class: "CurriculumApprovalCheckpoint"

  display_format: |
    ════════════════════════════════════════════════════════════
    📋 CURRICULUM GENERATED
    ════════════════════════════════════════════════════════════

    Course: {course_title}
    Total: {num_lessons} lessons across {num_modules} modules
    Estimated Duration: {total_hours} hours
    Estimated Generation Cost: ${cost_min}-${cost_max}
    Estimated Generation Time: {time_min}-{time_max} minutes

    ════════════════════════════════════════════════════════════

    📚 MODULE BREAKDOWN:

    Module 1: {title} ({lesson_count} lessons, ~{duration} min)
      1.1 - {lesson_title} ({duration} min)
      1.2 - {lesson_title} ({duration} min)
      ...

    Module 2: {title} ({lesson_count} lessons, ~{duration} min)
      2.1 - {lesson_title} ({duration} min)
      ...

    ════════════════════════════════════════════════════════════

    📄 FULL CURRICULUM:
       File: outputs/courses/{slug}/curriculum.yaml
       (Open to see complete YAML structure)

    ════════════════════════════════════════════════════════════

  cost_estimation:
    formula: "lesson_count * $0.70-$1.10 per lesson (GPT-4 based)"
    basis: "Typical lesson length 1500-2000 words"

  time_estimation:
    formula: "lesson_count * 2-3 minutes per lesson"
    basis: "Claude Sonnet 4 generation time"
```

**4.2. Present Approval Options (NEVER AUTO-APPROVE)**

```yaml
approval_options:
  step: "Wait for explicit user choice"

  display: |
    ⏸️  CHECKPOINT: Approve curriculum?

    ────────────────────────────────────────────────────────────

    Options:

    [1] ✅ APPROVE
        → Generate all {lesson_count} lessons now
        → Estimated cost: ${cost_min}-${cost_max} | Time: {time_min}-{time_max} min
        → Cannot undo (lessons will be generated)

    [2] ✏️  EDIT CURRICULUM
        → Modify curriculum.yaml manually in your editor
        → Add/remove lessons, adjust titles/durations
        → Return here when done to validate changes

    [3] 🔄 REGENERATE CURRICULUM
        → Go back to COURSE-BRIEF.md and adjust
        → Re-run outline and curriculum generation
        → Use if structure needs major changes

    [4] ❌ CANCEL WORKFLOW
        → Stop here without generating lessons
        → Progress saved (COURSE-BRIEF, curriculum preserved)
        → Resume later with: *continue-course {slug}

    ────────────────────────────────────────────────────────────

    💡 TIP: Most users choose [2] to tweak lesson titles before approval.

    ────────────────────────────────────────────────────────────

    Your choice (1-4): _

  validation:
    - User MUST enter 1, 2, 3, or 4 (no default)
    - No config option to bypass checkpoint
    - All decisions logged for audit

  critical_rule: |
    NEVER auto-approve curriculum, even if:
    - User has "auto_approve_curriculum: true" in config (ignore it)
    - Curriculum looks perfect (still require human review)
    - User is in batch mode (still HALT)

    Rationale: This is a "spend money" gate - must be explicit
```

**4.3. Handle User Choice**

```yaml
option_handlers:

  option_1_approve:
    handler: "CurriculumApprovalCheckpoint.handle_option_approve()"

    workflow:
      1_confirmation_prompt: |
         ⚠️  This will generate all {lesson_count} lessons and incur costs (${cost_min}-${cost_max}).
            Are you sure? (yes/no): _

      2_validate_confirmation:
         - If "yes": Proceed to option_1_approve_confirmed
         - If "no": Return to approval_options
         - Any other input: Return to approval_options

      3_approve_confirmed:
         - Log approval decision
         - Return: "proceed_to_generation"
         - Continue to Step 5 (Lesson Generation)

    critical_rule: "Require explicit 'yes' confirmation (safety check)"

  option_2_edit:
    handler: "CurriculumApprovalCheckpoint.handle_option_edit()"

    workflow:
      1_display_instructions: |
         ✏️  EDIT MODE

         1. Open curriculum file:
            {curriculum_path}

         2. Make your changes:
            - Add/remove lessons
            - Adjust titles, durations, or learning objectives
            - Reorder modules

         3. Save the file

         4. Return here and press ENTER to validate changes

         ────────────────────────────────────────────────────────────

         💡 TIPS:
            - Keep numbering sequential (1.1, 1.2, 2.1, ...)
            - Lesson duration: 10-45 minutes typical
            - Use YAML syntax (indentation matters!)

         ────────────────────────────────────────────────────────────

         When done editing, press ENTER to continue: _

      2_wait_for_user: "input() - User edits file externally"

      3_revalidate_curriculum:
         - Run: validate_curriculum_yaml(curriculum_path)
         - If validation fails:
           - Display errors
           - Show fix instructions
           - HALT with resume command
         - If validation passes:
           - Display success
           - Reload curriculum data
           - Re-display curriculum summary
           - Return to approval_options (loop)

    validation_rules:
      - YAML syntax valid
      - Modules list exists and not empty
      - Each module has lessons
      - Lesson IDs sequential (1.1, 1.2, 2.1, ...)
      - No duplicate lesson IDs
      - Total duration reasonable (60-3000 min)

  option_3_regenerate:
    handler: "CurriculumApprovalCheckpoint.handle_option_regenerate()"

    workflow:
      1_explain_workflow: |
         🔄 REGENERATE CURRICULUM

         This will:
         1. Return to COURSE-BRIEF.md for editing
         2. Re-run outline generation
         3. Re-run curriculum generation
         4. Return to this checkpoint

         Current curriculum.yaml will be backed up as curriculum-backup-{timestamp}.yaml

         ────────────────────────────────────────────────────────────

         → Proceed with regeneration? (yes/no): _

      2_get_confirmation:
         - If "yes": Continue to step 3
         - If "no": Return to approval_options

      3_backup_curriculum:
         - Copy curriculum.yaml to curriculum-backup-{timestamp}.yaml
         - Log backup path

      4_provide_instructions: |
         📝 EDIT COURSE-BRIEF.md

         1. Open: outputs/courses/{slug}/COURSE-BRIEF.md
         2. Make changes (objectives, structure, etc.)
         3. Save the file
         4. Run: *continue-course {slug} --regenerate-curriculum

         Workflow will regenerate outline + curriculum based on updated brief.

         ────────────────────────────────────────────────────────────

      5_halt_workflow:
         - Log regeneration decision
         - Return: "halt_for_brief_edit"
         - Workflow HALTS (user must manually resume)

  option_4_cancel:
    handler: "CurriculumApprovalCheckpoint.handle_option_cancel()"

    workflow:
      1_display_summary: |
         ❌ WORKFLOW CANCELED

         Progress has been saved:
         ✓ COURSE-BRIEF.md
         ✓ course-outline.md
         ✓ curriculum.yaml

         No lessons were generated (no cost incurred).

         ────────────────────────────────────────────────────────────

         To resume later:

         Option A: Generate lessons with current curriculum
           → *continue-course {slug}

         Option B: Edit curriculum first, then generate
           → Edit: outputs/courses/{slug}/curriculum.yaml
           → Run: *continue-course {slug} --validate-curriculum

         Option C: Start over (regenerate curriculum)
           → *continue-course {slug} --regenerate-curriculum

         ────────────────────────────────────────────────────────────

      2_log_decision:
         - Log: "User canceled workflow at curriculum checkpoint"

      3_halt_workflow:
         - Return: "halt_canceled"
         - Workflow HALTS gracefully
```

**4.4. Curriculum Validation Logic**

```yaml
validation_function:
  name: "validate_curriculum_yaml()"
  location: "lib/curriculum_approval.py"

  rules:
    rule_1_yaml_syntax:
      check: "Parse YAML without errors"
      error_if_fails: "Invalid YAML syntax: {yaml_error}"

    rule_2_has_modules:
      check: "'modules' key exists and not empty"
      error_if_fails: "No modules found in curriculum"

    rule_3_modules_have_lessons:
      check: "Each module has 'lessons' list (not empty)"
      error_if_fails: "Module {id} has no lessons"

    rule_4_sequential_numbering:
      check: "Lesson IDs match pattern: {module_num}.{lesson_num}"
      expected: "1.1, 1.2, 1.3, 2.1, 2.2, ..."
      error_if_fails: "Lesson numbering error: Expected {expected}, got {actual}"

    rule_5_no_duplicates:
      check: "All lesson IDs are unique"
      error_if_fails: "Duplicate lesson IDs found: {duplicates}"

    rule_6_duration_reasonable:
      check: "Total duration between 60-3000 minutes"
      warning_if_short: "Total duration < 60 min: {duration}"
      warning_if_long: "Total duration > 3000 min: {duration}"

  return_format:
    valid: true/false
    errors: [...]  # Blocking errors
    warnings: [...]  # Non-blocking warnings
```

**4.5. Implementation Code**

```python
# In continue-course workflow Step 4:

from lib.curriculum_approval import CurriculumApprovalCheckpoint

# After curriculum.yaml generation (Step 3.1)
checkpoint = CurriculumApprovalCheckpoint(course_slug)

# Display summary
checkpoint.display_curriculum_summary()

# Show options and get user choice
result = checkpoint.show_approval_options()

# Handle result
if result == "proceed_to_generation":
    # User approved - continue to Step 5 (Lesson Generation)
    print("\n→ Proceeding to lesson generation (Step 5)...\n")
    # Continue workflow...

elif result == "halt_for_brief_edit":
    # User chose regenerate - HALT with instructions
    print("\n→ Workflow halted for brief editing.")
    print("   Resume with: *continue-course {slug} --regenerate-curriculum\n")
    sys.exit(0)

elif result == "halt_canceled":
    # User canceled - HALT gracefully
    print("\n→ Workflow canceled by user.\n")
    sys.exit(0)
```

**4.6. Success Criteria**

```yaml
success_criteria:
  - ✅ 100% of workflows HALT at curriculum checkpoint
  - ✅ Zero accidental lesson generations (always require approval)
  - ✅ All approval decisions logged for audit
  - ✅ Validation catches YAML errors before lesson generation
  - ✅ User can edit/regenerate/cancel without losing progress
  - ✅ Resume instructions provided for all HALT scenarios
```

---

### Step 5: Lesson Generation (GPS + Didática Lendária)

**(Only runs after explicit approval from Step 4)**

**GATE:** This step only executes if Step 4 returns "proceed_to_generation"

**Story:** STORY-3.9 - Lesson Generation with GPS + Didática Lendária

**5.1. Initialize Lesson Generator**

```python
from lib.lesson_generator import LessonGenerator

# After curriculum approval
generator = LessonGenerator(
    course_slug=course_slug,
    curriculum=curriculum_data,
    course_brief=course_brief_data
)
```

**5.2. Generate All Lessons Sequentially**

```yaml
batch_generation:
  step: "Generate all lessons with progress tracking"

  library: "lib/lesson_generator.py"
  class: "LessonGenerator"
  method: "generate_all_lessons()"

  process:
    1_load_voice_profile:
      priority_order:
        - MMOS persona (if enabled) → Load full system prompt
        - Transcripts (if extracted) → Use voice patterns
        - Manual (from brief) → Use defined tone/style

      output: VoiceProfile with prompt injection text

    2_for_each_lesson:
      steps:
        a_build_generation_prompt:
          inputs:
            - GPS framework template (lesson-gps-framework.md)
            - Lesson spec (ID, title, objectives, duration)
            - Course brief (ICP, learning objectives)
            - Voice profile (MMOS > Transcripts > Manual)

          template_structure: |
            G (GOAL) - 30-60 seconds
              → Clear promise (3 tangible outcomes)
              → Why this matters (emotional hook)

            P (POSITION) - 60-90 seconds
              → Empathy (validate concerns)
              → Acknowledge different starting points

            S (STEPS) - Main content
              → Why before What
              → Analogies + Diagrams
              → Reflective questions (2-3)
              → Link de Transição (between concepts)

            REVISÃO ESTRUTURADA
              → Before → After transformation

            AÇÃO RÁPIDA (2 minutes)
              → Specific, achievable action

          critical_requirements:
            - Follow GPS structure exactly (G → P → S)
            - Include all 7 Elements (Didática Lendária)
            - Use voice profile naturally (not generic AI)
            - Minimum: 1 analogy, 1 diagram, 2 reflective questions
            - Word count: duration_minutes × 150 words/min

        b_generate_with_ai:
          model: "gpt-4"  # or gpt-4-turbo
          temperature: 0.7
          max_tokens: 4000
          system_prompt: "templates/generation-prompt-system.md"

          retry_logic:
            max_retries: 2
            backoff: [1s, 2s]  # Exponential backoff
            on_failure: "Log error, continue to next lesson"

        c_validate_content:
          quick_checks:
            - Not empty (>500 words)
            - Has GPS sections (G, P, S)
            - Minimum structure present

          if_invalid: "Retry (up to 2 times)"

        d_save_lesson:
          filename_format: "{module}.{lesson}-{slug}.md"
          examples:
            - "1.1-intro.md"
            - "2.3-advanced-topic.md"

          path: "outputs/courses/{slug}/lessons/"

          validation:
            - NO zero-padding (1.1 not 01.01)
            - Dot separator (module.lesson)
            - Dash before slug
            - Slug is kebab-case

        e_update_progress:
          display:
            - Progress bar (ASCII: ████░░░░)
            - Completed lessons (✅ with duration)
            - Current lesson (🔄 with elapsed time)
            - Queued lessons (⏳ next 3)
            - Statistics (avg time, estimated completion, cost)

    3_handle_failures:
      strategy: "Continue to next lesson (don't abort)"
      tracking: "failed_lessons list with error details"
      recovery: "Offer retry command after completion"

  output: GenerationResult
    completed: [GeneratedLesson objects]
    failed: [Error details per lesson]
    total_time_seconds: float
    total_cost_usd: float
    avg_time_per_lesson: float
```

**5.3. Display Completion Summary**

```yaml
completion_summary:
  step: "Present generation results"

  if_all_succeeded:
    display: |
      ════════════════════════════════════════════════════════════
      ✅ COURSE GENERATION COMPLETE!
      ════════════════════════════════════════════════════════════

      Course: {course_title}
      Generated: {completed_count}/{total_count} lessons (100%)
      Total time: {total_time_minutes} minutes
      Total cost: ${total_cost}

      ════════════════════════════════════════════════════════════

      📂 OUTPUT FILES:

      Lessons ({count} files):
        outputs/courses/{slug}/lessons/
        ├── 1.1-{slug}.md
        ├── 1.2-{slug}.md
        ...

      ════════════════════════════════════════════════════════════

      📊 QUALITY METRICS:

      GPS Compliance: {gps_percentage}% (target: 100%)
      Avg Lesson Length: {avg_words} words

      ════════════════════════════════════════════════════════════

      🎯 NEXT STEPS:

      1. Review generated lessons:
         → Open: outputs/courses/{slug}/lessons/

      2. Run validation checks:
         → *validate-course {slug}

      3. Generate assessments:
         → *generate-assessments {slug}

      ════════════════════════════════════════════════════════════

  if_partial_success:
    display: |
      ⚠️  COURSE GENERATION PARTIALLY COMPLETE

      Generated: {completed}/{total} lessons ({percentage}%)
      Failed: {failed_count} lessons

      ════════════════════════════════════════════════════════════

      ❌ FAILED LESSONS:

      1. {lesson_id} - {lesson_title}
         Error: {error_message}
         Action: Retry with: *generate-lesson {slug} {lesson_id}

      ...

      ════════════════════════════════════════════════════════════

      → To retry failed lessons:
        *retry-failed-lessons {slug}

      ════════════════════════════════════════════════════════════
```

**5.4. Implementation Code**

```python
# In continue-course workflow Step 5:

from lib.lesson_generator import LessonGenerator

# After curriculum approval (Step 4 returned "proceed_to_generation")
print("\n→ Proceeding to lesson generation (Step 5)...\n")

# Initialize generator
generator = LessonGenerator(
    course_slug=course_slug,
    curriculum=curriculum_data,
    course_brief=course_brief_data
)

# Generate all lessons
result = generator.generate_all_lessons()

# Check results
if len(result.failed) == 0:
    print(f"\n✅ All {result.total_lessons} lessons generated successfully!")
else:
    print(f"\n⚠️  {len(result.completed)}/{result.total_lessons} lessons generated")
    print(f"   {len(result.failed)} lessons failed - review errors above")
```

**5.5. Success Criteria**

```yaml
success_criteria:
  - ✅ All lessons follow GPS structure (G → P → S)
  - ✅ All 7 Didática Lendária elements present
  - ✅ Voice fidelity ≥85% (custom) or ≥90% (MMOS)
  - ✅ File naming convention enforced (M.L-slug.md)
  - ✅ Retry logic handles failures gracefully
  - ✅ Progress tracking displays in real-time
  - ✅ Partial completion handled (failed lessons tracked)
  - ✅ Completion summary shows next steps
```

        content: |
          # {lesson_title}

          ## Objetivos de Aprendizagem

          Após esta aula, você será capaz de:
          - {objective_1}
          - {objective_2}
          - {objective_3}

          ---

          ## {Hook Section}

          {hook_content}

          ---

          ## {Core Content Sections}

          {content_body}

          ---

          ## 💡 Principais Takeaways

          - {takeaway_1}
          - {takeaway_2}
          - {takeaway_3}

          ---

          ## 🎯 Atividade Prática

          {exercise_description}

          ---

          ## 📚 Recursos Complementares

          - {resource_1}
          - {resource_2}

          ---

          **Próxima Aula:** [{next_lesson_title}]({next_lesson_file})
```

**5.2. Generate Assessments**

```yaml
assessment_generation:
  step: "Create quizzes, exercises, and final projects"

  input_sources:
    - module_objectives (from Step 2.2 output)
    - learning_objectives (from brief Section 3.2)
    - assessment_preferences (from brief Section 3.5)

  types:
    quiz:
      format: "Multiple choice + short answer"
      placement: "End of module"

      prompt_to_llm: |
        Create a quiz for Module {module_id}: {module_title}

        Learning Objectives Covered:
        {list_of_module_objectives}

        Target Audience: {icp_from_brief}
        Knowledge Level: {knowledge_level_from_brief}

        Requirements:
        - 10 multiple choice questions (4 options each)
        - 2-3 short answer questions
        - Questions must test understanding, not just recall
        - Align with Bloom's levels: {target_levels}
        - Include answer key with explanations

      output_format: YAML
      ```yaml
      quiz:
        module: {module_id}
        title: "Quiz: {module_title}"
        questions:
          - id: 1
            type: "multiple_choice"
            question: "..."
            options:
              A: "..."
              B: "..."
              C: "..."
              D: "..."
            correct_answer: "B"
            explanation: "..."
            bloom_level: "understand"
      ```

    project:
      format: "Hands-on deliverable"
      placement: "End of major section or course"

      prompt_to_llm: |
        Design a capstone project for: {course_title_from_brief}

        Learning Objectives:
        {all_course_objectives_from_brief}

        Target Audience: {icp_from_brief}
        Desired Transformation: {transformation_from_brief}

        Requirements:
        - Project demonstrates mastery of {key_skills}
        - Clear deliverable (artifact student creates)
        - Evaluation rubric (how to grade)
        - Estimated completion time: {hours_from_brief}
        - Scaffolded steps (break into phases)
        - Relevant to ICP's real-world context

      output_format: Markdown
      ```markdown
      # Projeto Final: {project_title}

      ## Objetivo
      {what_student_will_build}

      ## Etapas
      1. {phase_1}
      2. {phase_2}
      ...

      ## Critérios de Avaliação
      - {criterion_1}: X points
      - {criterion_2}: X points

      ## Entrega
      {submission_format}
      ```
```

**5.3. Generate Supplementary Resources**

```yaml
resources_generation:
  step: "Create templates, checklists, tool lists"

  input_sources:
    - resource_requirements (from brief Section 3.5)
    - course_content (generated lessons)
    - icp (from brief Section 2)

  types:
    - checklist: "Step-by-step action items"
    - template: "Fill-in-the-blank worksheet"
    - tool_list: "Curated tools for course topic"
    - reading_list: "Recommended books/articles"
    - glossary: "Key terms and definitions"

  examples:
    checklist:
      title: "{Topic} Setup Checklist"
      items:
        - "[ ] Step 1 (specific to course topic)"
        - "[ ] Step 2"
        - "[ ] Step 3"

    template:
      title: "{Topic} Template"
      format: "YAML or Markdown"
      content: |
        field_1: "___________"
        field_2: "___________"

    tool_list:
      title: "Recommended Tools for {Course Topic}"
      tools:
        - name: "{Tool Name}"
          purpose: "{What it's for}"
          cost: "{Free | Paid | Freemium}"
          link: "{URL}"
```

---

### Step 6: Pedagogical Validation

**(Implementation from v1.0 - adapted for brief-driven approach)**

**6.1. Alignment Check**

```yaml
alignment_validation:
  step: "Verify objectives ↔ content ↔ assessments alignment"

  method: "Automated + LLM-assisted analysis"

  checks:
    1_objectives_coverage:
      - For each learning objective (from brief Section 3.2):
        - Is it addressed in lesson content? (Y/N)
        - Is it assessed? (quiz, project, activity)

      scoring:
        - Coverage: % of objectives addressed in content
        - Assessment: % of objectives tested
        - Target: 100% coverage, 80%+ assessed

    2_bloom_level_progression:
      - Analyze Bloom's levels per lesson
      - Verify logical progression (low → high)
      - Check assessments match objective levels

      scoring:
        - Progression score: Levels increase appropriately?
        - Mismatch: Assessment easier than objective (red flag)

    3_content_assessment_alignment:
      - For each assessment question:
        - Was this content taught in lessons?
        - Does difficulty match lesson depth?

      prompt_to_llm: |
        Review this quiz question:
        "{question_text}"

        Was this concept covered in these lessons?
        {list_of_lesson_titles_and_summaries}

        Rate alignment: 1-5
        1 = Not covered, unfair question
        5 = Perfectly aligned, covered in depth

      scoring:
        - Average alignment score across all questions
        - Target: 4.0+

  overall_alignment_score:
    formula: |
      alignment_score = (
        objectives_coverage * 0.40 +
        bloom_progression * 0.30 +
        content_assessment_alignment * 0.30
      )

    target: ≥ 0.90 (90%+)

    if_below_target:
      actions:
        - Identify specific gaps
        - Regenerate flagged lessons/assessments
        - Re-run validation
```

**6.2. Completeness Check**

```yaml
completeness_validation:
  step: "Ensure all required components are present"

  required_components:
    course_level:
      - [x] Course title
      - [x] Course description
      - [x] Target audience (ICP)
      - [x] Overall learning objectives (3-7)
      - [x] Total duration estimate
      - [x] Prerequisites
      - [x] Course outline (modules, lessons)

    module_level:
      - [x] Module title
      - [x] Module objectives
      - [x] Duration estimate
      - [x] List of lessons
      - [x] Module summary/recap

    lesson_level:
      - [x] Lesson title
      - [x] Learning objectives (1-3 per lesson)
      - [x] Duration estimate
      - [x] Hook/intro
      - [x] Core content
      - [x] Examples (at least 1)
      - [x] Key takeaways (3-5 points)
      - [x] Activity/exercise (if applicable)
      - [x] Resources (if applicable)
      - [x] Transition to next lesson

    assessment_level:
      - [x] Assessment type (quiz, project, etc.)
      - [x] Instructions
      - [x] Evaluation criteria/rubric
      - [x] Answer key (if quiz)

  validation_process:
    - Parse all generated files
    - Check for presence of each component
    - Flag missing elements
    - Calculate completeness percentage

  completeness_score:
    formula: "present_components / required_components"
    target: 100%

    if_incomplete:
      actions:
        - List missing components
        - Generate missing sections
        - Re-run completeness check
```

**6.3. Voice Fidelity Validation (if expert mode)**

```yaml
fidelity_validation:
  step: "Validate instructor voice consistency"

  applies_to:
    - mode=mmos (MMOS persona from brief Section 4.1)
    - mode=custom (custom instructor profile from brief Section 4.1)

  input_sources:
    - instructor_persona (from Step 1.4 output)
    - generated_lessons (from Step 3.1 output)
    - voice_profile (from brief Section 4.1)

  dimensions:
    1_vocabulary:
      weight: 0.30
      metrics:
        - signature_phrases_used: Count instructor's signature phrases in lessons
        - vocabulary_richness: Type-token ratio
        - domain_terminology: Proper use of instructor's jargon

      target:
        - Use 30-60% of signature phrase inventory
        - Match instructor's vocabulary richness baseline

    2_syntax:
      weight: 0.20
      metrics:
        - avg_sentence_length: Compare to instructor baseline
        - sentence_variety: Simple vs. complex sentence mix
        - punctuation_style: Em-dashes, colons, semicolons usage

      tolerance: ±20% of instructor's baseline

    3_style:
      weight: 0.25
      metrics:
        - metaphor_frequency: Count per 1000 words
        - example_types: "research" vs "stories" vs "cases"
        - rhetorical_devices: Questions, repetition, anaphora

      target:
        - 80%+ of examples match instructor's preferred types
        - Metaphor frequency within range

    4_thinking:
      weight: 0.25
      metrics:
        - argumentation_style: Deductive vs. inductive
        - reasoning_depth: Surface vs. deep analysis
        - contrarian_index: Consensus vs. counter-intuitive stance
        - intellectual_humility: Certainty vs. nuance

      target: Match instructor's cognitive patterns

  fidelity_score:
    formula: |
      fidelity = (
        vocabulary_score * 0.30 +
        syntax_score * 0.20 +
        style_score * 0.25 +
        thinking_score * 0.25
      )

    target:
      - MMOS persona: ≥ 0.90 (90%+)
      - Custom profile: ≥ 0.85 (85%+)

    grades:
      - 95-100%: A+ (Exceptional)
      - 90-94%: A (Excellent)
      - 85-89%: B+ (Very Good) ← Minimum for custom
      - 80-84%: B (Good)
      - <80%: FAIL - Regenerate required

  if_below_target:
    actions:
      - Generate fidelity report (weakest dimensions)
      - Identify specific lessons with low scores
      - Regenerate flagged lessons with stronger voice guidance
      - Re-run fidelity validation
```

**6.4. Cognitive Load Balance**

```yaml
cognitive_load_validation:
  step: "Ensure lessons don't overload students"

  input_sources:
    - duration_per_lesson (from brief Section 1.2)
    - knowledge_level (from brief Section 1.2)
    - generated_lessons (from Step 3.1 output)

  principles:
    - Intrinsic load: Complexity of content itself
    - Extraneous load: Poor design, distractions
    - Germane load: Effort toward learning

  metrics:
    1_content_density:
      - Words per lesson
      - Concepts per lesson
      - New terms introduced per lesson

      thresholds:
        microlearning: Max 1500 words, 3 concepts, 5 terms
        standard: Max 2500 words, 5 concepts, 10 terms
        deep_dive: Max 4000 words, 7 concepts, 15 terms

    2_prerequisite_chain:
      - Check: Does lesson assume knowledge not yet taught?
      - Flag: Forward references without explanation
      - Validate: Dependency graph is acyclic

    3_pacing:
      - Check: Is progression too fast? (many concepts, short duration)
      - Check: Is progression too slow? (repetitive, boring)
      - Target: Balanced cognitive load curve

  validation:
    - Analyze each lesson for metrics above
    - Flag lessons exceeding thresholds
    - Prompt: "Lesson 2.3 introduces 12 new terms - too dense. Simplify or split?"

  if_overload_detected:
    actions:
      - Split dense lessons into 2 parts
      - Move advanced concepts to later lessons
      - Add prerequisite refreshers
      - Reduce jargon density
```

**6.5. Duration Realism Check**

```yaml
duration_validation:
  step: "Verify time estimates are achievable"

  input_sources:
    - declared_duration (from brief Section 1.2)
    - generated_lessons (from Step 3.1 output)

  formulas:
    reading_time:
      - Average reading speed: 200-250 words/min
      - Formula: word_count / 225 = minutes

    video_script_time:
      - Average speaking speed: 150 words/min
      - Formula: word_count / 150 = minutes

    exercise_time:
      - Simple exercise: 10-15 min
      - Project work: 30-60 min per phase
      - Assessment: 20-30 min (quiz), 2-4 hours (project)

  calculation:
    for_each_lesson:
      - Count words
      - Identify activities/exercises
      - Calculate: reading_time + activity_time + buffer (20%)
      - Compare to declared duration (from brief)

    tolerance: ±25%

    if_mismatch:
      - Flag: "Lesson 1.2 declared 15 min, calculated 28 min"
      - Action: Adjust declared duration OR trim content

  validation:
    - Sum all lesson durations
    - Compare to course total_hours (from brief Section 1.2)
    - Verify: Within ±15% of target
```

---

### Step 7: Output Generation

**(Implementation from v1.0 - adapted for brief-driven approach)**

**7.1. File Structure Creation**

```yaml
file_structure:
  step: "Generate all course files in organized structure"

  base_path: "outputs/courses/{course-slug}/"

  structure:
    root:
      - README.md               # Course overview
      - course-outline.md       # Complete structure
      - curriculum.yaml         # Structured metadata
      - COURSE-BRIEF.md         # Keep filled brief for reference

    lessons/:
      - 1.1-{lesson-slug}.md    # Flat numbered structure
      - 1.2-{lesson-slug}.md
      - 2.1-{lesson-slug}.md
      - 2.2-{lesson-slug}.md
      # ... all lessons

    assessments/:
      - quiz-module-1.yaml
      - quiz-module-2.yaml
      - final-project.md

    resources/:
      - checklist-{name}.md
      - template-{name}.yaml
      - tool-list.md
      - glossary.md

  file_generation:
    README.md:
      content: |
        # {course_title_from_brief}

        **Instrutor:** {instructor_name_from_brief}
        **Duração:** {total_hours_from_brief} horas
        **Nível:** {knowledge_level_from_brief}
        **Última Atualização:** {timestamp}

        ## Sobre o Curso

        {generated_description_based_on_brief}

        ## O Que Você Vai Aprender

        {learning_objectives_from_brief}

        ## Para Quem É Este Curso

        {icp_summary_from_brief}

        ## Estrutura do Curso

        {modules_list_with_lessons}

        ## Instrutor

        {instructor_bio_from_brief_or_mmos}

        ## Requisitos

        {prerequisites_from_brief}

    curriculum.yaml:
      content: |
        course_id: "{uuid}"
        title: "{course_title_from_brief}"
        slug: "{course-slug}"
        version: "1.0"
        created_at: "{timestamp}"
        generated_from_brief: true

        instructor:
          name: "{instructor_name_from_brief}"
          source: "{MMOS | Custom | Generic}"
          persona_fidelity: {fidelity_score}

        metadata:
          total_duration_hours: {total_hours_from_brief}
          knowledge_level: "{level_from_brief}"
          target_audience: "{icp_summary_from_brief}"
          pedagogical_framework: "{framework_from_brief}"
          teaching_style: "{style_from_brief}"
          quality_reference: "{reference_from_brief}"

        learning_objectives:
          - "{objective_1_from_brief}"
          - "{objective_2_from_brief}"

        modules:
          - module_id: 1
            module_title: "{title}"
            duration_minutes: {duration}
            lessons:
              - lesson_id: "1.1"
                lesson_title: "{title}"
                file_path: "lessons/1.1-{slug}.md"
                duration_minutes: {duration}
                bloom_level: "{level}"

        assessments:
          - type: "quiz"
            module: 1
            file_path: "assessments/quiz-module-1.yaml"

        validation_scores:
          alignment_score: {score}
          completeness_score: {score}
          fidelity_score: {score}
          cognitive_load_balanced: {true/false}
```

**7.2. Database Logging**

```yaml
database_logging:
  step: "Save course to mmos.db for tracking"

  table: "courses"

  schema:
    course_id: "UUID"
    title: "string"
    slug: "string"
    mode: "mmos | custom | generic"
    instructor_name: "string | null"
    instructor_source: "MMOS | Custom | Generic | null"
    persona_fidelity: "float | null"
    target_audience: "text (ICP from brief)"
    learning_objectives: "JSON array (from brief)"
    total_duration_hours: "float (from brief)"
    num_modules: "int (from brief)"
    num_lessons: "int (from brief)"
    knowledge_level: "string (from brief)"
    pedagogical_framework: "string (from brief)"
    teaching_style: "string (from brief)"
    quality_reference: "string (from brief)"
    alignment_score: "float"
    completeness_score: "float"
    file_path: "string"
    created_at: "timestamp"
    updated_at: "timestamp"
    status: "draft | published"
    generated_from_brief: "boolean (true)"

  insert_query: |
    INSERT INTO courses (
      course_id, title, slug, mode, instructor_name, instructor_source,
      persona_fidelity, target_audience, learning_objectives, total_duration_hours,
      num_modules, num_lessons, knowledge_level, pedagogical_framework,
      teaching_style, quality_reference, alignment_score, completeness_score,
      file_path, created_at, status, generated_from_brief
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

  related_tables:
    lessons:
      - lesson_id, course_id, lesson_number, title, duration_minutes, bloom_level, file_path

    assessments:
      - assessment_id, course_id, type, module, file_path
```

**7.3. Generation Summary Report**

```yaml
summary_report:
  step: "Present completion summary to user"

  display:
    header: |
      ✓ Course generated successfully!

      📚 {course_title_from_brief}
      ⏱️  {total_hours} hours | 📖 {num_lessons} lessons | 🎯 {num_modules} modules
      👤 Instructor: {instructor_name_from_brief}

    quality_scores:
      - Alignment: {alignment_score}% ({grade})
      - Completeness: {completeness_score}% ({grade})
      - Voice Fidelity: {fidelity_score}% ({grade}) [if expert mode]
      - Cognitive Load: {"Balanced" or "Needs Review"}

    files_created:
      - README: outputs/courses/{slug}/README.md
      - Outline: outputs/courses/{slug}/course-outline.md
      - Curriculum: outputs/courses/{slug}/curriculum.yaml
      - Lessons: {num_lessons} files in outputs/courses/{slug}/lessons/
      - Assessments: {num_assessments} files in outputs/courses/{slug}/assessments/
      - Resources: {num_resources} files in outputs/courses/{slug}/resources/
      - Brief (reference): outputs/courses/{slug}/COURSE-BRIEF.md

    database:
      - Saved to: mmos.db → courses table
      - Course ID: {uuid}

    next_steps:
      1. "Review generated lessons"
      2. "Test assessments"
      3. "Export to platform" (future feature)
      4. "Refine specific lessons (if needed)"

  user_actions:
    prompt: |
      What would you like to do next?

      1. Preview course (show README + sample lesson)
      2. Review validation report (detailed scores)
      3. Regenerate specific lesson
      4. Export to different format (future)
      5. Approve and close

    validation: User selects action
```

---

## Error Handling

```yaml
error_scenarios:

  - error: "Course not found"
    trigger: "Directory /outputs/courses/{slug}/ doesn't exist"
    recovery:
      1: "Suggest running *generate-course first"
    example_message: |
      ❌ Course '{slug}' not found.

      Did you initialize the course?
      Run: *generate-course

      Or check slug spelling.

  - error: "Brief not found"
    trigger: "COURSE-BRIEF.md missing"
    recovery:
      1: "Check if file was deleted"
      2: "Offer to recreate from template"
    example_message: |
      ❌ Course brief not found: /outputs/courses/{slug}/COURSE-BRIEF.md

      The brief may have been deleted. Options:
      A. Restore from backup
      B. Recreate brief template (will lose any filled data)

  - error: "Brief incomplete"
    trigger: "Required fields missing or placeholder text"
    recovery:
      1: "List missing fields"
      2: "HALT until user completes brief"
    example_message: |
      ❌ Course brief incomplete.

      Missing fields:
      - Section 2: ICP Demographics
      - Section 3: Learning Objectives (need 3-7, found 1)

      Complete the brief and run *continue-course again.

  - error: "Invalid brief format"
    trigger: "YAML parsing error or corrupted file"
    recovery:
      1: "Show parsing error location"
      2: "Offer to validate YAML syntax"
    example_message: |
      ❌ Course brief format error at line 42:

      YAML parsing failed: Invalid indentation

      Please fix the brief syntax and try again.

  - error: "MMOS persona not found"
    trigger: "Mind '{mind_name}' specified but not in outputs/minds/"
    recovery:
      1: "List available MMOS minds"
      2: "Offer custom profile instead"
    example_message: |
      ❌ MMOS mind 'invalid_mind' not found.

      Available minds:
      - alan_nicolas
      - nassim_taleb
      - naval_ravikant

      Update Section 4 in brief or use custom profile.

  - error: "Low alignment score"
    trigger: "Generated course doesn't meet quality thresholds"
    recovery:
      1: "Show validation report"
      2: "Offer to regenerate specific lessons"
    example_message: |
      ⚠️  Alignment score: 78% (Target: 90%+)

      Issues:
      - Objective "Build AI clone" not covered
      - Quiz doesn't test "Monetization"

      Regenerate lessons 2.2, 2.3?

  - error: "Low fidelity score"
    trigger: "Voice fidelity < target (85% custom, 90% MMOS)"
    recovery:
      1: "Show fidelity report"
      2: "Offer to regenerate with stronger voice"
    example_message: |
      ⚠️  Voice Fidelity: 82% (Target: 85%+)

      Weakest: Vocabulary (74%)
      Flagged lessons: 1.2, 2.1, 3.3

      Regenerate with stronger voice? (Y/N)

  - error: "Cognitive overload detected"
    trigger: "Lesson exceeds density thresholds"
    recovery:
      1: "Show flagged lessons"
      2: "Offer to split dense lessons"
    example_message: |
      ⚠️  Cognitive Overload Warning

      Lesson 2.3: 3,200 words (target: <2,500)

      Recommendation: Split into 2.3a + 2.3b

      Proceed? (Y/N)

  - error: "Duration mismatch"
    trigger: "Calculated duration ±25% off declared"
    recovery:
      1: "Show mismatch report"
      2: "Offer to adjust duration"
    example_message: |
      ⚠️  Duration Mismatch

      Lesson 1.2: Declared 15 min, calculated 28 min

      Fix by:
      A. Adjust declared duration
      B. Trim content

  - error: "API rate limit"
    trigger: "Claude API 429 error"
    recovery:
      1: "Wait and retry with exponential backoff"
      2: "Save partial progress"
    retry_logic:
      max_retries: 3
      backoff: [5, 15, 45]  # seconds

  - error: "Generation timeout"
    trigger: "Course generation > 1 hour"
    recovery:
      1: "Show progress"
      2: "Save partial course"
      3: "Offer to resume"
```

---

## Performance Targets

```yaml
performance:
  target_time:
    mini_course (3-5 lessons): "< 15 minutes"
    standard_course (8-15 lessons): "< 30 minutes"
    extended_course (20-40 lessons): "< 60 minutes"

  target_cost:
    mini_course: "~$2-5"
    standard_course: "~$8-15"
    extended_course: "~$20-40"

  breakdown:
    step_1_brief_loading: "< 5 seconds"
    step_2_pedagogical_design: "2-3 minutes"
    step_3_curriculum_generation:
      outline: "1-2 minutes"
      lessons: "1-2 minutes per lesson"
      assessments: "2-3 minutes per assessment"
    step_4_validation: "2-4 minutes"
    step_5_output: "30-60 seconds"
```

---

## Success Metrics

```yaml
success_criteria:

  pedagogical_quality:
    - alignment_score: "≥ 90%"
    - completeness_score: "100%"
    - cognitive_load: "Balanced (no overload flags)"
    - bloom_progression: "Logical (low → high)"

  voice_quality (if expert mode):
    - fidelity_score: "≥ 85% (custom) or ≥ 90% (MMOS)"
    - signature_phrases: "30-60% usage"
    - example_types: "80%+ match instructor style"

  user_satisfaction:
    - requires_editing: "< 20% of content"
    - structure_approval: "User approves outline without major changes"
    - time_savings: "80% reduction vs. manual creation"

  technical:
    - generation_time: "< targets (see Performance)"
    - cost: "< targets (see Performance)"
    - error_rate: "< 5% (95% successful generations)"
```

---

## Example Usage

### Example 1: Generate Course from Filled Brief

```bash
*continue-course clone-ia-express

# System loads and validates brief...
✓ Course brief loaded and validated

# System generates outline...
✓ Course structure generated (3 modules, 9 lessons)

# User preview and approval...
Review course structure:
[Shows outline]

Approve? (Y/N)
> Y

# System generates lessons...
Generating lessons... 1/9 ✓
Generating lessons... 2/9 ✓
...
Generating lessons... 9/9 ✓

# System validates...
✓ Alignment: 94% ✓
✓ Completeness: 100% ✓
✓ Voice Fidelity: 91% ✓
✓ Cognitive Load: Balanced ✓

# System outputs...
✓ Course generated successfully!

📚 Clone IA Express
⏱️  3 hours | 📖 9 lessons | 🎯 3 modules
👤 Instructor: Alan Nicolas

Files created:
- README.md
- course-outline.md
- curriculum.yaml
- 9 lessons in lessons/
- 3 quizzes + 1 project in assessments/
- 4 resources in resources/

Next steps:
1. Review generated lessons
2. Test assessments
3. Launch course
```

---

## Related Tasks

- **`generate-course`** - Initializes course structure and brief template
- **`update-course`** - Modifies existing course (future)
- **`export-course`** - Exports to platform format (future)

---

**Task Version:** 2.2
**Last Updated:** 2025-10-18
**Maintainer:** CreatorOS Team (Sarah - PO)
**Changelog:**
- v2.2 (2025-10-18): **MAJOR UPDATE** - Implemented STORY-3.9: Lesson Generation with GPS + Didática Lendária. Step 5 now uses GPS Framework (Goal → Position → Steps) + 7 Elements for transformational learning. Added LessonGenerator class, GPS validator, DL scorer, voice injection priority (MMOS > Transcripts > Manual), real-time progress tracking, and comprehensive error handling with retry logic.
- v2.1 (2025-10-18): Added Step 4 - Curriculum Approval Checkpoint (STORY-3.8). Mandatory HITL gate that HALTS workflow after curriculum generation to prevent costly mistakes. Renumbered subsequent steps (old Step 4 → Step 6, old Step 5 → Step 7).
- v2.0 (2025-10-17): Created as companion to generate-course v2.0. Implements brief-driven generation (Steps 2-5 from v1.0, adapted to read from COURSE-BRIEF.md instead of interactive elicitation).
- Full implementation: ~2,600 lines (complete pipeline with GPS lesson generation + validation + approval checkpoint)

---

**NOTE:** This is the complete implementation with mandatory approval checkpoint. The task now:

1. ✅ Reads filled COURSE-BRIEF.md
2. ✅ Validates completeness
3. ✅ Loads instructor persona (MMOS or custom)
4. ✅ Applies pedagogical frameworks
5. ✅ Generates course structure and curriculum.yaml
6. ✅ **HALTS at Curriculum Approval Checkpoint (STORY-3.8)**
7. ✅ Waits for explicit user approval before lesson generation
8. ✅ Creates lesson content with voice fidelity (only after approval)
9. ✅ Generates assessments and resources
10. ✅ Validates alignment, completeness, fidelity, cognitive load
11. ✅ Outputs final files and database records
12. ✅ Provides quality scores and next steps

Ready for integration testing and production use.
