# Agent Instructions

This project uses [Ralph Wiggum](https://github.com/fstandhartinger/ralph-wiggum) for autonomous AI-driven development.

## Before You Begin

Read the project constitution at `.specify/memory/constitution.md` to understand:
- Project vision and principles
- Technical stack and architecture
- Coding standards
- Operational settings

## Autonomous Development

To run the autonomous build loop:
```bash
./scripts/ralph-loop.sh
```

This will:
1. Pick the highest-priority incomplete spec from `specs/`
2. Implement the feature
3. Validate against acceptance criteria
4. Commit and push changes
5. Repeat until all specs are complete

## Creating Specifications

Add new feature specs to `specs/NNN-feature-name/spec.md`:
```markdown
# Feature Name

status: pending

## Description
What this feature does.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes
Implementation guidance.
```

Lower numbers = higher priority.

## Key Files

- `.specify/memory/constitution.md` - Project principles and settings
- `CLAUDE.md` - Technical guidelines for this codebase
- `PROMPT_build.md` - Build mode instructions
- `PROMPT_plan.md` - Planning mode instructions (optional)
- `specs/` - Feature specifications
