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
Pick **1** HIGHEST PRIORITY incomplete task from the plan.

### If IMPLEMENTATION_PLAN.md doesn't exist
We should get out of the loop so return `<promise>DONE</promise>`

---

## Phase 2: Implement

Implement the selected task completely:
- Follow the task's requirements exactly
- Write clean, maintainable code
- Add tests as needed
- Mark the task as complete when done

---

## Phase 3: Validate

Run the project's test suite and verify:
- All tests pass
- No type errors
- No lint errors
- The task's acceptance criteria are 100% met

---

## Phase 4: Commit & Update

1. IMPLEMENTATION_PLAN.md, update it to mark the task complete
3. `git add -A`
4. `git commit` with a descriptive message
5. `git push`

---

## Completion Signal

**CRITICAL:** Only output the magic phrase when all the tasks in the implementation plan are 100% complete.

Check:
- [ ] Implementation matches all requirements
- [ ] All tests pass
- [ ] All acceptance criteria verified
- [ ] Changes committed and pushed
- [ ] Spec marked as complete

**If ALL checks pass, output:** `<promise>DONE</promise>`

**If ANY check fails:** Fix the issue and try again. Do NOT output the magic phrase.
