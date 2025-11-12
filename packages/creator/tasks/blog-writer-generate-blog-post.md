---
task_name: "generate-blog-post"
task_version: "1.0"
required_agent_version: ">=1.0"
description: "Generate complete SEO-optimized blog post (1500-2500 words) with persona voice preservation"
last_updated: "2025-10-18"
---

# Task: Generate Blog Post

**Task ID:** generate-blog-post
**Version:** 1.0
**Purpose:** Generate complete SEO-optimized blog post (1500-2500 words) with persona voice preservation
**Owner:** Blog Writer Agent
**Estimated Time:** 5-10 minutes
**Elicit:** true

---

## Overview

This task implements the complete end-to-end pipeline for generating authentic, SEO-optimized blog posts with 85-95% voice fidelity to a specified persona (MMOS clone or custom). The pipeline includes persona loading, research & outline generation, content creation, SEO optimization, and fidelity validation.

**Success Criteria:**
- Blog post 1500-2500 words
- Fidelity score 85%+ (custom persona) or 90%+ (MMOS clone)
- SEO score 8/10 (Yoast-equivalent)
- Readability Flesch-Kincaid 60+
- User would publish without major edits

---

## Input Parameters

### Required Parameters

1. **topic** (string, required)
   - Description: Main topic or title for the blog post
   - Example: "Deep work strategies for founders"
   - Validation: Must be 10-200 characters

2. **persona** (string or object, required)
   - Description: MMOS clone name OR path to custom persona JSON
   - Examples:
     - MMOS: "nassim_taleb" or "cal_newport"
     - Custom: "path/to/custom-persona.json"
   - Validation: Must be valid MMOS mind name or valid JSON file path

### Optional Parameters

3. **keywords** (array of strings, optional)
   - Description: SEO keywords (3-5 recommended)
   - Example: ["deep work", "focus", "productivity", "founder productivity"]
   - Default: Auto-extract from topic
   - Validation: Max 10 keywords

4. **audience** (object, optional)
   - Description: Target reader profile
   - Fields:
     - demographics: "Tech founders, 25-40, building startups"
     - knowledge_level: "beginner" | "intermediate" | "advanced"
     - desired_outcome: "What should they do after reading?"
   - Default: General audience, intermediate knowledge

5. **length** (number, optional)
   - Description: Target word count
   - Example: 2000
   - Default: 2000
   - Validation: 1500-2500 (SEO sweet spot)

6. **framework** (string, optional)
   - Description: Storytelling framework to apply
   - Options: "hero_journey" | "problem_solution" | "aida" | "pas" | "auto"
   - Default: "auto" (choose based on topic)

7. **output_path** (string, optional)
   - Description: Where to save generated blog post
   - Default: "creator-os-workspace/blog-posts/{slug}-{timestamp}.md"

---

## Processing Pipeline

### Step 1: Input Validation & Persona Loading

**1.1. Validate Inputs**

```javascript
// Pseudo-code for validation logic
function validateInputs(params) {
  // Check required fields
  if (!params.topic || params.topic.length < 10 || params.topic.length > 200) {
    throw new Error("Topic must be 10-200 characters");
  }

  if (!params.persona) {
    throw new Error("Persona is required (MMOS mind name or custom JSON path)");
  }

  // Validate optional fields
  if (params.keywords && params.keywords.length > 10) {
    throw new Error("Maximum 10 keywords allowed");
  }

  if (params.length && (params.length < 1500 || params.length > 2500)) {
    throw new Error("Length must be between 1500-2500 words");
  }

  return true;
}
```

**1.2. Load Persona (MMOS Clone)**

If persona is MMOS mind name (e.g., "nassim_taleb"):

```yaml
persona_loading:
  step: "Load MMOS Mind Mapper clone as content persona"

  paths:
    personality_profile: "outputs/minds/{mind_name}/synthesis/personality-profile.json"
    system_prompt: "outputs/minds/{mind_name}/synthesis/system-prompt-generalista.md"
    cognitive_spec: "outputs/minds/{mind_name}/analysis/cognitive-spec.yaml"

  extraction:
    from_personality_profile:
      - cognitive_preferences.thinking_style
      - cognitive_preferences.communication_style
      - cognitive_preferences.depth_of_analysis
      - traits.openness
      - traits.conscientiousness
      - traits.extraversion

    from_system_prompt:
      - voice_markers: "Extract signature phrases, vocabulary patterns"
      - example_types: "Identify preferred examples (stories vs research vs cases)"
      - tone: "Extract overall tone (formal, casual, provocative, etc.)"
      - complexity: "Analyze sentence structure and vocabulary level"

    from_cognitive_spec:
      - layer_5_values: "Core values and principles"
      - layer_6_obsessions: "Intellectual obsessions and recurring themes"
      - layer_8_paradoxes: "Productive paradoxes (what makes voice unique)"

  voice_parameters_mapping:
    tone:
      - if communication_style == "direct": "professional"
      - if communication_style == "provocative": "contrarian"
      - if communication_style == "empathetic": "conversational"

    complexity:
      - if depth_of_analysis == "deep": "high (graduate level)"
      - if depth_of_analysis == "moderate": "moderate (college level)"
      - if depth_of_analysis == "surface": "simple (high school level)"

    sentence_length:
      - if thinking_style == "analytical": "medium-long (20-30 words)"
      - if thinking_style == "intuitive": "short-medium (10-20 words)"

    vocabulary_level:
      - Extract from system_prompt: Look for jargon, technical terms, sophistication

    signature_phrases:
      - Extract from system_prompt: Recurring phrases used 3+ times
      - Examples: "skin in the game", "via negativa", "antifragile" (Taleb)

    example_types:
      - Analyze cognitive_spec Layer 3 (Knowledge): "Research-heavy" vs "Story-heavy"

  output:
    persona_object:
      name: "{mind_name}"
      source: "MMOS Clone"
      voice_parameters:
        tone: "contrarian"
        complexity: "high"
        sentence_length: "medium-long"
        vocabulary_level: "advanced"
        formality: "semi-formal"
        humor_level: "occasional"
        emotional_intensity: "moderate"
      style_markers:
        metaphor_frequency: "frequent"
        example_types: ["historical examples", "probability thinking", "case studies"]
        signature_phrases: ["skin in the game", "antifragile", "via negativa"]
        preferred_transitions: ["however", "moreover", "consider"]
        paragraph_style: "medium-length (3-5 sentences)"
      fidelity_baseline:
        target_score: 0.90  # MMOS clones should achieve 90%+
```

**1.3. Load Persona (Custom JSON)**

If persona is file path (e.g., "custom-persona.json"):

```yaml
persona_loading:
  step: "Load custom persona from JSON file"

  path: "{provided_path}"

  validation:
    - Check file exists
    - Validate JSON schema
    - Required fields: name, voice_parameters, style_markers

  output:
    persona_object:
      name: "{from JSON}"
      source: "Custom Persona"
      voice_parameters: "{from JSON}"
      style_markers: "{from JSON}"
      fidelity_baseline:
        target_score: 0.85  # Custom personas target 85%+
```

**1.4. Error Handling**

```yaml
error_scenarios:
  - scenario: "MMOS mind not found"
    error: "Mind '{mind_name}' not found in outputs/minds/"
    action: "List available minds, ask user to select"

  - scenario: "Custom persona file not found"
    error: "Persona file not found: {path}"
    action: "Ask user to provide valid path or use MMOS clone"

  - scenario: "Invalid persona JSON"
    error: "Persona JSON is invalid: {validation_errors}"
    action: "Show validation errors, ask user to fix JSON"

  - scenario: "Missing required persona fields"
    error: "Persona missing required fields: {missing_fields}"
    action: "Show required fields, ask user to update persona"
```

---

### Step 2: Research & Outline Generation

**2.1. Keyword Research**

```yaml
keyword_research:
  step: "Extract or generate SEO keywords"

  if_keywords_provided:
    - Use provided keywords array
    - Validate: 3-5 keywords optimal
    - primary_keyword: keywords[0]
    - secondary_keywords: keywords[1..4]

  if_keywords_not_provided:
    - Extract from topic using NLP
    - Example topic: "Deep work strategies for founders"
    - Extracted keywords: ["deep work", "focus strategies", "founder productivity"]

  keyword_analysis:
    primary_keyword:
      usage: "1-2% density (20-40 times in 2000 words)"
      placement:
        - Title (beginning)
        - First 100 words
        - 2-3 H2 headings
        - Meta description
        - URL slug

    secondary_keywords:
      usage: "0.5-1% density each (10-20 times in 2000 words)"
      placement:
        - H2/H3 headings
        - Naturally throughout body
        - Image alt text

  output:
    keywords_object:
      primary: "deep work"
      secondary: ["focus strategies", "founder productivity", "distraction management"]
      lsi_keywords: ["concentration", "attention", "cognitive performance"]  # Auto-generated
```

**2.2. Outline Generation**

```yaml
outline_generation:
  step: "Create blog post structure (H2 headings + key points)"

  prompt_to_llm: |
    Generate a blog post outline for the following:

    Topic: {topic}
    Persona: {persona.name}
    Primary Keyword: {primary_keyword}
    Audience: {audience.demographics}
    Knowledge Level: {audience.knowledge_level}
    Desired Outcome: {audience.desired_outcome}
    Target Length: {length} words
    Framework: {framework}

    Create an outline with:
    - Compelling title (50-60 chars, primary keyword at start)
    - Meta description (150-160 chars, keywords + value prop)
    - 3-5 H2 section headings (include keywords in 2-3)
    - 2-3 key points per section
    - Conclusion approach
    - CTA based on desired outcome

    Match the voice of {persona.name}:
    - Tone: {persona.voice_parameters.tone}
    - Complexity: {persona.voice_parameters.complexity}
    - Example types: {persona.style_markers.example_types}

  llm_model: "claude-sonnet-4"
  temperature: 0.7
  max_tokens: 1500

  output_example:
    title: "Deep Work for Founders: How to Build Without Burning Out"
    meta_description: "Master deep work strategies to boost founder productivity. Learn focus techniques, distraction management, and cognitive performance optimization."
    sections:
      - h2: "Why Shallow Work Kills Startups"
        key_points:
          - "Research: 23 min to refocus after distraction (Microsoft study)"
          - "Founders average 50+ interruptions/day = no deep focus"
          - "Shallow work feels productive but doesn't build companies"

      - h2: "The Deep Work Framework: 4 Rules for Founders"
        key_points:
          - "Rule 1: Work Deeply (time blocking, rituals)"
          - "Rule 2: Embrace Boredom (attention training)"
          - "Rule 3: Quit Social Media (attention diet)"
          - "Rule 4: Drain the Shallows (eliminate low-value tasks)"

      - h2: "Tools That Enable Deep Work"
        key_points:
          - "Time blocking apps (Clockwise, Reclaim)"
          - "Distraction blockers (Freedom, Cold Turkey)"
          - "Environment design (noise-canceling, dedicated space)"

      - h2: "Common Pitfalls and How to Avoid Them"
        key_points:
          - "Pitfall 1: Confusing busy with productive"
          - "Pitfall 2: No boundaries (always available)"
          - "Pitfall 3: Multitasking (attention residue)"

    conclusion_approach: "summary_action"
    cta: "Subscribe to newsletter for weekly deep work tips"
```

---

### Step 3: Content Generation

**3.1. Generate Hook (First Paragraph)**

```yaml
hook_generation:
  step: "Write compelling first paragraph (100-150 words)"

  hook_patterns:
    - question: "Start with compelling question"
    - statistic: "Open with surprising data"
    - story: "Begin with personal anecdote"
    - controversy: "Challenge common belief"
    - problem: "Identify pain point"

  pattern_selection:
    - if persona.style_markers.example_types includes "research": Use "statistic"
    - if persona.style_markers.example_types includes "personal stories": Use "story"
    - if persona.voice_parameters.tone == "contrarian": Use "controversy"
    - else: Use "problem" (safest default)

  prompt_to_llm: |
    Write a compelling hook (first paragraph) for this blog post.

    Topic: {topic}
    Title: {outline.title}
    First Section: {outline.sections[0].h2}
    Hook Pattern: {selected_pattern}

    Requirements:
    - 100-150 words
    - Include primary keyword "{primary_keyword}" naturally
    - Match {persona.name}'s voice:
      - Tone: {persona.voice_parameters.tone}
      - Sentence length: {persona.voice_parameters.sentence_length}
      - Use signature phrases if appropriate: {persona.style_markers.signature_phrases}
    - Create curiosity (make reader want to continue)
    - Establish value proposition (why they should read this)

    Example of {persona.name}'s voice:
    {sample_from_system_prompt}

  llm_model: "claude-sonnet-4"
  temperature: 0.8  # Higher for creativity in hooks
  max_tokens: 300

  output_example: |
    Most founders are busy, but not productive. They spend 60-80 hours per week in
    a state of perpetual distraction—Slack, email, meetings, "quick calls"—while
    the work that actually builds companies (strategy, product design, customer
    research) gets crammed into whatever cognitive scraps remain. This is shallow
    work, and it's killing your startup. The solution isn't working harder or longer.
    It's deep work: the ability to focus without distraction on cognitively demanding
    tasks. Here's how to master it.
```

**3.2. Generate Body Sections**

```yaml
body_generation:
  step: "Write 3-5 main sections (200-400 words each)"

  for_each_section:
    prompt_to_llm: |
      Write the section for: "{section.h2}"

      Key points to cover:
      {section.key_points}

      Requirements:
      - 200-400 words
      - Include 1-2 examples (type: {persona.style_markers.example_types})
      - Use secondary keywords naturally: {secondary_keywords}
      - Add 1-2 H3 subheadings if needed (break up long sections)
      - Match {persona.name}'s voice:
        - Complexity: {persona.voice_parameters.complexity}
        - Metaphor frequency: {persona.style_markers.metaphor_frequency}
        - Signature phrases: {persona.style_markers.signature_phrases}
      - Clear transitions from previous section
      - End with transition to next section

      Example of {persona.name}'s analysis style:
      {sample_from_system_prompt}

    llm_model: "claude-sonnet-4"
    temperature: 0.7
    max_tokens: 800

  storytelling_framework_application:
    if_framework_hero_journey:
      - Section 1: "Ordinary World + Call to Adventure"
      - Section 2-3: "Meeting Mentor + Tests"
      - Section 4: "Reward + Return"

    if_framework_problem_solution:
      - Section 1: "Problem (identify pain)"
      - Section 2-3: "Solution (how to fix)"
      - Section 4: "Impact (results)"

    if_framework_aida:
      - Section 1: "Attention (hook) + Interest"
      - Section 2-3: "Desire (benefits, social proof)"
      - Section 4: "Action (CTA preview)"
```

**3.3. Generate Conclusion**

```yaml
conclusion_generation:
  step: "Write conclusion (100-150 words)"

  conclusion_patterns:
    summary_action: "Recap key points + clear next step"
    question_answer: "Pose question, provide answer"
    story_callback: "Return to intro story with resolution"
    future_oriented: "What's next for reader/industry"

  prompt_to_llm: |
    Write the conclusion for this blog post.

    Topic: {topic}
    Key Points Covered: {list_of_h2_headings}
    Desired Outcome: {audience.desired_outcome}
    Pattern: {outline.conclusion_approach}

    Requirements:
    - 100-150 words
    - Summarize key takeaways (3-5 points)
    - Reinforce value delivered
    - Smooth transition to CTA
    - Match {persona.name}'s voice (conclusive, actionable)

  llm_model: "claude-sonnet-4"
  temperature: 0.6  # Lower for clarity in conclusions
  max_tokens: 300
```

**3.4. Generate Call-to-Action**

```yaml
cta_generation:
  step: "Write compelling CTA (50-100 words)"

  cta_types:
    newsletter: "Subscribe for weekly tips"
    product: "Try our product"
    consultation: "Book a call"
    download: "Get the template/guide"
    share: "Share this post"

  prompt_to_llm: |
    Write a call-to-action for this blog post.

    Desired Outcome: {audience.desired_outcome}
    CTA Type: {outline.cta}

    Requirements:
    - 50-100 words
    - Single, clear action
    - Benefit-oriented (what they get)
    - Create urgency or incentive if appropriate
    - Remove friction (make it easy)
    - Match {persona.name}'s voice (not pushy, value-first)

  llm_model: "claude-sonnet-4"
  temperature: 0.7
  max_tokens: 200

  output_example: |
    Want weekly deep work strategies delivered to your inbox? Join 10,000+ founders
    who get my newsletter every Monday. No fluff, just actionable tactics you can
    implement this week. [Subscribe here - it's free]
```

**3.5. Assemble Complete Blog Post**

```yaml
assembly:
  step: "Combine all sections into final markdown"

  template: |
    ---
    title: "{outline.title}"
    meta_description: "{outline.meta_description}"
    keywords: [{keywords_array}]
    author: "{user_name or 'CreatorOS'}"
    persona: "{persona.name}"
    persona_source: "{persona.source}"
    generated_date: "{timestamp}"
    word_count: {actual_word_count}
    target_word_count: {length}
    fidelity_score: {to_be_calculated_in_step_5}
    seo_score: {to_be_calculated_in_step_4}
    readability_score: {to_be_calculated_in_step_4}
    ---

    # {outline.title}

    {hook}

    ---

    ## {section_1.h2}

    {section_1.content}

    ---

    ## {section_2.h2}

    {section_2.content}

    ---

    [... additional sections ...]

    ---

    ## Conclusion

    {conclusion}

    ---

    ## {cta_heading or "What's Next?"}

    {cta}

    ---

    **Related Posts:**
    - {related_1 or "[To be added]"}
    - {related_2 or "[To be added]"}
    - {related_3 or "[To be added]"}

    ---

    *Generated with CreatorOS - The Operating System for Digital Creators*
    *Persona: {persona.name} ({persona.source}) | Fidelity: {fidelity_score}% | SEO: {seo_score}/10 | Readability: {readability_score}*
```

---

### Step 4: SEO Optimization

**4.1. Keyword Density Check**

```yaml
keyword_density:
  step: "Validate keyword usage meets SEO targets"

  analysis:
    total_words: {word_count}

    primary_keyword:
      target_density: "1-2% (20-40 occurrences in 2000 words)"
      actual_count: {count_occurrences(primary_keyword, blog_content)}
      actual_density: {actual_count / total_words * 100}
      status: "PASS" if 1% <= actual_density <= 2% else "ADJUST"

    secondary_keywords:
      for_each_keyword:
        target_density: "0.5-1% (10-20 occurrences in 2000 words)"
        actual_count: {count_occurrences(keyword, blog_content)}
        actual_density: {actual_count / total_words * 100}
        status: "PASS" if 0.5% <= actual_density <= 1% else "ADJUST"

  if_status_adjust:
    action: "Regenerate sections with keyword guidance to meet density targets"
```

**4.2. Heading Structure Validation**

```yaml
heading_structure:
  step: "Ensure proper heading hierarchy and keyword usage"

  validation:
    h1_title:
      count: 1  # Exactly one H1
      keyword_check: "Primary keyword in first 5 words"
      length_check: "50-60 characters"

    h2_headings:
      count: "3-5 headings"
      keyword_check: "Primary or secondary keyword in 2-3 headings"
      natural: "Keywords appear naturally (not stuffed)"

    h3_subheadings:
      count: "Optional (2-3 per H2 section if needed)"
      usage: "Break up sections >400 words"

  if_validation_fails:
    action: "Adjust headings to meet SEO best practices"
```

**4.3. Readability Analysis**

```yaml
readability:
  step: "Calculate Flesch-Kincaid Reading Ease and Grade Level"

  flesch_kincaid_reading_ease:
    formula: "206.835 - 1.015 * (total_words / total_sentences) - 84.6 * (total_syllables / total_words)"
    target: "60-70 (Standard - 8-9th grade)"
    interpretation:
      - "90-100: Very Easy (5th grade)"
      - "80-89: Easy (6th grade)"
      - "70-79: Fairly Easy (7th grade)"
      - "60-69: Standard (8-9th grade) ← TARGET"
      - "50-59: Fairly Difficult (10-12th grade)"
      - "30-49: Difficult (College)"

  flesch_kincaid_grade_level:
    formula: "0.39 * (total_words / total_sentences) + 11.8 * (total_syllables / total_words) - 15.59"
    target: "8-10"

  readability_improvements:
    if_score_below_60:
      - "Shorten sentences (target 15-20 words average)"
      - "Replace complex words with simpler alternatives"
      - "Break long paragraphs (3-5 sentences max)"
      - "Add bullet points and lists"
      - "Use active voice instead of passive"
```

**4.4. Internal/External Link Suggestions**

```yaml
link_suggestions:
  step: "Recommend internal and external links for SEO"

  internal_links:
    target: "3-5 links to related content"
    strategy:
      - "Link to other blog posts on similar topics"
      - "Link to pillar content pages"
      - "Use descriptive anchor text (not 'click here')"

    auto_suggest:
      - "Search existing content for related keywords"
      - "Suggest anchor text based on context"

  external_links:
    target: "2-3 authoritative sources"
    strategy:
      - "Link to research studies cited"
      - "Link to industry leaders (thought leadership)"
      - "Use rel='nofollow' for untrusted sources"

    auto_suggest:
      - "Identify claims that need sources"
      - "Suggest high-authority domains (edu, gov, major publications)"
```

**4.5. SEO Score Calculation**

```yaml
seo_scoring:
  step: "Generate SEO score (0-10 scale, target 8+)"

  criteria:
    - title_optimized: "Primary keyword in first 5 words, 50-60 chars (10 points)"
    - meta_description: "Keywords present, 150-160 chars, CTA included (10 points)"
    - url_slug: "Primary keyword, lowercase, hyphens (5 points)"
    - keyword_density: "Primary 1-2%, secondary 0.5-1% (15 points)"
    - heading_structure: "1 H1, 3-5 H2s, keywords in 2-3 headings (15 points)"
    - content_length: "1500+ words (10 points)"
    - readability: "Flesch-Kincaid 60+ (10 points)"
    - internal_links: "3-5 links (10 points)"
    - external_links: "2-3 authoritative (10 points)"
    - image_alt_text: "Descriptive with keywords (5 points)"

  total_points: 100

  seo_score_calculation:
    score_out_of_10: (total_points_earned / 100) * 10

  grade:
    - "9-10: Excellent"
    - "8-9: Very Good ← TARGET"
    - "7-8: Good"
    - "6-7: Fair"
    - "<6: Needs Improvement"
```

---

### Step 5: Fidelity Validation

**5.1. Voice Consistency Analysis (4 Dimensions)**

```yaml
fidelity_validation:
  step: "Validate voice consistency against persona baseline"

  dimensions:

    1_vocabulary:
      weight: 0.30  # 30% of overall score
      metrics:
        signature_words_used:
          definition: "Count of persona signature words/phrases in generated content"
          calculation: |
            signature_phrases = persona.style_markers.signature_phrases
            count = 0
            for phrase in signature_phrases:
              count += occurrences(phrase, blog_content)
          expected: "Use 2-3 signature phrases (30-60% of signature set)"

        vocabulary_richness:
          definition: "Type-token ratio (unique words / total words)"
          calculation: "unique_words / total_words"
          target: "0.4-0.6 (varies by persona complexity)"

        domain_terminology:
          definition: "Proper use of domain-specific jargon"
          calculation: "Manual review or LLM scoring"
          target: "Match persona's domain expertise level"

        word_choice_alignment:
          definition: "Use of persona's preferred words vs generic AI words"
          calculation: "Compare word frequency distribution to persona baseline"
          target: "80%+ overlap in top 100 content words"

      scoring:
        vocabulary_score = (
          signature_words_score * 0.3 +
          vocabulary_richness_score * 0.2 +
          domain_terminology_score * 0.25 +
          word_choice_alignment_score * 0.25
        )

    2_syntax:
      weight: 0.20  # 20% of overall score
      metrics:
        avg_sentence_length:
          calculation: "total_words / total_sentences"
          persona_baseline: "{from persona analysis}"
          tolerance: "±20% of baseline"
          example: "If persona avg is 20 words, target 16-24"

        sentence_variety:
          definition: "Mix of simple/compound/complex sentences"
          calculation: "Count sentence types, compare to persona distribution"
          target: "Match persona's variety pattern"

        clause_complexity:
          definition: "Subordinate clauses per sentence"
          calculation: "Count clauses, divide by sentences"
          target: "Match persona's complexity level"

        punctuation_style:
          definition: "Usage of colons, semicolons, dashes, parentheses"
          calculation: "Compare punctuation frequency to persona baseline"
          target: "Match persona's stylistic preferences"

      scoring:
        syntax_score = (
          sentence_length_score * 0.4 +
          sentence_variety_score * 0.3 +
          clause_complexity_score * 0.2 +
          punctuation_style_score * 0.1
        )

    3_style:
      weight: 0.25  # 25% of overall score
      metrics:
        metaphor_frequency:
          definition: "Metaphors and analogies per 1000 words"
          calculation: "Count metaphors (LLM-assisted), normalize to 1000 words"
          persona_baseline: "{from persona.style_markers.metaphor_frequency}"
          target: "Match baseline (rare: 0-2, occasional: 3-6, frequent: 7+)"

        example_types_match:
          definition: "Use of persona's preferred example types"
          calculation: |
            persona_examples = persona.style_markers.example_types
            blog_examples = extract_examples(blog_content)
            match_rate = count_matches(persona_examples, blog_examples) / len(blog_examples)
          target: "80%+ of examples match persona's preferred types"

        rhetorical_devices:
          definition: "Use of questions, repetition, parallelism, anaphora"
          calculation: "Count rhetorical devices, compare to persona baseline"
          target: "Match persona's rhetorical style"

        paragraph_structure:
          definition: "Paragraph length and cohesion patterns"
          calculation: "Avg sentences per paragraph, compare to baseline"
          target: "Match persona's paragraph style"

      scoring:
        style_score = (
          metaphor_frequency_score * 0.3 +
          example_types_score * 0.35 +
          rhetorical_devices_score * 0.2 +
          paragraph_structure_score * 0.15
        )

    4_thinking:
      weight: 0.25  # 25% of overall score
      metrics:
        argumentation_style:
          definition: "Deductive vs inductive vs abductive reasoning"
          calculation: "LLM-assisted analysis of argument structure"
          persona_baseline: "{from cognitive_spec Layer 2}"
          target: "Match persona's reasoning style"

        reasoning_depth:
          definition: "Surface vs moderate vs deep analysis"
          calculation: "Analyze depth of explanations and causal chains"
          persona_baseline: "{from persona.voice_parameters.complexity}"
          target: "Match persona's depth of analysis"

        contrarian_index:
          definition: "Consensus vs contrarian stance"
          calculation: "Analyze claims: conventional vs counter-intuitive"
          persona_baseline: "{from cognitive_spec Layer 8 paradoxes}"
          target: "Match persona's contrarian tendency"

        intellectual_humility:
          definition: "Certainty vs nuance and epistemic humility"
          calculation: "Count hedging words, qualifiers, acknowledgments of uncertainty"
          persona_baseline: "{from persona thinking_style}"
          target: "Match persona's epistemic stance"

        first_principles:
          definition: "Reasoning from fundamentals vs surface heuristics"
          calculation: "Analyze argument foundations and causal chains"
          persona_baseline: "{from cognitive_spec Layer 1-2}"
          target: "Match persona's reasoning approach"

      scoring:
        thinking_score = (
          argumentation_style_score * 0.25 +
          reasoning_depth_score * 0.25 +
          contrarian_index_score * 0.2 +
          intellectual_humility_score * 0.15 +
          first_principles_score * 0.15
        )

  overall_fidelity_calculation:
    fidelity_score = (
      vocabulary_score * 0.30 +
      syntax_score * 0.20 +
      style_score * 0.25 +
      thinking_score * 0.25
    )

    grade:
      - "95-100%: A+ (Exceptional - indistinguishable from persona)"
      - "90-94%: A (Excellent - strong match)"
      - "85-89%: B+ (Very Good - passes threshold)"
      - "80-84%: B (Good - minor deviations)"
      - "75-79%: C (Fair - noticeable differences)"
      - "<75%: F (Fail - regenerate required)"

    status:
      - if fidelity_score >= 0.85 (custom) or 0.90 (MMOS): "PASS"
      - else: "FAIL - REGENERATE"
```

**5.2. Fidelity Report Generation**

```yaml
fidelity_report:
  step: "Generate detailed fidelity report using template"

  template_path: "expansion-packs/creator-os/templates/fidelity-report.yaml"

  output_path: "creator-os-workspace/fidelity-reports/{slug}-{timestamp}.yaml"

  populated_fields:
    report_metadata:
      generation_id: "{unique_id}"
      persona_name: "{persona.name}"
      content_type: "blog_post"
      generated_date: "{timestamp}"
      word_count: {actual_word_count}
      validator_version: "1.0.0"

    overall_fidelity:
      score: {fidelity_score}
      grade: "{grade}"
      status: "{PASS or FAIL}"

    dimensions:
      vocabulary: {vocabulary_score and metrics}
      syntax: {syntax_score and metrics}
      style: {style_score and metrics}
      thinking: {thinking_score and metrics}

    analysis:
      strengths: ["{identified strengths}"]
      weaknesses: ["{identified weaknesses}"]
      recommendations: ["{improvement suggestions}"]

    examples:
      generated_sample: "{excerpt from blog}"
      persona_reference: "{sample from system_prompt}"
      comparison_notes: "{analysis of similarity/differences}"

    flags:
      - type: "{dimension}"
        severity: "{low/medium/high}"
        location: "{paragraph/sentence reference}"
        description: "{what's wrong}"
        suggestion: "{how to fix}"

    regeneration:
      recommended: {true if score < threshold}
      reason: "{why regeneration needed}"
      focus_areas: ["{weakest dimensions}"]
```

---

### Step 6: Output Generation

**6.1. Save Blog Post**

```yaml
save_blog_post:
  step: "Write blog post to markdown file"

  output_path: "{params.output_path or default_path}"
  default_path: "creator-os-workspace/blog-posts/{slug}-{timestamp}.md"

  slug_generation:
    - Take title: "Deep Work for Founders: How to Build Without Burning Out"
    - Convert to lowercase: "deep work for founders: how to build without burning out"
    - Remove special chars: "deep work for founders how to build without burning out"
    - Replace spaces with hyphens: "deep-work-for-founders-how-to-build-without-burning-out"
    - Limit to 60 chars: "deep-work-for-founders-how-to-build-without-burning-out"

  file_content: "{assembled_blog_post_from_step_3.5}"

  success_message: |
    ✓ Blog post saved to: {output_path}
    - Words: {word_count}
    - Fidelity: {fidelity_score}% ({grade})
    - SEO: {seo_score}/10
    - Readability: {readability_score} Flesch-Kincaid
```

**6.2. Save Fidelity Report**

```yaml
save_fidelity_report:
  step: "Write fidelity validation report"

  output_path: "creator-os-workspace/fidelity-reports/{slug}-{timestamp}.yaml"

  file_content: "{populated_fidelity_report_from_step_5.2}"

  success_message: |
    ✓ Fidelity report saved to: {output_path}
```

**6.3. Database Logging (Optional)**

```yaml
database_logging:
  step: "Log content piece to database for tracking"

  if_database_enabled:
    table: "content_pieces"

    insert:
      content_id: "{uuid}"
      project_id: "{from context or null}"
      content_type: "blog_post"
      title: "{title}"
      persona_name: "{persona.name}"
      persona_source: "{persona.source}"
      word_count: {word_count}
      fidelity_score: {fidelity_score}
      seo_score: {seo_score}
      readability_score: {readability_score}
      primary_keyword: "{primary_keyword}"
      keywords: "{json_array of all keywords}"
      file_path: "{output_path}"
      generated_at: "{timestamp}"
      status: "draft"
```

**6.4. User Preview & Actions**

```yaml
user_preview:
  step: "Show summary and offer actions"

  display:
    summary: |
      ✓ Blog post generated successfully!

      Title: {title}
      Words: {word_count}
      Persona: {persona.name} ({persona.source})

      Quality Scores:
      - Fidelity: {fidelity_score}% ({grade}) {status}
      - SEO: {seo_score}/10
      - Readability: {readability_score} Flesch-Kincaid

      Files Created:
      - Blog post: {blog_post_path}
      - Fidelity report: {fidelity_report_path}

    preview_excerpt: |
      --- PREVIEW (first 300 words) ---
      {first_300_words_of_blog}
      ---

    actions:
      1: "Read full post (show complete content)"
      2: "Regenerate (try different approach)"
      3: "Edit specific section (which one?)"
      4: "Optimize SEO further (add internal links, improve meta)"
      5: "Improve fidelity (focus on weakest dimension: {weakest_dimension})"
      6: "Approve and close"

    prompt: "What would you like to do? (1-6)"
```

---

## Error Handling

```yaml
error_scenarios:

  - error: "Persona not found"
    trigger: "MMOS mind '{mind_name}' not found in outputs/minds/"
    recovery:
      1: "List available MMOS minds"
      2: "Offer to use custom persona instead"
      3: "Ask user to select valid persona"
    example_message: |
      ❌ Mind 'invalid_mind' not found.

      Available MMOS minds:
      - nassim_taleb
      - naval_ravikant
      - cal_newport
      - paul_graham
      [... list all available minds ...]

      Alternatively, provide a custom persona JSON file path.

      Which persona would you like to use?

  - error: "Invalid custom persona JSON"
    trigger: "JSON validation fails"
    recovery:
      1: "Show validation errors"
      2: "Show template path: expansion-packs/creator-os/templates/persona-custom.json"
      3: "Ask user to fix JSON and retry"
    example_message: |
      ❌ Invalid persona JSON: {path}

      Validation errors:
      - Missing required field: 'voice_parameters.tone'
      - Invalid value for 'style_markers.metaphor_frequency': must be 'rare', 'occasional', or 'frequent'

      See template: expansion-packs/creator-os/templates/persona-custom.json

      Please fix the JSON and try again.

  - error: "Low fidelity score"
    trigger: "Fidelity score < threshold (85% custom, 90% MMOS)"
    recovery:
      1: "Show fidelity report with weaknesses"
      2: "Identify weakest dimension"
      3: "Offer to regenerate focused on improvement"
    example_message: |
      ⚠️ Fidelity score below threshold: 78% (Target: 85%+)

      Weakest dimension: Vocabulary (score: 68%)
      - Not enough signature phrases used (1/5 expected)
      - Word choice doesn't match persona baseline

      Recommendations:
      - Regenerate with emphasis on signature phrases
      - Review persona's writing samples for vocabulary patterns

      Would you like to:
      1. Regenerate with vocabulary focus
      2. Manually edit to add signature phrases
      3. Accept as-is (not recommended)

  - error: "API rate limit"
    trigger: "Claude API returns 429 (Too Many Requests)"
    recovery:
      1: "Wait and retry with exponential backoff"
      2: "Show progress: 'Retrying in X seconds...'"
      3: "If max retries exceeded, ask user to try later"
    retry_logic:
      max_retries: 3
      backoff: [5, 15, 45]  # seconds

  - error: "Generation timeout"
    trigger: "Blog generation exceeds 10 minutes"
    recovery:
      1: "Show partial progress (which step completed)"
      2: "Offer to resume from last successful step"
      3: "Save partial content to avoid re-work"

  - error: "Invalid topic"
    trigger: "Topic too vague or too short (<10 chars)"
    recovery:
      1: "Ask clarifying questions"
      2: "Suggest topic expansion"
    example_message: |
      ❌ Topic too vague: "Productivity"

      Please provide more specifics:
      - Who is this for? (e.g., "founders", "remote workers")
      - What aspect? (e.g., "time management", "deep work", "tools")
      - What outcome? (e.g., "boost output 2x", "eliminate burnout")

      Example: "Deep work strategies for founders to boost productivity without burning out"
```

---

## Performance Targets

```yaml
performance:
  target_time: "< 10 minutes (2000 words)"
  target_cost: "~$0.50 per blog post"

  breakdown:
    step_1_persona_loading: "5-10 seconds"
    step_2_outline: "30-60 seconds"
    step_3_content_generation:
      hook: "30-45 seconds"
      body_sections: "60-90 seconds per section (x4 = 4-6 min)"
      conclusion: "30-45 seconds"
      cta: "20-30 seconds"
    step_4_seo_optimization: "30-60 seconds"
    step_5_fidelity_validation: "60-90 seconds"
    step_6_output: "5-10 seconds"

  total_estimated: "7-10 minutes"

  optimization_strategies:
    - "Use prompt caching for persona context (90% cost savings on repeated use)"
    - "Batch similar sections when possible"
    - "Stream responses for user feedback during generation"
    - "Cache persona analysis for reuse across multiple posts"
```

---

## Success Metrics

```yaml
success_criteria:

  output_quality:
    - word_count: "1500-2500 words (target: {params.length})"
    - fidelity_score: "85%+ (custom persona) or 90%+ (MMOS clone)"
    - seo_score: "8/10 or higher"
    - readability_score: "60+ Flesch-Kincaid"

  user_satisfaction:
    - would_publish: "User approves content without major edits (80%+ of users)"
    - time_savings: "80% reduction (2h vs 10h manually)"
    - authenticity: "Sounds like persona, not generic AI"

  technical:
    - generation_time: "< 10 minutes"
    - cost: "< $0.75 per post"
    - error_rate: "< 5% (95% successful generations)"
```

---

## Example Usage

```yaml
example_1_mmos_clone:
  command: "*generate-blog-post"

  input:
    topic: "Why most startup advice is fragile"
    persona: "nassim_taleb"
    keywords: ["antifragile", "startup advice", "risk", "skin in the game", "optionality"]
    audience:
      demographics: "Tech founders, 25-40, building startups"
      knowledge_level: "intermediate"
      desired_outcome: "Critically evaluate advice before following it"
    length: 2000
    framework: "problem_solution"

  expected_output:
    blog_post:
      title: "The Fragility of Startup Advice: Why Most Guidance Lacks Skin in the Game"
      word_count: 2147
      fidelity_score: 92
      seo_score: 8.8
      readability_score: 66

    fidelity_report:
      overall_grade: "A (Excellent)"
      vocabulary_score: 94
      syntax_score: 91
      style_score: 90
      thinking_score: 93
      status: "PASS"

example_2_custom_persona:
  command: "*generate-blog-post"

  input:
    topic: "Content marketing for B2B SaaS"
    persona: "expansion-packs/creator-os/templates/persona-custom.json"
    keywords: ["content marketing", "B2B SaaS", "lead generation", "SEO"]
    audience:
      demographics: "SaaS marketers, 28-45, growth stage companies"
      knowledge_level: "advanced"
      desired_outcome: "Implement content strategy this quarter"
    length: 1800

  expected_output:
    blog_post:
      title: "B2B SaaS Content Marketing: The Complete Guide to Generating Qualified Leads"
      word_count: 1876
      fidelity_score: 87
      seo_score: 8.3
      readability_score: 63

    fidelity_report:
      overall_grade: "B+ (Very Good)"
      vocabulary_score: 85
      syntax_score: 88
      style_score: 87
      thinking_score: 86
      status: "PASS"
```

---

**Task Version:** 1.0
**Last Updated:** 2025-10-14
**Maintainer:** CreatorOS Team
