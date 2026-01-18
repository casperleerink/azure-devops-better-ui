# Testing Setup with Vitest

status: pending

## Description

Set up a comprehensive testing infrastructure using Vitest and electron-vitest. This enables unit and integration testing across all three Electron processes (main, preload, renderer) with realistic Electron API access and mocked HTTP calls via MSW.

## Acceptance Criteria

- [ ] Vitest and electron-vitest are installed and configured
- [ ] MSW (Mock Service Worker) is installed for HTTP mocking
- [ ] `vitest.config.ts` is configured for electron-vitest
- [ ] Test files are colocated with source (`*.test.ts` pattern)
- [ ] Coverage reporting is enabled (no enforced threshold)
- [ ] `bun run test` script runs all tests
- [ ] `bun run test:coverage` script runs tests with coverage report
- [ ] Example unit tests exist for `src/main/ado-client.ts`
- [ ] MSW handlers mock Azure DevOps API responses for tests
- [ ] TypeScript includes test files in type checking
- [ ] All existing lint and typecheck commands pass

## Technical Notes

### Dependencies to Install

```bash
bun add -d vitest electron-vitest msw @vitest/coverage-v8
```

### Configuration

Create `vitest.config.ts` at project root using electron-vitest plugin. Configure:
- Test environment: electron (via electron-vitest)
- Test file pattern: `**/*.test.ts`
- Coverage provider: v8
- Coverage reporter: text, html

### MSW Setup

Create `src/test/msw/` directory with:
- `handlers.ts` - Azure DevOps API mock handlers
- `server.ts` - MSW server setup for Node environment

Mock the key ADO endpoints:
- `GET /_apis/wit/workitems` - List work items
- `GET /_apis/wit/workitems/:id` - Get single work item
- `POST /_apis/wit/workitems` - Create work item
- `PATCH /_apis/wit/workitems/:id` - Update work item

### Example Tests for ADO Client

Focus initial tests on `src/main/ado-client.ts`:
- Test `getWorkItems()` returns parsed work items
- Test `getWorkItem(id)` fetches single item
- Test error handling for API failures
- Test authentication header is included in requests

### File Organization

```
src/
├── main/
│   ├── ado-client.ts
│   ├── ado-client.test.ts    # colocated tests
│   └── ...
├── preload/
│   ├── index.ts
│   ├── index.test.ts
│   └── ...
├── renderer/
│   └── ...
└── test/
    └── msw/
        ├── handlers.ts
        └── server.ts
```

### Scripts to Add (package.json)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Out of Scope

- React component rendering tests (no React Testing Library)
- CI/CD integration (manual execution only for now)
- E2E tests
- Coverage thresholds or enforcement
