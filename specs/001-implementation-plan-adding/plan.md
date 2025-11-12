
# Implementation Plan: PDF and Image Field Types

**Branch**: `001-implementation-plan-adding` | **Date**: 2025-10-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-implementation-plan-adding/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → ✅ Loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Detected Web Application (frontend + backend)
   → ✅ Structure Decision set
3. Fill the Constitution Check section based on the content of the constitution document.
   → ✅ Constitution template analyzed (no specific principles defined)
4. Evaluate Constitution Check section below
   → ✅ No violations detected
   → ✅ Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → ✅ Completed
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✅ Completed
7. Re-evaluate Constitution Check section
   → ✅ No violations detected
   → ✅ Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach
   → ✅ Completed
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

This feature adds PDF and IMAGE as first-class custom field types to Twenty CRM, allowing workspace administrators to create custom fields on any object that support uploading, viewing, and managing PDF documents and image files. The implementation reuses Twenty's existing attachment storage infrastructure and field metadata system, extending it to support these new composite field types with array semantics (up to 10 files per field). The feature integrates with the GraphQL/REST APIs, workflow engine, and UI components, following Twenty's established patterns for custom field types like LINKS, CURRENCY, and RICH_TEXT_V2.

## Technical Context

**Language/Version**: TypeScript 5.x (React 18 frontend, NestJS backend)  
**Primary Dependencies**: 
- Backend: NestJS, TypeORM, PostgreSQL, GraphQL, Redis
- Frontend: React 18, Recoil, Apollo Client, Styled Components, Vite  

**Storage**: PostgreSQL (field metadata, attachment records), S3-compatible storage (file data)  
**Testing**: Jest (unit/integration), Playwright (E2E)  
**Target Platform**: Web (Linux server backend, modern browsers frontend)  
**Project Type**: Web (separate frontend and backend packages in Nx monorepo)  
**Performance Goals**: Support 10 concurrent file uploads, handle fields with 10 attachments without degradation  
**Constraints**: Maximum 10 attachments per field, file type validation (MIME), immediate deletion when removed  
**Scale/Scope**: Extends existing field type system (~27 field types), integrates with attachment module, workflow engine, and UI

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file is a template placeholder with no specific principles defined yet. Therefore, no constitutional violations can occur. The design follows Twenty's established architectural patterns:

✅ **Library-First Pattern**: Reuses existing attachment storage library  
✅ **Field Type Pattern**: Follows composite type pattern established for LINKS, EMAILS, PHONES  
✅ **Test Coverage**: Following TDD principles with contract and integration tests  
✅ **Observability**: Standard GraphQL/REST API exposure ensures debuggability  
✅ **Simplicity**: Minimal new concepts, maximum reuse of existing infrastructure

## Project Structure

### Documentation (this feature)
```
specs/001-implementation-plan-adding/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── graphql-schema.graphql
│   └── rest-api.yaml
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
packages/twenty-server/src/
├── engine/
│   ├── metadata-modules/
│   │   └── field-metadata/
│   │       ├── composite-types/
│   │       │   ├── pdf.composite-type.ts          # New: PDF field definition
│   │       │   └── image.composite-type.ts        # New: Image field definition
│   │       └── services/
│   │           └── field-metadata.service.ts      # Modified: Add PDF/IMAGE support
│   ├── api/
│   │   └── graphql/
│   │       └── workspace-schema-builder/
│   │           └── graphql-type-generators/       # Auto-generates schema from metadata
│   └── core-modules/
│       └── file/                                   # Existing: Reused for uploads
└── modules/
    ├── attachment/
    │   └── standard-objects/
    │       └── attachment.workspace-entity.ts      # Modified: Add field associations
    └── workflow/
        └── workflow-trigger/                       # Modified: Support PDF/IMAGE triggers

packages/twenty-front/src/
├── modules/
│   ├── object-record/
│   │   └── record-field/
│   │       ├── meta-types/
│   │       │   ├── input/
│   │       │   │   ├── components/
│   │       │   │   │   ├── PdfFieldInput.tsx     # New: PDF upload UI
│   │       │   │   │   └── ImageFieldInput.tsx   # New: Image upload UI
│   │       │   └── display/
│   │       │       └── components/
│   │       │           ├── PdfFieldDisplay.tsx   # New: PDF display UI
│   │       │           └── ImageFieldDisplay.tsx # New: Image preview UI
│   └── settings/
│       └── data-model/
│           └── fields/
│               └── forms/                          # Modified: Add PDF/IMAGE to field creator

packages/twenty-shared/src/
└── types/
    └── FieldMetadataType.ts                        # Modified: Add PDF, IMAGE enum values

tests/
├── contract/
│   ├── field-metadata-pdf.test.ts                  # New: PDF field contract tests
│   └── field-metadata-image.test.ts                # New: Image field contract tests
├── integration/
│   ├── pdf-field-workflow.test.ts                  # New: PDF workflow integration
│   └── image-field-workflow.test.ts                # New: Image workflow integration
└── unit/
    ├── pdf-composite-type.test.ts                  # New: PDF type unit tests
    └── image-composite-type.test.ts                # New: Image type unit tests
```

**Structure Decision**: Web application structure detected. Twenty uses an Nx monorepo with separate packages for frontend (`twenty-front`), backend (`twenty-server`), and shared types (`twenty-shared`). The implementation follows Twenty's composite field type pattern (similar to LINKS, CURRENCY, RICH_TEXT_V2) with backend metadata definitions driving automatic GraphQL schema generation and frontend display components.

## Phase 0: Outline & Research

**Status**: ✅ Completed

### Research Tasks Executed

1. **Field Metadata Type System**
   - Analyzed `FieldMetadataType` enum in `twenty-shared/src/types/FieldMetadataType.ts`
   - Reviewed composite type pattern in `twenty-server/src/engine/metadata-modules/field-metadata/composite-types/`
   - Examined existing types: LINKS, CURRENCY, FULL_NAME, ADDRESS, ACTOR, EMAILS, PHONES, RICH_TEXT_V2

2. **Attachment Storage Architecture**
   - Reviewed attachment entity at `twenty-server/src/modules/attachment/standard-objects/attachment.workspace-entity.ts`
   - Analyzed file upload flow in `twenty-server/src/engine/core-modules/file/`
   - Studied upload hooks in `twenty-front/src/modules/activities/files/hooks/useUploadAttachmentFile.tsx`

3. **GraphQL Schema Generation**
   - Traced schema factory at `twenty-server/src/engine/api/graphql/workspace-schema.factory.ts`
   - Examined type generators in `workspace-schema-builder/graphql-type-generators/`
   - Confirmed automatic generation based on field metadata

4. **Workflow Integration**
   - Reviewed workflow trigger system in `twenty-server/src/modules/workflow/workflow-trigger/`
   - Analyzed database event listener at `workflow-database-event-trigger.listener.ts`
   - Confirmed field-level change detection via `updatedFields` array

See [research.md](./research.md) for detailed findings.

## Phase 1: Design & Contracts

**Status**: ✅ Completed

### Outputs Generated

1. **Data Model** (`data-model.md`)
   - FieldMetadataEntity extensions for PDF and IMAGE types
   - Attachment entity schema (reused, with field association)
   - Field-to-Attachment join mechanism via composite types

2. **API Contracts** (`contracts/`)
   - GraphQL schema extensions for PDF/IMAGE fields
   - REST API OpenAPI specification
   - Mutation/query definitions for file operations

3. **Contract Tests** (test files in structure above)
   - Schema validation tests (must fail initially)
   - Field creation/query tests
   - File upload/download tests

4. **Quickstart Guide** (`quickstart.md`)
   - Step-by-step validation scenarios
   - Admin and user workflows
   - Automated test execution instructions

5. **Agent Context Update** (`CLAUDE.md`)
   - Updated with PDF/IMAGE field type context
   - Added relevant technical patterns
   - Preserved existing manual additions

See Phase 1 outputs in the `specs/001-implementation-plan-adding/` directory.

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

The /tasks command will load `.specify/templates/tasks-template.md` and generate ordered tasks following TDD principles:

### Backend Tasks (25-30 tasks estimated)

1. **Type System Extension** (5 tasks)
   - Add PDF and IMAGE to FieldMetadataType enum [P]
   - Create pdf.composite-type.ts with field definitions [P]
   - Create image.composite-type.ts with field definitions [P]
   - Register composite types in index.ts
   - Add filterable/orderable support for new types

2. **Attachment Association** (4 tasks)
   - Add field reference columns to AttachmentWorkspaceEntity
   - Create migration for attachment table updates
   - Update attachment service for field-based queries
   - Add cascade deletion logic for field attachments

3. **GraphQL Schema** (3 tasks)
   - Verify auto-generation includes PDF/IMAGE types (test)
   - Add custom mutations for multi-file upload
   - Add custom queries for field attachment retrieval

4. **Validation Services** (4 tasks)
   - Create PDF MIME type validator service
   - Create image MIME type validator service
   - Add 10-file limit enforcement
   - Add file size validation

5. **Workflow Integration** (3 tasks)
   - Update workflow trigger to support PDF/IMAGE fields
   - Add attachment metadata to trigger payload
   - Update workflow action schemas for file operations

6. **Contract Tests** (6 tasks)
   - Write failing GraphQL schema tests for PDF fields
   - Write failing GraphQL schema tests for IMAGE fields
   - Write failing REST API tests for PDF operations
   - Write failing REST API tests for IMAGE operations
   - Write failing attachment association tests
   - Write failing validation tests

### Frontend Tasks (15-20 tasks estimated)

7. **Field Type Registration** (3 tasks)
   - Add PDF to field type constants
   - Add IMAGE to field type constants
   - Update field type picker UI with new options

8. **Input Components** (6 tasks)
   - Create PdfFieldInput component with drag-drop [P]
   - Create ImageFieldInput component with drag-drop [P]
   - Implement file picker integration for PDF
   - Implement file picker integration for images
   - Add upload progress indicators
   - Add file removal functionality

9. **Display Components** (6 tasks)
   - Create PdfFieldDisplay with file list [P]
   - Create ImageFieldDisplay with thumbnails [P]
   - Implement PDF preview modal/new tab
   - Implement image lightbox viewer
   - Add download links for all files
   - Add file metadata display (size, date)

10. **Field Settings UI** (2 tasks)
    - Add PDF/IMAGE to object builder field creator
    - Update field preview for PDF/IMAGE types

### Integration Tests (8 tasks)

11. **End-to-End Scenarios**
    - E2E test: Admin creates PDF field on custom object
    - E2E test: User uploads 3 PDFs to field
    - E2E test: User uploads 10 images (limit test)
    - E2E test: User attempts invalid file type upload
    - E2E test: User views and downloads attachments
    - E2E test: User removes attachments from field
    - E2E test: Workflow triggers on PDF field upload
    - E2E test: Concurrent uploads from multiple users

**Ordering Strategy**:
1. **TDD Order**: All contract tests before implementations
2. **Dependency Order**: 
   - Shared types first (twenty-shared)
   - Backend metadata/services (twenty-server)
   - Frontend components (twenty-front)
3. **Parallel Markers [P]**: Independent file creations can run in parallel
4. **Integration Last**: E2E tests run after all implementations

**Estimated Output**: 45-50 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No constitutional violations detected. The design follows established Twenty patterns without introducing new complexity layers.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅ 2025-10-06
- [x] Phase 1: Design complete (/plan command) ✅ 2025-10-06
  - [x] research.md created with technical findings
  - [x] data-model.md created with entity schemas
  - [x] contracts/graphql-schema.graphql created
  - [x] contracts/rest-api.yaml created
  - [x] quickstart.md created with validation scenarios
  - [x] CLAUDE.md updated with feature context
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅ 2025-10-06
- [x] Phase 3: Tasks generated (/tasks command) ✅ 2025-10-06
  - [x] tasks.md created with 50 ordered, dependency-aware tasks
  - [x] 16 contract tests (T004-T019) - must fail before implementation
  - [x] 27 core implementation tasks (T020-T045)
  - [x] 4 polish tasks (T046-T050)
  - [x] 30 tasks marked [P] for parallel execution
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS (no principles defined)
- [x] Post-Design Constitution Check: PASS (no violations)
- [x] All NEEDS CLARIFICATION resolved (none present)
- [x] Complexity deviations documented (none present)

**Deliverables Summary**:
- ✅ plan.md - Implementation plan with technical context
- ✅ research.md - Codebase analysis and architecture decisions
- ✅ data-model.md - Database schema and entity definitions
- ✅ contracts/graphql-schema.graphql - GraphQL API contract
- ✅ contracts/rest-api.yaml - REST API OpenAPI specification
- ✅ quickstart.md - Step-by-step validation guide
- ✅ tasks.md - 50 ordered implementation tasks with TDD enforcement
- ✅ CLAUDE.md - Updated agent context file

**Ready for Next Phase**: Phase 4 - Task execution (T001-T050) following TDD principles

---
*Based on Constitution v2.1.1 - See `/.specify/memory/constitution.md`*
