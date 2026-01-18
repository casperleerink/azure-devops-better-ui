# Ralph Build Mode

Based on Geoffrey Huntley's Ralph Wiggum methodology.

---

## Phase 0: Orient

0a. Read `.specify/memory/constitution.md` for project principles.

0b. Read `IMPLEMENTATION_PLAN.md` to understand the current tasks.

---

## Phase 1: Select Work Item

Pick **1** task from `IMPLEMENTATION_PLAN.md`:
- Select the **HIGHEST PRIORITY** incomplete task
- Tasks are ordered by priority (top = highest priority)

Before implementing, search the codebase — don't assume it's not done.

---

## Phase 2: Implement

Implement the selected task completely:
- Follow the task's requirements exactly
- Write clean, maintainable code
- Add tests as needed

---

## Phase 3: Validate

Run the project's test suite and verify:
- All tests pass
- No lint errors
- The task's acceptance criteria are 100% met

---

## Phase 4: Commit & Update

1. Update `IMPLEMENTATION_PLAN.md` to mark task complete
2. `git add -A`
3. `git commit` with a descriptive message
4. `git push`

---

## Completion Signal Check

**CRITICAL:** Only output the magic phrase when **ALL** tasks in `IMPLEMENTATION_PLAN.md` are complete.

Check:
- [ ] Current task implementation matches all requirements
- [ ] All tests pass
- [ ] All acceptance criteria verified
- [ ] Changes committed and pushed
- [ ] Task marked as complete in IMPLEMENTATION_PLAN.md
- [ ] **ALL** tasks in IMPLEMENTATION_PLAN.md are now complete

**If ALL checks pass (including all tasks complete), output:** `<promise>DONE</promise>`

**If ANY check fails OR there are remaining incomplete tasks:** You are finished but do NOT output the magic phrase.
