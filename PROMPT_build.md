# Ralph Build Mode

Based on Geoffrey Huntley's Ralph Wiggum methodology.

---

## Phase 0: Orient

0a. Read `.specify/memory/constitution.md` for project principles.

0b. Study `specs/` to understand feature specifications.

0c. Check if `IMPLEMENTATION_PLAN.md` exists.

---

## Phase 1: Select Work Item

### If IMPLEMENTATION_PLAN.md exists:
Pick the **HIGHEST PRIORITY** incomplete task from the plan.

### If NO plan exists (preferred simple approach):
Look at `specs/` folder and pick the **HIGHEST PRIORITY** spec that:
- Is NOT marked as complete (no `[x] DONE` or similar in the spec)
- Has incomplete acceptance criteria
- Has the highest priority (lower number = higher priority, e.g., 001 before 010)

Before implementing, search the codebase — don't assume it's not done.

---

## Phase 2: Implement

Implement the selected spec/task completely:
- Follow the spec's requirements exactly
- Write clean, maintainable code
- Add tests as needed
- Mark the spec as complete when done

---

## Phase 3: Validate

Run the project's test suite and verify:
- All tests pass
- No lint errors
- The spec's acceptance criteria are 100% met

---

## Phase 4: Commit & Update

1. If using IMPLEMENTATION_PLAN.md, update it to mark task complete
2. If working directly from specs, add `## Status: COMPLETE` to the spec file
3. `git add -A`
4. `git commit` with a descriptive message
5. `git push`

---

## Completion Signal

**CRITICAL:** Only output the magic phrase when the spec/task is 100% complete.

Check:
- [ ] Implementation matches all requirements
- [ ] All tests pass
- [ ] All acceptance criteria verified
- [ ] Changes committed and pushed
- [ ] Spec marked as complete

**If ALL checks pass, output:** `<promise>DONE</promise>`

**If ANY check fails:** Fix the issue and try again. Do NOT output the magic phrase.
