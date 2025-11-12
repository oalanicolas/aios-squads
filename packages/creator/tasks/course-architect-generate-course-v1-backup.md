# Task: Generate Course

**Task ID:** generate-course
**Version:** 1.0
**Purpose:** Generate complete online course with pedagogical rigor, customizable structure, and optional expert persona/voice preservation
**Owner:** Course Architect Agent
**Estimated Time:** 15-45 minutes (depending on course size)
**Elicit:** true

---

## Overview

This task implements an end-to-end pipeline for creating high-quality online courses with pedagogical frameworks (Bloom's Taxonomy, ADDIE, Microlearning), ICP-driven design, and optional MMOS personality cloning for instructor voice. Supports three modes: Generic Course, Expert-Led Course, and Legacy Course Upgrade.

**Success Criteria:**
- Course structure pedagogically sound (alignment score 90%+)
- Lessons maintain instructor voice (fidelity 85-90%+ if MMOS persona used)
- Human-in-the-loop workflow with preview/approval checkpoints
- Requires <20% manual editing after generation
- Output: Markdown lessons, YAML curriculum, database logging

---

## Input Parameters

### Required Parameters

1. **mode** (enum, required)
   - Description: Course creation mode
   - Options:
     - `generic` - Standard technical/academic course
     - `expert` - Course with specific instructor persona (MasterClass style)
     - `legacy` - Upgrade existing course with new pedagogy
   - Example: "expert"
   - Validation: Must be one of the three modes

2. **title** (string, required)
   - Description: Course title
   - Example: "Clone IA Express: Construindo Seu Segundo Cérebro com IA"
   - Validation: 10-100 characters

3. **target_audience** (object, required)
   - Description: Ideal Customer Profile (ICP)
   - Fields:
     - demographics: "Age range, profession, experience level"
     - psychographics: "Values, behaviors, pain points"
     - archetypes: Array of relevant personas (optional)
   - Example:
     ```yaml
     demographics: "Professionals 35-45, 15-20 years experience"
     psychographics: "Saturated with promises, seeks substance"
     archetypes: ["Stuck Digital Entrepreneur", "Exhausted Executive"]
     ```

4. **learning_objectives** (array of strings, required)
   - Description: What students will achieve after completing the course
   - Example:
     - "Build functional AI-powered second brain in 3 hours"
     - "Automate 40% of repetitive tasks using AI tools"
     - "Create monetizable AI service in their niche"
   - Validation: 3-7 objectives using action verbs (Bloom's Taxonomy)

5. **duration** (object, required)
   - Description: Course length
   - Fields:
     - total_hours: number (e.g., 3)
     - num_modules: number (e.g., 3)
     - num_lessons: number (e.g., 12)
   - Validation: Realistic ratios (3h = ~6-15 lessons)

### Optional Parameters

6. **knowledge_level** (enum, optional)
   - Description: Target audience knowledge level
   - Options: "beginner" | "intermediate" | "advanced"
   - Default: Infer from ICP during elicitation

7. **instructor** (object, optional - required if mode=expert)
   - Description: Instructor/expert profile
   - Fields:
     - name: "Alan Nicolas"
     - persona_source: "MMOS mind name" OR "custom"
     - authority: "Titles, qualifications, results"
     - beliefs: "What the expert stands for"
     - personality: "Communication style, tone"
     - testimonials: Array of social proof
   - Example: See "Clone IA Express" specification

8. **legacy_path** (string, optional - required if mode=legacy)
   - Description: Path to existing course files to upgrade
   - Example: "/docs/creatoros/courses/clones/legacy"
   - Validation: Directory must exist and contain lessons

9. **pedagogical_framework** (enum, optional)
   - Description: Instructional design framework
   - Options: "blooms" | "addie" | "microlearning" | "kolb" | "backward_design" | "auto"
   - Default: "auto" (recommend based on ICP)

10. **teaching_style** (enum, optional)
    - Description: Instructional tone
    - Options: "conversational" | "academic" | "practical" | "inspirational" | "socratic" | "technical"
    - Default: "conversational"

11. **course_structure** (enum, optional)
    - Description: Hierarchy preference
    - Options: "modules_lessons" | "sections_activities" | "flat_numbered"
    - Default: "flat_numbered" (1.1, 1.2, 2.1, etc.)

12. **content_formats** (array, optional)
    - Description: Lesson delivery formats
    - Options: ["text", "video_script", "audio_script", "slides", "screencast"]
    - Default: ["text"] for MVP
    - Note: All formats maintain instructor voice

13. **company_culture** (object, optional - for corporate courses)
    - Description: Company values, history, culture deck
    - Fields:
      - values: Array of core values
      - history: Brief company story
      - culture_doc_path: Path to culture deck (PDF, MD)
    - Example:
      ```yaml
      values: ["Abundance for others", "Technology for exponential growth"]
      culture_doc_path: "/docs/company/culture-deck.md"
      ```

14. **existing_materials** (array, optional)
    - Description: Pre-existing lessons/materials to integrate
    - Format: Array of file paths
    - Example: ["lessons/intro.md", "lessons/module-1.md"]
    - Note: Task will analyze, standardize, and integrate

15. **quality_references** (enum, optional)
    - Description: Benchmark course style
    - Options: "coursera" | "mindvalley" | "masterclass" | "udemy" | "custom"
    - Default: "coursera" (rigorous + practical balance)

16. **output_path** (string, optional)
    - Description: Where to save course files
    - Default: "outputs/courses/{course-slug}/"

---

## Processing Pipeline

### Step 1: Course Discovery & Mode Selection

**1.1. Interactive Elicitation (Human-in-the-Loop)**

```yaml
elicitation:
  step: "Gather course requirements through conversational prompts"

  questions:
    1_mode_selection:
      prompt: |
        What type of course are you creating?

        A. Generic Course (technical/academic, standard structure)
        B. Expert-Led Course (instructor persona, MasterClass style)
        C. Legacy Course Upgrade (restructure existing course)

      validation: Must select A, B, or C

      if_A_generic:
        next: "2_basic_info"

      if_B_expert:
        next: "2_basic_info" → "2b_expert_profile"

      if_C_legacy:
        next: "2_basic_info" → "2c_legacy_import"

    2_basic_info:
      prompts:
        - "What is the course title?"
        - "Who is the target audience (ICP)? Describe demographics, psychographics."
        - "What are 3-5 learning objectives? (What will students achieve?)"
        - "How long should the course be? (hours, modules, lessons)"
        - "What knowledge level? (beginner/intermediate/advanced or describe ICP)"

      validation:
        - Title: 10-100 chars
        - ICP: Detailed enough to inform design
        - Objectives: Use action verbs (Bloom's)
        - Duration: Realistic ratios

    2b_expert_profile (if mode=expert):
      prompts:
        - "Who is the instructor/expert?"
        - "Do you want to use an MMOS persona or provide custom profile?"

        if_mmos:
          - "Which MMOS mind? (e.g., nassim_taleb, alan_nicolas)"
          - Load persona from outputs/minds/{mind_name}/

        if_custom:
          - "Provide instructor profile (authority, beliefs, personality)"
          - "Any testimonials or social proof to include?"
          - "Upload culture deck or values document? (optional)"

      validation:
        - If MMOS: Mind must exist
        - If custom: Minimum fields (name, authority, personality)

    2c_legacy_import (if mode=legacy):
      prompts:
        - "Path to existing course directory?"
        - "What needs improvement? (structure, pedagogy, voice, all?)"
        - "Keep existing lessons as-is or rewrite with new framework?"

      actions:
        - Validate path exists
        - Scan directory for lessons (*.md, *.txt, *.pdf)
        - Analyze existing structure
        - Present summary: "Found X lessons, Y modules, Z assessments"

      validation:
        - Path must exist
        - Must contain at least 1 lesson file

    3_pedagogical_preferences:
      prompts:
        - "Preferred pedagogical framework? (or 'auto' to recommend based on ICP)"
          Options: Bloom's, ADDIE, Microlearning, Kolb, Backward Design, Auto

        - "Teaching style?"
          Options: Conversational, Academic, Practical, Inspirational, Socratic, Technical

        - "Course structure preference?"
          Options: Modules→Lessons, Sections→Activities, Flat Numbered (1.1, 1.2)

        - "Quality reference? (Which course style to emulate?)"
          Options: Coursera, MindValley, MasterClass, Udemy, Custom

      auto_recommendations:
        if_icp_includes "busy professionals" or "founders":
          framework: "microlearning"
          style: "practical"
          reference: "mindvalley"

        if_icp_includes "corporate" or "onboarding":
          framework: "addie"
          style: "academic"
          reference: "coursera"

        if_icp_includes "transformation" or "personal growth":
          framework: "kolb"
          style: "inspirational"
          reference: "masterclass"

        else:
          framework: "blooms"
          style: "conversational"
          reference: "coursera"

    4_additional_inputs:
      prompts:
        - "Do you have existing materials to integrate? (file paths)"
        - "Company culture/values to include? (for corporate courses)"
        - "Any other requirements or constraints?"

      optional_fields:
        - existing_materials: Array of paths
        - company_culture: Values, history, culture deck
        - custom_notes: Free text

  output:
    course_config:
      mode: "{selected_mode}"
      title: "{course_title}"
      target_audience: "{icp_object}"
      learning_objectives: ["{objective_1}", "{objective_2}", ...]
      duration: {total_hours, num_modules, num_lessons}
      instructor: "{instructor_object or null}"
      legacy_path: "{path or null}"
      pedagogical_framework: "{selected_framework}"
      teaching_style: "{selected_style}"
      course_structure: "{selected_structure}"
      quality_reference: "{selected_reference}"
      existing_materials: ["{paths or null}"]
      company_culture: "{culture_object or null}"
```

**1.2. Load Instructor Persona (if mode=expert)**

```yaml
persona_loading:
  step: "Load MMOS mind or custom instructor profile"

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
    input_validation:
      required_fields:
        - name
        - authority (titles, qualifications, results)
        - personality (communication style)

      optional_fields:
        - beliefs (what instructor stands for)
        - testimonials (social proof)
        - teaching_philosophy

    voice_parameters_mapping:
      - Analyze provided profile text
      - Extract tone, complexity, style markers
      - Generate voice_parameters object similar to MMOS format
      - fidelity_target: 0.85  # Custom personas target 85%+

  output:
    instructor_persona:
      name: "{instructor_name}"
      source: "MMOS Clone" | "Custom Profile"
      voice_parameters: {...}
      style_markers: {...}
      authority: {...}
      beliefs: [...]
      personality: "..."
      fidelity_target: 0.85 | 0.90
```

**1.3. Analyze Legacy Course (if mode=legacy)**

```yaml
legacy_analysis:
  step: "Scan and analyze existing course materials"

  actions:
    1_scan_directory:
      - Read all files in legacy_path
      - Identify file types: MD, TXT, PDF, DOCX, YAML
      - Extract lesson titles, structure, metadata

    2_structure_detection:
      - Detect current hierarchy (modules? sections? flat?)
      - Count: modules, lessons, assessments, resources
      - Identify naming patterns

    3_content_analysis:
      - Calculate word count per lesson
      - Estimate total duration (250 words/min reading)
      - Identify pedagogical elements present:
        - Learning objectives?
        - Prerequisites?
        - Assessments?
        - Examples/exercises?

    4_gaps_identification:
      gaps_found:
        - Missing learning objectives: X lessons
        - No prerequisites defined
        - Inconsistent structure
        - Missing assessments
        - No instructor voice (generic AI text)

    5_improvement_recommendations:
      - "Restructure into {recommended_structure}"
      - "Add learning objectives (Bloom's Taxonomy)"
      - "Inject instructor voice: {instructor_name or 'conversational style'}"
      - "Add {N} assessments/quizzes"
      - "Include resources/supplementary materials"

  user_approval:
    prompt: |
      Analyzed legacy course:
      - Found: {num_lessons} lessons, {num_modules} modules
      - Gaps: {list_of_gaps}
      - Recommendations: {list_of_improvements}

      How to proceed?
      A. Rewrite all lessons with new framework + voice
      B. Keep content, restructure only
      C. Selective rewrite (choose which lessons)

    validation: User must approve before proceeding

  output:
    legacy_analysis_report:
      files_found: [...]
      current_structure: {...}
      content_summary: {...}
      gaps: [...]
      recommendations: [...]
      user_decision: "rewrite_all" | "restructure_only" | "selective"
```

---

### Step 2: Pedagogical Design

**2.1. Framework Application**

```yaml
pedagogical_design:
  step: "Apply selected framework to course structure"

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
        - Map learning objectives to Bloom's levels
        - Ensure progression: start lower (remember/understand), end higher (evaluate/create)
        - Each lesson targets 1-2 levels
        - Assessments match objective levels

      example:
        beginner_course:
          lesson_1: "Remember (terminology, concepts)"
          lesson_2-3: "Understand (explain how it works)"
          lesson_4-5: "Apply (hands-on exercises)"

        advanced_course:
          lesson_1-2: "Apply (refresher + practice)"
          lesson_3-4: "Analyze (case studies, patterns)"
          lesson_5-6: "Evaluate + Create (projects, design)"

    addie:
      description: "5-phase instructional design process"
      phases:
        1_analysis:
          - "Who is the learner? (ICP)"
          - "What is the performance gap?"
          - "What are constraints? (time, resources)"

        2_design:
          - "Learning objectives (measurable)"
          - "Assessment strategy (how to measure success)"
          - "Content structure (modules, lessons)"

        3_development:
          - "Create lessons, materials, resources"
          - "Develop assessments (quizzes, projects)"

        4_implementation:
          - "Delivery plan (self-paced, cohort, hybrid)"
          - "Platform/distribution strategy"

        5_evaluation:
          - "Formative (during course - quizzes)"
          - "Summative (end of course - final project)"
          - "Learner feedback loop"

      application:
        - Follow ADDIE sequence for course design
        - This task handles Analysis, Design, Development
        - Implementation & Evaluation left to user post-generation

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
        - Busy professionals
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

      ideal_for:
        - Transformation programs
        - Coaching courses
        - Personal development

    backward_design:
      description: "Start with end goals, work backwards"
      steps:
        1_identify_outcomes: "What should students do after course?"
        2_determine_assessment: "How will we measure success?"
        3_design_learning_experiences: "What activities lead to outcomes?"

      application:
        - Define final project/capstone first
        - Reverse-engineer: What knowledge/skills needed for project?
        - Build lessons that scaffold toward final outcome

      ideal_for:
        - Technical courses (build a product)
        - Certification programs
        - Skills-based training

  auto_recommendation_logic:
    input: {icp, learning_objectives, duration, quality_reference}

    rules:
      - if duration < 3h AND icp includes "busy": → microlearning
      - if objectives include "build" or "create": → backward_design
      - if objectives include "transformation" or "mindset": → kolb
      - if corporate/onboarding: → addie
      - else: → blooms_taxonomy (default)

    output:
      selected_framework: "{framework_name}"
      justification: "{why this framework fits ICP/objectives}"
```

**2.2. Course Structure Generation**

```yaml
structure_generation:
  step: "Create hierarchical course outline"

  prompt_to_llm: |
    Design a course structure based on:

    Course: {title}
    Target Audience: {icp}
    Learning Objectives: {objectives}
    Duration: {total_hours} hours ({num_modules} modules, {num_lessons} lessons)
    Framework: {pedagogical_framework}
    Style: {teaching_style}
    Reference: {quality_reference}
    Instructor: {instructor_name if expert mode}

    Create a detailed outline with:
    - Module breakdown (themes/topics)
    - Lesson titles (clear, benefit-oriented)
    - Learning objectives per lesson (Bloom's verb)
    - Estimated duration per lesson
    - Prerequisites (if any)
    - Key concepts/activities per lesson
    - Assessment checkpoints

    Follow {framework} principles:
    {framework_specific_guidelines}

    Match {quality_reference} quality standards:
    {reference_specific_guidelines}

  llm_model: "claude-sonnet-4"
  temperature: 0.7
  max_tokens: 3000

  output_example:
    course_outline:
      title: "Clone IA Express: Segundo Cérebro com IA"
      total_duration: "3 hours"
      num_modules: 3
      num_lessons: 9

      modules:
        - module_id: 1
          module_title: "Fundamentos: O Que É Um Segundo Cérebro"
          module_objectives:
            - "Compreender o conceito de segundo cérebro (Bloom: Understand)"
            - "Identificar gaps no seu sistema atual (Bloom: Analyze)"
          duration: "1 hour"

          lessons:
            - lesson_id: "1.1"
              lesson_title: "Por Que Seu Cérebro Não Aguenta Mais"
              learning_objectives:
                - "Reconhecer sinais de sobrecarga cognitiva"
                - "Entender limitações da memória humana"
              duration: "15 min"
              key_concepts:
                - "Sobrecarga cognitiva (cognitive overload)"
                - "Externalização de memória"
                - "Sistema vs. ferramenta"
              activities:
                - "Exercise: Audit current knowledge system"
              prerequisites: "Nenhum"

            - lesson_id: "1.2"
              lesson_title: "O Modelo do Segundo Cérebro"
              learning_objectives:
                - "Explicar os 4 pilares do segundo cérebro"
              duration: "20 min"
              key_concepts:
                - "Captura, Organização, Destilação, Expressão (CODE)"
              activities:
                - "Mapping exercise: Your current workflow"

            - lesson_id: "1.3"
              lesson_title: "IA Como Extensão da Sua Mente"
              learning_objectives:
                - "Diferenciar IA como assistente vs. segundo cérebro"
              duration: "25 min"
              assessment: "Quiz: Fundamentos do Segundo Cérebro"

        - module_id: 2
          module_title: "Construção: Montando Seu Sistema"
          module_objectives:
            - "Aplicar framework CODE (Bloom: Apply)"
            - "Construir primeiro clone IA funcional (Bloom: Create)"
          duration: "1.5 hours"

          lessons:
            - lesson_id: "2.1"
              lesson_title: "Captura: Coletando Seu Conhecimento"
              # ... (continue pattern)

        - module_id: 3
          module_title: "Escala: Monetizando Seu Clone"
          # ... (continue pattern)

      assessments:
        - type: "quiz"
          location: "End of Module 1"
          format: "10 multiple choice + 2 short answer"

        - type: "project"
          location: "End of Module 2"
          format: "Build and submit your AI clone"

        - type: "final"
          location: "End of Module 3"
          format: "Launch plan for monetizable service"

      resources:
        - "Template: Second Brain Setup Checklist"
        - "Tool List: AI Tools Comparison"
        - "Reading: Tiago Forte's BASB Summary"
```

**2.3. Preview & User Approval**

```yaml
preview_approval:
  step: "Present outline to user for confirmation"

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

**3.1. Generate Lesson Content (Per Lesson)**

```yaml
lesson_generation:
  step: "Create full lesson content with instructor voice"

  for_each_lesson:
    inputs:
      - lesson_outline: {lesson_id, title, objectives, key_concepts, duration}
      - instructor_persona: {voice_parameters, style_markers} (if expert mode)
      - pedagogical_framework: {framework_name}
      - teaching_style: {style}

    prompt_to_llm: |
      Write a complete lesson for an online course.

      Lesson Details:
      - ID: {lesson_id}
      - Title: {lesson_title}
      - Learning Objectives: {objectives}
      - Key Concepts: {key_concepts}
      - Duration: {duration} minutes
      - Target Audience: {icp_summary}

      Course Context:
      - Course Title: {course_title}
      - Module: {module_title}
      - Previous Lesson: {prev_lesson_title}
      - Next Lesson: {next_lesson_title}

      Pedagogical Requirements:
      - Framework: {framework} → {framework_guidelines_for_this_lesson}
      - Style: {teaching_style}
      - Bloom's Level: {target_bloom_level}

      Instructor Voice (if expert mode):
      - Name: {instructor_name}
      - Tone: {voice_parameters.tone}
      - Complexity: {voice_parameters.complexity}
      - Signature phrases: {style_markers.signature_phrases}
      - Example types: {style_markers.example_types}
      - Reference sample: {excerpt_from_instructor_writing}

      Structure to follow:
      1. Hook (2-3 sentences - grab attention, state value)
      2. Learning Objectives (explicit list)
      3. Prerequisites Check (if any)
      4. Core Content:
         - Introduction to concept
         - Deep dive / explanation
         - Examples / case studies ({instructor.style_markers.example_types})
         - Common pitfalls to avoid
      5. Practical Application:
         - Exercise or activity
         - Real-world use case
      6. Key Takeaways (3-5 bullet points)
      7. What's Next (transition to next lesson)
      8. Resources (tools, readings, templates)

      Requirements:
      - Word count: {target_word_count} (based on duration)
      - Maintain instructor's voice throughout (if expert mode)
      - Use {teaching_style} tone
      - Include at least 2 examples
      - Make immediately actionable
      - Write for {quality_reference} quality standard

    llm_model: "claude-sonnet-4"
    temperature: 0.7
    max_tokens: 4000

    output_format:
      markdown:
        frontmatter:
          lesson_id: "{lesson_id}"
          lesson_title: "{lesson_title}"
          module: "{module_id}"
          duration: "{duration_minutes}"
          learning_objectives: [...]
          prerequisites: [...]
          bloom_level: "{level}"
          instructor: "{instructor_name}"
          generated_date: "{timestamp}"

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

**3.2. Generate Assessments**

```yaml
assessment_generation:
  step: "Create quizzes, exercises, and final projects"

  types:
    quiz:
      format: "Multiple choice + short answer"
      placement: "End of module"

      prompt_to_llm: |
        Create a quiz for Module {module_id}: {module_title}

        Learning Objectives Covered:
        {list_of_module_objectives}

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
        Design a capstone project for: {course_title}

        Learning Objectives:
        {all_course_objectives}

        Requirements:
        - Project demonstrates mastery of {key_skills}
        - Clear deliverable (artifact student creates)
        - Evaluation rubric (how to grade)
        - Estimated completion time: {hours}
        - Scaffolded steps (break into phases)

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

**3.3. Generate Supplementary Resources**

```yaml
resources_generation:
  step: "Create templates, checklists, tool lists"

  types:
    - checklist: "Step-by-step action items"
    - template: "Fill-in-the-blank worksheet"
    - tool_list: "Curated tools for course topic"
    - reading_list: "Recommended books/articles"
    - glossary: "Key terms and definitions"

  examples:
    checklist:
      title: "Second Brain Setup Checklist"
      items:
        - "[ ] Choose note-taking tool (Notion, Obsidian, Roam)"
        - "[ ] Set up CODE folders (Capture, Organize, Distill, Express)"
        - "[ ] Configure AI integrations (ChatGPT, Claude)"
        - "[ ] Create first AI clone (use template)"
        - "[ ] Test with 1 real task"

    template:
      title: "AI Clone Configuration Template"
      format: "YAML"
      content: |
        clone_name: "___________"
        purpose: "___________"
        voice_parameters:
          tone: "___________"
          complexity: "___________"
        training_data:
          - "___________"
```

---

### Step 4: Pedagogical Validation

**4.1. Alignment Check**

```yaml
alignment_validation:
  step: "Verify objectives ↔ content ↔ assessments alignment"

  method: "Automated + LLM-assisted analysis"

  checks:
    1_objectives_coverage:
      - For each learning objective:
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

      example:
        lesson_1: Remember/Understand (intro concepts)
        lesson_2: Understand/Apply (practice)
        lesson_3: Apply/Analyze (deeper work)
        quiz: Tests Remember + Understand
        project: Tests Apply + Create

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

**4.2. Completeness Check**

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

**4.3. Voice Fidelity Validation (if expert mode)**

```yaml
fidelity_validation:
  step: "Validate instructor voice consistency"

  applies_to:
    - mode=expert with MMOS persona
    - mode=expert with custom instructor profile

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

**4.4. Cognitive Load Balance**

```yaml
cognitive_load_validation:
  step: "Ensure lessons don't overload students"

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

**4.5. Duration Realism Check**

```yaml
duration_validation:
  step: "Verify time estimates are achievable"

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
      - Compare to declared duration

    tolerance: ±25%

    if_mismatch:
      - Flag: "Lesson 1.2 declared 15 min, calculated 28 min"
      - Action: Adjust declared duration OR trim content

  validation:
    - Sum all lesson durations
    - Compare to course total_hours
    - Verify: Within ±15% of target
```

---

### Step 5: Output Generation

**5.1. File Structure Creation**

```yaml
file_structure:
  step: "Generate all course files in organized structure"

  base_path: "outputs/courses/{course-slug}/"

  structure:
    root:
      - README.md               # Course overview
      - course-outline.md       # Complete structure
      - curriculum.yaml         # Structured metadata

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
        # {course_title}

        **Instrutor:** {instructor_name}
        **Duração:** {total_hours} horas
        **Nível:** {knowledge_level}
        **Última Atualização:** {timestamp}

        ## Sobre o Curso

        {course_description}

        ## O Que Você Vai Aprender

        {learning_objectives_list}

        ## Para Quem É Este Curso

        {icp_summary}

        ## Estrutura do Curso

        {modules_list_with_lessons}

        ## Instrutor

        {instructor_bio}

        ## Requisitos

        {prerequisites}

    curriculum.yaml:
      content: |
        course_id: "{uuid}"
        title: "{course_title}"
        slug: "{course-slug}"
        version: "1.0"
        created_at: "{timestamp}"

        instructor:
          name: "{instructor_name}"
          source: "{MMOS | Custom | Generic}"
          persona_fidelity: {fidelity_score}

        metadata:
          total_duration_hours: {total_hours}
          knowledge_level: "{level}"
          target_audience: "{icp_summary}"
          pedagogical_framework: "{framework}"
          teaching_style: "{style}"
          quality_reference: "{reference}"

        learning_objectives:
          - "{objective_1}"
          - "{objective_2}"

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

**5.2. Database Logging**

```yaml
database_logging:
  step: "Save course to mmos.db for tracking"

  table: "courses"

  schema:
    course_id: "UUID"
    title: "string"
    slug: "string"
    mode: "generic | expert | legacy"
    instructor_name: "string | null"
    instructor_source: "MMOS | Custom | Generic | null"
    persona_fidelity: "float | null"
    target_audience: "text (ICP)"
    learning_objectives: "JSON array"
    total_duration_hours: "float"
    num_modules: "int"
    num_lessons: "int"
    knowledge_level: "string"
    pedagogical_framework: "string"
    teaching_style: "string"
    quality_reference: "string"
    alignment_score: "float"
    completeness_score: "float"
    file_path: "string"
    created_at: "timestamp"
    updated_at: "timestamp"
    status: "draft | published"

  insert_query: |
    INSERT INTO courses (
      course_id, title, slug, mode, instructor_name, instructor_source,
      persona_fidelity, target_audience, learning_objectives, total_duration_hours,
      num_modules, num_lessons, knowledge_level, pedagogical_framework,
      teaching_style, quality_reference, alignment_score, completeness_score,
      file_path, created_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

  related_tables:
    lessons:
      - lesson_id, course_id, lesson_number, title, duration_minutes, bloom_level, file_path

    assessments:
      - assessment_id, course_id, type, module, file_path
```

**5.3. Generation Summary Report**

```yaml
summary_report:
  step: "Present completion summary to user"

  display:
    header: |
      ✓ Course generated successfully!

      📚 {course_title}
      ⏱️  {total_hours} hours | 📖 {num_lessons} lessons | 🎯 {num_modules} modules
      👤 Instructor: {instructor_name}

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

  - error: "MMOS persona not found"
    trigger: "Mind '{mind_name}' not found in outputs/minds/"
    recovery:
      1: "List available MMOS minds"
      2: "Offer to use custom instructor profile instead"
      3: "Offer to use generic voice (no persona)"
    example_message: |
      ❌ Mind 'invalid_mind' not found.

      Available MMOS minds:
      - alan_nicolas
      - nassim_taleb
      - naval_ravikant
      [... list all ...]

      Or provide custom instructor profile (authority, personality, voice).

  - error: "Legacy path not found"
    trigger: "Directory not found or empty"
    recovery:
      1: "Verify path with user"
      2: "Offer to create new course instead (mode=generic or expert)"
    example_message: |
      ❌ Legacy course path not found: {path}

      Please verify the path or choose:
      A. Provide different path
      B. Create new course from scratch

  - error: "Low alignment score"
    trigger: "Alignment score < 90%"
    recovery:
      1: "Show alignment report (which objectives missed)"
      2: "Offer to regenerate flagged lessons/assessments"
      3: "Allow user override (acknowledge risk)"
    example_message: |
      ⚠️  Alignment score: 78% (Target: 90%+)

      Issues found:
      - Objective "Build AI clone" not covered in any lesson
      - Quiz doesn't test "Monetization strategies"

      Recommendations:
      1. Regenerate lessons 2.2, 2.3 to cover missing objectives
      2. Add quiz questions for monetization

      Proceed? (Y/N) or Override? (risky)

  - error: "Low fidelity score"
    trigger: "Voice fidelity < target (85% custom, 90% MMOS)"
    recovery:
      1: "Show fidelity report (weakest dimensions)"
      2: "Identify specific lessons with low scores"
      3: "Offer to regenerate with stronger voice guidance"
    example_message: |
      ⚠️  Voice Fidelity: 82% (Target: 85%+)

      Weakest dimension: Vocabulary (score: 74%)
      - Only 1/8 signature phrases used
      - Generic AI language detected

      Flagged lessons: 1.2, 2.1, 3.3

      Regenerate with stronger voice? (Y/N)

  - error: "Cognitive overload detected"
    trigger: "Lesson exceeds density thresholds"
    recovery:
      1: "Show flagged lessons"
      2: "Offer to split dense lessons into 2 parts"
      3: "Offer to simplify/trim content"
    example_message: |
      ⚠️  Cognitive Overload Warning

      Lesson 2.3 "Advanced Clone Techniques":
      - 3,200 words (target: <2,500)
      - 9 new concepts (target: <5)
      - 18 new terms (target: <10)

      Recommendation: Split into 2.3a + 2.3b

      Proceed? (Y/N)

  - error: "Duration mismatch"
    trigger: "Calculated duration ±25% off declared"
    recovery:
      1: "Show calculated vs. declared durations"
      2: "Offer to adjust declared OR trim content"
    example_message: |
      ⚠️  Duration Mismatch

      Lesson 1.2: Declared 15 min, calculated 28 min
      Lesson 2.1: Declared 30 min, calculated 19 min

      Total: Declared 3h, calculated 3.7h

      Fix by:
      A. Adjust declared durations (honest)
      B. Trim content to meet targets

  - error: "Missing instructor profile fields"
    trigger: "Custom profile incomplete"
    recovery:
      1: "Show required fields"
      2: "Offer to proceed with partial profile (lower fidelity)"
      3: "Offer to switch to generic voice"
    example_message: |
      ❌ Instructor profile incomplete

      Missing required fields:
      - Personality/communication style
      - Example writing sample

      Proceed with partial profile? (Fidelity may be lower)
      Or switch to generic voice?

  - error: "API rate limit"
    trigger: "Claude API 429 error"
    recovery:
      1: "Wait and retry with exponential backoff"
      2: "Save partial progress"
      3: "Offer to resume later"
    retry_logic:
      max_retries: 3
      backoff: [5, 15, 45]  # seconds

  - error: "Generation timeout"
    trigger: "Course generation > 1 hour"
    recovery:
      1: "Show progress (modules/lessons completed)"
      2: "Save partial course"
      3: "Offer to resume from checkpoint"
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
    mini_course: "~$2-5 per course"
    standard_course: "~$8-15 per course"
    extended_course: "~$20-40 per course"

  breakdown:
    step_1_discovery: "2-5 minutes (human input)"
    step_2_pedagogical_design: "2-3 minutes"
    step_3_curriculum_generation:
      outline: "1-2 minutes"
      lessons: "1-2 minutes per lesson"
      assessments: "2-3 minutes per assessment"
    step_4_validation: "2-4 minutes"
    step_5_output: "30-60 seconds"

  optimization_strategies:
    - "Use prompt caching for instructor persona (90% cost savings on repeated use)"
    - "Batch lesson generation when possible"
    - "Stream responses for real-time feedback"
    - "Cache framework guidelines and templates"
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

### Example 1: Expert-Led Course (Clone IA Express)

```yaml
command: "*generate-course"

mode: "expert"

inputs:
  title: "Clone IA Express: Construindo Seu Segundo Cérebro com IA"

  target_audience:
    demographics: "Professionals 35-45, 15-20 years experience"
    psychographics: "Saturated with promises, seeks substance and system"
    archetypes:
      - "Stuck Digital Entrepreneur"
      - "Exhausted Executive"
      - "Visionary Technician"

  learning_objectives:
    - "Build functional AI-powered second brain in 3 hours"
    - "Automate 40% of repetitive tasks using AI cloning"
    - "Create monetizable AI service in their niche"

  duration:
    total_hours: 3
    num_modules: 3
    num_lessons: 9

  instructor:
    name: "Alan Nicolas"
    persona_source: "custom"
    authority:
      - "Entrepreneur since 2014"
      - "R$200M+ personal revenue"
      - "20,000+ students"
    beliefs:
      - "Generate abundance for people around you"
      - "Technology for exponential growth"
      - "Prepare world for post-AGI"
    personality: "Visionary, deep, generous, practical"
    testimonials:
      - "Absolute sense of belonging - Lucas"
      - "Alan's transparency and depth - Luiz"

  pedagogical_framework: "microlearning"  # Auto-recommended based on ICP
  teaching_style: "conversational"
  course_structure: "flat_numbered"
  quality_reference: "mindvalley"

  legacy_path: "/docs/creatoros/courses/clones/legacy"

expected_output:
  files:
    - outputs/courses/clone-ia-express/README.md
    - outputs/courses/clone-ia-express/course-outline.md
    - outputs/courses/clone-ia-express/curriculum.yaml
    - outputs/courses/clone-ia-express/lessons/1.1-por-que-seu-cerebro-nao-aguenta.md
    - outputs/courses/clone-ia-express/lessons/1.2-modelo-segundo-cerebro.md
    # ... 9 lessons total
    - outputs/courses/clone-ia-express/assessments/quiz-module-1.yaml
    - outputs/courses/clone-ia-express/assessments/final-project.md
    - outputs/courses/clone-ia-express/resources/checklist-setup.md

  validation_scores:
    alignment_score: 94
    completeness_score: 100
    fidelity_score: 91
    cognitive_load: "Balanced"

  database:
    table: "courses"
    course_id: "uuid-xxx"
    status: "draft"
```

### Example 2: Generic Technical Course

```yaml
command: "*generate-course"

mode: "generic"

inputs:
  title: "Python for Data Science: From Zero to Analysis"

  target_audience:
    demographics: "Aspiring data analysts, 25-35, career switchers"
    psychographics: "Motivated, hands-on learners, seeking career change"

  learning_objectives:
    - "Write Python scripts for data manipulation"
    - "Analyze datasets using Pandas and NumPy"
    - "Create data visualizations with Matplotlib"
    - "Build first data analysis portfolio project"

  duration:
    total_hours: 8
    num_modules: 4
    num_lessons: 16

  knowledge_level: "beginner"
  pedagogical_framework: "backward_design"  # Start with portfolio project
  teaching_style: "practical"
  course_structure: "modules_lessons"
  quality_reference: "coursera"

expected_output:
  files:
    - outputs/courses/python-data-science/README.md
    - outputs/courses/python-data-science/curriculum.yaml
    - outputs/courses/python-data-science/lessons/... (16 lessons)
    - outputs/courses/python-data-science/assessments/... (4 quizzes + 1 project)

  validation_scores:
    alignment_score: 92
    completeness_score: 100
    fidelity_score: N/A (no instructor persona)
```

### Example 3: Corporate Onboarding (Legacy Upgrade)

```yaml
command: "*generate-course"

mode: "legacy"

inputs:
  title: "Acme Inc Engineering Onboarding"

  legacy_path: "/docs/corporate/acme-onboarding-v1"

  target_audience:
    demographics: "New hires, engineers, all levels"
    psychographics: "Eager to understand company culture and tech stack"

  learning_objectives:
    - "Understand Acme's engineering values and processes"
    - "Set up development environment"
    - "Deploy first pull request"

  company_culture:
    values:
      - "Ship fast, iterate faster"
      - "Psychological safety first"
      - "Customer obsession"
    culture_doc_path: "/docs/corporate/acme-culture-deck.pdf"

  pedagogical_framework: "addie"
  teaching_style: "professional"

legacy_analysis:
  found:
    lessons: 12
    modules: 3
    assessments: 0  # Missing!

  gaps:
    - "No learning objectives"
    - "Missing assessments"
    - "Inconsistent structure"
    - "Generic voice (no company culture)"

  user_decision: "rewrite_all"

expected_output:
  files:
    - outputs/courses/acme-onboarding-v2/... (restructured)

  improvements:
    - "Added learning objectives (Bloom's)"
    - "Injected company culture/values throughout"
    - "Added 3 quizzes + 1 capstone project"
    - "Standardized structure (ADDIE framework)"
```

---

**Task Version:** 1.0
**Last Updated:** 2025-10-15
**Maintainer:** CreatorOS Team (Sarah - PO)
