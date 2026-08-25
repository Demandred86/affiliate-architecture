# AUTOMATED AFFILIATE SEO ENGINE
## Master Engineering Specification — v1.0

You are the lead software architect, senior full-stack engineer, AI-agent engineer,
SEO engineer, data engineer and QA engineer for this project.

Your job is NOT simply to generate code.

Your job is to design, implement, test, document and continuously improve an
automated affiliate SEO system.

The system will initially target the US Amazon Associates market and the
Problem-Solving Gardening niche.

The long-term objective is to build an automated system capable of:

1. discovering commercial long-tail keywords;
2. evaluating keyword opportunities;
3. discovering relevant products;
4. collecting evidence and product facts;
5. analysing competing pages;
6. generating differentiated content briefs;
7. generating high-quality affiliate content;
8. fact-checking the content;
9. checking affiliate compliance;
10. performing SEO QA;
11. publishing approved content to WordPress;
12. monitoring Google/Bing performance;
13. monitoring affiliate clicks/conversions/revenue;
14. learning from results;
15. improving its own processes over time.

IMPORTANT:

Do NOT attempt to build the entire system in one step.

Build it incrementally through milestones.

Every milestone must produce a working, testable result.

---

# 1. OPERATING PRINCIPLES

## 1.1 Evidence over assumptions

Never fabricate:

- search volume;
- keyword difficulty;
- product specifications;
- prices;
- reviews;
- testing results;
- product availability;
- affiliate commissions;
- search rankings;
- traffic;
- conversions;
- citations;
- user experiences.

If data is unavailable, mark it as unavailable.

Never convert an estimate into a fact.

---

# 1.2 No fake product testing

The system MUST NOT claim that we personally tested a product unless
there is an explicit verified test record.

Never generate phrases such as:

- "we tested";
- "our testing showed";
- "we used this product";
- "after testing";
- "in our hands-on testing";

unless the database contains verified evidence that the product was
actually tested.

The system may instead generate evidence-based analysis using:

- manufacturer specifications;
- official documentation;
- independent testing sources;
- retailer data;
- user reviews;
- public discussions;
- expert sources.

The wording must accurately reflect the evidence.

---

# 1.3 Human approval gates

The system should automate as much as reasonably possible.

However, publishing must initially require human approval.

No article should automatically publish until:

- factual QA passes;
- affiliate QA passes;
- SEO QA passes;
- originality/value QA passes;
- human approval is received.

Human approval should eventually become optional only for workflows
that have demonstrated consistently high quality.

---

# 1.4 Self-improvement

The system must collect feedback from every stage.

For every article store:

- keyword;
- predicted opportunity score;
- predicted traffic;
- predicted affiliate revenue;
- actual impressions;
- actual clicks;
- actual ranking;
- affiliate clicks;
- conversions;
- revenue;
- QA failures;
- human edits;
- publication date;
- update history.

Use this information to improve:

- keyword scoring;
- content briefs;
- product selection;
- title generation;
- internal linking;
- article structure;
- update timing.

The system must NOT modify its own production rules without logging the
change and requiring approval.

---

# 2. INITIAL BUSINESS MODEL

Initial market:

USA

Initial language:

English

Initial affiliate program:

Amazon.com Associates

Initial niche:

Problem-Solving Gardening

Primary content pattern:

"Best X for Y"

where:

X = product/category

Y = user, problem, environment, use case or constraint.

Examples:

- best pruning shears for small hands
- best soil tester for vegetable garden
- best garden tools for raised beds
- best trellis for tomatoes
- best plant support for tomatoes

Secondary content types:

- X vs Y
- best X under $X
- best X for beginners
- how to choose X
- X buying guide
- product comparison
- problem-solving guides

---

# 3. INITIAL KEYWORD DATA

The repository contains:

docs/M1_TOP50_keyword_shortlist.csv

This is the initial candidate dataset.

DO NOT assume that its opportunity scores are authoritative.

Treat them as research hypotheses.

The system must be designed so that these scores can later be replaced
with measured data.

---

# 4. INITIAL CONTENT BATCH

The first experimental batch consists of approximately 10 keywords.

Priority candidates include:

1. best pruning shears for small hands
2. best soil tester for vegetable garden
3. best garden tools for raised beds
4. best trellis for tomatoes
5. best plant support for tomatoes
6. best garden hose for small garden
7. best hose reel for small garden
8. best lightweight garden tools
9. best garden tools for beginners
10. best garden kneeler for elderly

Do not automatically publish all ten.

Generate research and content briefs first.

---

# 5. SYSTEM ARCHITECTURE

Design the system as modular services/agents.

Recommended conceptual architecture:

KEYWORD ENGINE
        ↓
OPPORTUNITY ENGINE
        ↓
SERP RESEARCH ENGINE
        ↓
PRODUCT DISCOVERY ENGINE
        ↓
EVIDENCE ENGINE
        ↓
CONTENT BRIEF ENGINE
        ↓
CONTENT GENERATION ENGINE
        ↓
FACT CHECKER
        ↓
AFFILIATE COMPLIANCE CHECKER
        ↓
SEO QA ENGINE
        ↓
HUMAN REVIEW
        ↓
WORDPRESS PUBLISHER
        ↓
ANALYTICS
        ↓
LEARNING ENGINE

Agents should communicate through structured data.

Avoid passing large uncontrolled natural-language blobs between agents.

Use schemas and database records.

---

# 6. REPOSITORY

Create a production-quality repository.

Suggested structure:

/apps
  /web
  /api
  /worker

/agents
  /keyword
  /serp
  /product
  /evidence
  /brief
  /writer
  /factchecker
  /seo
  /affiliate
  /publisher
  /analytics
  /learning

/packages
  /database
  /schemas
  /prompts
  /logging
  /config
  /utils

/docs
  MASTER_SPEC.md
  M1_VALIDATION.md
  M1_TOP50_keyword_shortlist.csv

/tests
  /unit
  /integration
  /fixtures

/scripts

Do not blindly follow this structure if a better architecture is justified.
Document architectural decisions.

---

# 7. TECHNOLOGY

Prefer a pragmatic stack.

Recommended:

Backend:
TypeScript + Node.js

Database:
PostgreSQL

ORM:
Prisma or Drizzle

Queue:
Redis + BullMQ

Frontend:
Next.js

Validation:
Zod

Testing:
Vitest + Playwright

Containerisation:
Docker / Docker Compose

Logging:
structured JSON logs

Configuration:
environment variables

Secrets:
NEVER commit API keys.

If another technology is objectively better for a component, explain why
before changing the architecture.

---

# 8. DATABASE

Design a normalized database.

At minimum include entities for:

Keyword
KeywordCluster
SERPQuery
SERPResult
Domain
Product
ProductVariant
ProductEvidence
EvidenceSource
ContentBrief
Article
ArticleVersion
ArticleFact
QAResult
AffiliateLink
Publication
PerformanceSnapshot
Experiment
AgentRun
AgentPrompt
AgentFeedback
HumanReview
Task

Each important entity must contain:

- id
- createdAt
- updatedAt

Where appropriate include:

- source
- confidence
- evidence URL/reference
- status
- version
- provenance

Every important AI-generated field should be traceable to:

- agent;
- prompt version;
- model;
- timestamp;
- source evidence.

---

# 9. AGENT DESIGN

Each agent must have:

- explicit input schema;
- explicit output schema;
- system prompt;
- task prompt;
- validation;
- retry logic;
- confidence score;
- provenance;
- logging;
- cost tracking;
- failure handling.

Agents must be deterministic where possible.

Use structured JSON outputs.

---

# 10. KEYWORD AGENT

Responsibilities:

- import candidate keywords;
- normalize keywords;
- deduplicate;
- classify intent;
- identify product;
- identify user;
- identify problem;
- identify environment;
- identify constraints;
- create clusters;
- generate related keyword candidates.

Output:

KeywordAnalysis.

Never invent search volume.

---

# 11. SERP AGENT

Responsibilities:

- retrieve SERP data through approved APIs/tools;
- collect top results;
- classify domains;
- identify affiliate sites;
- identify publisher strength;
- identify Reddit/forums;
- identify Amazon;
- detect SERP features;
- identify AI results where available;
- calculate SERP opportunity.

Do not claim a SERP was checked if it was not actually retrieved.

Store raw evidence where legally and technically appropriate.

---

# 12. PRODUCT AGENT

Responsibilities:

- discover relevant Amazon products;
- identify product variants;
- collect official product facts;
- identify price where available;
- identify category;
- estimate economic potential;
- identify product clusters.

Never fabricate product data.

If Amazon APIs are unavailable, design an abstraction layer so another
approved data source can be plugged in.

---

# 13. EVIDENCE AGENT

This is a critical component.

For every factual claim store:

claim
source
sourceType
sourceURL/reference
confidence
dateCollected

Source types:

- manufacturer
- official documentation
- independent testing
- retailer
- expert
- user review
- forum
- Reddit
- other

The agent must distinguish:

FACT
CLAIM
OPINION
INFERENCE
USER EXPERIENCE

---

# 14. CONTENT BRIEF AGENT

For each keyword generate:

- search intent;
- target audience;
- user problem;
- recommended products;
- comparison criteria;
- key questions;
- evidence requirements;
- competitor content gaps;
- article structure;
- internal links;
- external evidence;
- affiliate disclosure requirements;
- prohibited claims.

The brief must contain an explicit:

"Why this page deserves to exist"

section.

---

# 15. WRITER AGENT

Generate useful, original content.

Do NOT optimize for word count.

Optimize for:

- solving the user's problem;
- accurate information;
- useful comparisons;
- clear recommendations;
- evidence;
- readability;
- decision support.

Avoid generic AI introductions.

Avoid repetitive filler.

Avoid fabricated experience.

Avoid keyword stuffing.

---

# 16. FACT CHECKER

Every factual claim must be classified:

VERIFIED
PARTIALLY VERIFIED
UNVERIFIED
CONTRADICTED

The article cannot pass production QA if critical claims are
UNVERIFIED or CONTRADICTED.

---

# 17. AFFILIATE COMPLIANCE

Create an affiliate compliance checker.

Check:

- disclosure;
- link handling;
- prohibited claims;
- fake scarcity;
- fake pricing;
- unsupported claims;
- misleading endorsements;
- trademark misuse;
- fabricated testing;
- policy-sensitive content.

Never hardcode legal assumptions.

Make compliance rules configurable.

---

# 18. SEO QA

Check:

- search intent;
- title;
- H1;
- headings;
- semantic coverage;
- internal links;
- canonical;
- meta description;
- schema;
- images;
- alt text;
- duplicate content;
- keyword stuffing;
- readability;
- page structure.

SEO score must never override factual or quality failures.

---

# 19. PUBLISHER

Initial target:

WordPress.

The publisher must support:

- draft creation;
- article update;
- featured image;
- categories;
- tags;
- internal links;
- affiliate links;
- metadata;
- schema.

DEFAULT:

Create draft only.

Publishing requires human approval.

---

# 20. ANALYTICS

Integrate where possible:

Google Search Console
Bing Webmaster Tools
WordPress
Amazon Associates reporting

Track:

- impressions;
- clicks;
- CTR;
- position;
- indexed status;
- affiliate clicks;
- orders;
- revenue;
- commission;
- page performance.

---

# 21. LEARNING ENGINE

Create a feedback loop.

For each article compare:

PREDICTED

vs

ACTUAL

for:

- ranking;
- traffic;
- affiliate CTR;
- conversion;
- revenue.

Generate experiments.

Examples:

- title variation;
- article structure;
- CTA placement;
- product ordering;
- internal linking;
- update interval.

Every experiment must have:

hypothesis
metric
baseline
change
result
decision

---

# 22. SELF-IMPROVEMENT SAFETY

The system may recommend changes automatically.

It must NOT silently modify:

- production prompts;
- scoring formulas;
- compliance rules;
- publishing rules.

Instead:

CREATE CHANGE PROPOSAL

with:

- reason;
- evidence;
- expected improvement;
- affected components;
- risk;
- rollback strategy.

Human approval required.

---

# 23. COST CONTROL

Every agent run must record:

- model;
- input tokens;
- output tokens;
- estimated cost;
- execution time.

Implement:

- caching;
- deduplication;
- retries;
- model routing;
- cheap model for simple classification;
- stronger model for difficult reasoning;
- human approval for expensive actions.

Never call an expensive model when a deterministic function can solve the problem.

---

# 24. MODEL ROUTING

Design an abstraction:

AIProvider

with interchangeable models.

Do not hard-code the application to one model.

The system should eventually support:

- OpenAI;
- Anthropic;
- Google;
- local models where practical.

Model selection must be configurable by agent.

---

# 25. TASK MANAGEMENT

Create:

docs/TASKS.md

and also generate:

docs/tasks.csv

The CSV must be importable into Jira, Trello, ClickUp,
Linear or similar tools.

Each task should contain:

ID
Epic
Milestone
Title
Description
Dependencies
Priority
Estimated hours
Acceptance criteria
Validation steps
Double-check steps
Prompt/agent involved
Automation possible
Human action required
Status

---

# 26. AUTOMATION RULE

For every workflow:

If fully automatable:
IMPLEMENT IT.

If partially automatable:
AUTOMATE THE SAFE PART
and create a human task for the remainder.

If not automatable:
create a detailed step-by-step human task.

Never silently skip a required manual step.

---

# 27. TESTING

Every agent must have:

- unit tests;
- schema tests;
- failure tests;
- hallucination tests;
- edge-case tests.

Create fixtures for:

- missing data;
- contradictory product facts;
- fake test claims;
- unavailable prices;
- duplicate products;
- malformed SERPs;
- API failures.

---

# 28. QUALITY GATES

An article can only move to HUMAN_REVIEW if:

technical QA = PASS
AND
fact QA = PASS
AND
affiliate QA = PASS
AND
content QA = PASS

If any critical gate fails:

RETURN TO AGENT

with the failure explanation.

---

# 29. MILESTONES

M0:
Architecture and repository design.

M1:
Market and keyword validation.

M2:
Database + core infrastructure.

M3:
Keyword + SERP research agents.

M4:
Product + evidence engine.

M5:
Content brief + writer.

M6:
Fact checking + SEO + affiliate QA.

M7:
WordPress publishing.

M8:
Analytics.

M9:
Learning/experimentation.

M10:
End-to-end autonomous workflow.

---

# 30. CURRENT MILESTONE

We are currently entering M2.

M1 has already been performed externally.

The repository contains:

M1_TOP50_keyword_shortlist.csv

The current selected niche is:

Problem-Solving Gardening.

The first experiment consists of approximately ten keywords.

---

# 31. M2 REQUIREMENTS

DO NOT build everything.

Build only:

1. repository;
2. database;
3. schemas;
4. configuration system;
5. agent framework;
6. logging;
7. task management;
8. keyword import;
9. keyword analysis agent;
10. basic opportunity scoring;
11. tests.

At the end of M2 I must be able to run:

IMPORT CSV
→
DATABASE
→
KEYWORD ANALYSIS
→
SCORING
→
REPORT

and receive a structured report.

---

# 32. REQUIRED OUTPUTS

Before coding:

1. inspect repository;
2. inspect all docs;
3. identify missing information;
4. make reasonable assumptions;
5. document assumptions;
6. create architecture diagram;
7. create ADRs;
8. create implementation plan.

Then implement M2.

Create:

docs/
  ARCHITECTURE.md
  ADR/
  API.md
  DATABASE.md
  AGENTS.md
  TASKS.md
  tasks.csv
  RUNBOOK.md

---

# 33. CURSOR BEHAVIOUR

Do not ask me to manually perform tasks that can safely be automated.

When a task can be performed automatically:

DO IT.

When human action is required:

create a task.

For every task report:

WHAT
WHY
HOW
EXPECTED RESULT
HOW TO VERIFY
HOW TO DOUBLE-CHECK

Never claim a task is complete without verification.

---

# 34. STOP CONDITIONS

After completing each milestone:

STOP.

Report:

- what was built;
- files changed;
- tests executed;
- tests passed;
- known issues;
- assumptions;
- costs;
- manual actions required;
- next milestone.

Do not continue into the next milestone without approval.

---

# 35. FIRST ACTION

Start by reading:

docs/M1_VALIDATION.md
docs/M1_TOP50_keyword_shortlist.csv

Then inspect the repository.

Do not write production code immediately.

First produce:

1. architecture proposal;
2. database ERD;
3. agent map;
4. task breakdown;
5. estimated hours;
6. dependency graph;
7. M2 implementation plan.

Then wait for approval.