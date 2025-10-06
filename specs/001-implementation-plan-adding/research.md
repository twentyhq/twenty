# Research: PDF and Image Field Types

**Feature**: Add PDF and IMAGE field types to Twenty CRM  
**Date**: 2025-10-06  
**Status**: Complete

## Overview

This document consolidates research findings on Twenty's field metadata system, attachment infrastructure, GraphQL schema generation, and workflow integration to inform the design of PDF and IMAGE field types.

---

## 1. Field Metadata Type System

### Current Field Types

Twenty supports 27 field types defined in `packages/twenty-shared/src/types/FieldMetadataType.ts`:

```typescript
export enum FieldMetadataType {
  UUID, TEXT, PHONES, EMAILS, DATE_TIME, DATE, BOOLEAN,
  NUMBER, NUMERIC, LINKS, CURRENCY, FULL_NAME, RATING,
  SELECT, MULTI_SELECT, RELATION, MORPH_RELATION, POSITION,
  ADDRESS, RAW_JSON, RICH_TEXT, RICH_TEXT_V2, ACTOR, ARRAY, TS_VECTOR
}
```

### Composite Type Pattern

Twenty uses **composite types** for complex fields that require multiple underlying columns. Examples:

- **LINKS**: Array of {url, label, metadata}
- **CURRENCY**: {amountMicros, currencyCode}
- **FULL_NAME**: {firstName, lastName}
- **ADDRESS**: {street, city, state, country, postalCode}
- **ACTOR**: {source, workspaceMemberId, name}
- **EMAILS**: Array of {email, isPrimary}
- **PHONES**: Array of {number, countryCode, isPrimary}
- **RICH_TEXT_V2**: {content, links, mentions}

Composite types are defined in `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/` and registered in `index.ts`:

```typescript
export const compositeTypeDefinitions = new Map<FieldMetadataType, CompositeType>([
  [FieldMetadataType.LINKS, linksCompositeType],
  [FieldMetadataType.CURRENCY, currencyCompositeType],
  // ... etc
]);
```

**Decision**: PDF and IMAGE will follow the **composite type pattern** to support array-based attachment storage.

**Rationale**: 
- Established pattern for array-type fields (LINKS, EMAILS, PHONES)
- Allows storing multiple attachment references per field
- Integrates seamlessly with GraphQL schema generation
- Maintains referential integrity through join semantics

**Alternatives Considered**:
- Simple UUID array: Rejected because it lacks type safety and doesn't model the attachment relationship explicitly
- Direct file embedding: Rejected due to database bloat and lack of reusability

---

## 2. Attachment Storage Architecture

### Attachment Entity

Twenty has an existing `AttachmentWorkspaceEntity` at `packages/twenty-server/src/modules/attachment/standard-objects/attachment.workspace-entity.ts`:

```typescript
@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.attachment,
  namePlural: 'attachments',
  labelSingular: 'Attachment',
  labelPlural: 'Attachments',
})
export class AttachmentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({ type: FieldMetadataType.TEXT })
  name: string;

  @WorkspaceField({ type: FieldMetadataType.TEXT })
  fullPath: string;

  @WorkspaceField({ type: FieldMetadataType.TEXT })
  type: string;

  @WorkspaceRelation({ type: RelationType.MANY_TO_ONE })
  author: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceRelation({ type: RelationType.MANY_TO_ONE })
  task: Relation<TaskWorkspaceEntity> | null;

  @WorkspaceRelation({ type: RelationType.MANY_TO_ONE })
  note: Relation<NoteWorkspaceEntity> | null;
  
  // ... other relations
}
```

**Key Properties**:
- `name`: Original filename
- `fullPath`: S3-compatible storage path (signed URL)
- `type`: MIME type or file category (e.g., "image/png", "application/pdf")
- Relations to parent objects (task, note, etc.)

### File Upload Flow

1. **Frontend**: `useUploadAttachmentFile` hook in `packages/twenty-front/src/modules/activities/files/hooks/`
2. **GraphQL Mutation**: `uploadFile` in `packages/twenty-server/src/engine/core-modules/file/file-upload/resolvers/`
3. **File Service**: `FileUploadService` handles storage (S3/local), generates signed URLs
4. **Attachment Creation**: Record created in `attachments` table with metadata

**Decision**: **Reuse existing attachment storage** infrastructure without modification.

**Rationale**:
- FR-012 explicitly requires reusing existing attachment mechanism
- Avoids code duplication and storage backend complexity
- Leverages battle-tested upload/download logic
- Maintains consistent file management across Twenty

**Alternatives Considered**:
- Separate PDF/Image storage: Rejected due to unnecessary complexity and spec requirements
- Inline base64 encoding: Rejected due to database bloat and poor performance

---

## 3. Field-to-Attachment Association

### Current Pattern

Tasks and Notes use **direct foreign key relations**:
```typescript
// In AttachmentWorkspaceEntity
@WorkspaceJoinColumn('task')
taskId: string | null;
```

This approach creates dedicated columns for each parent object type.

### Proposed Pattern for Custom Fields

For dynamic custom fields, we'll use the **composite type pattern** to store attachment IDs as an array within the field value:

```typescript
// PDF Composite Type
{
  attachmentIds: string[];  // Array of attachment UUIDs
}

// Image Composite Type
{
  attachmentIds: string[];  // Array of attachment UUIDs
}
```

**How it Works**:
1. User uploads files → attachments created in `attachments` table
2. Attachment IDs stored in field's composite column (JSONB array in PostgreSQL)
3. GraphQL resolver joins attachments on query to return full objects
4. Field update mutations validate 10-file limit before storing IDs

**Decision**: Use **composite type with attachmentIds array** instead of foreign key columns.

**Rationale**:
- Scalable: Works for any custom object without schema changes
- Type-safe: Composite type enforces array structure
- Follows pattern: Consistent with LINKS, EMAILS (both use array semantics)
- Efficient: Single JSONB column vs. multiple nullable FK columns

**Alternatives Considered**:
- Many-to-many join table: Rejected due to added complexity and unnecessary for 1:10 cardinality
- Polymorphic relations: Rejected as Twenty already has MORPH_RELATION for different use cases

---

## 4. GraphQL Schema Generation

### Auto-Generation Architecture

Twenty's GraphQL schema is **dynamically generated** from field metadata:

**Flow**:
1. `WorkspaceSchemaFactory.createGraphQLSchema()` loads object metadata
2. `WorkspaceGraphQLSchemaGenerator.generateSchema()` builds schema
3. `GqlTypeGenerator` iterates field metadata and generates types
4. `CompositeFieldMetadataGqlObjectTypeGenerator` handles composite types
5. Schema cached in Redis, invalidated on metadata changes

**Key Files**:
- `packages/twenty-server/src/engine/api/graphql/workspace-schema.factory.ts`
- `packages/twenty-server/src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory.ts`
- `packages/twenty-server/src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/`

**Example Composite Type Generation**:
```typescript
// For LINKS composite type
type LinksField {
  primaryLinkUrl: String
  primaryLinkLabel: String
  secondaryLinks: JSON
}

// Will generate for PDF
type PdfField {
  attachmentIds: [UUID!]!
}
```

**Decision**: **Rely on existing auto-generation** with PDF/IMAGE composite type definitions.

**Rationale**:
- Zero schema code needed - definitions drive generation
- Consistent with all other field types
- Automatic propagation to queries, mutations, filters, sorting
- GraphQL client types (codegen) update automatically

**Alternatives Considered**:
- Manual GraphQL schema: Rejected due to maintenance burden and inconsistency with Twenty architecture
- Custom resolver: Only needed for joining attachments (standard pattern)

---

## 5. REST API Generation

Twenty's REST API is generated from GraphQL schema using metadata introspection:

**Key File**: `packages/twenty-server/src/engine/api/rest/metadata/query-builder/utils/fetch-metadata-fields.utils.ts`

The REST API automatically exposes:
- `/objects/{objectName}/records` (GET, POST)
- `/objects/{objectName}/records/{recordId}` (GET, PATCH, DELETE)
- Field values serialized from GraphQL types

**Decision**: **No custom REST work required** - auto-generated from field metadata.

**Rationale**: REST follows GraphQL structure, so PDF/IMAGE fields appear automatically once GraphQL schema includes them.

---

## 6. Workflow Engine Integration

### Trigger System

Workflows trigger on database events via `WorkflowDatabaseEventTriggerListener`:

**Key Files**:
- `packages/twenty-server/src/modules/workflow/workflow-trigger/automated-trigger/listeners/workflow-database-event-trigger.listener.ts`
- `packages/twenty-shared/src/workflow/schemas/database-event-trigger-schema.ts`

**Field Change Detection**:
```typescript
// Update trigger settings
{
  eventName: "deal.updated",
  fields: ["pdfContract", "images"],  // Field names to watch
}

// Workflow fires when updatedFields includes watched field
const shouldTrigger = settings.fields.some(field =>
  updateEventPayload.properties.updatedFields.includes(field)
);
```

**Payload Structure**:
```typescript
{
  trigger: {
    object: {
      id: "record-uuid",
      pdfContract: {
        attachmentIds: ["attach-1", "attach-2"]
      }
    }
  }
}
```

**Decision**: **No workflow code changes required** - field-based triggers work automatically.

**Rationale**:
- Workflow engine is field-agnostic (works with any field type)
- `updatedFields` array populated by TypeORM change detection
- Attachment metadata accessible via standard joins

**Action Required**:
- Update workflow UI to suggest PDF/IMAGE fields in trigger builders (frontend only)

---

## 7. File Validation

### MIME Type Validation

Twenty has basic validation in `FileUploadService`:

```typescript
async uploadImage({ file, mimeType }) {
  if (!mimeType.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  // ... upload logic
}
```

**Decision**: **Add dedicated validators** for PDF and image MIME types.

**Rationale**:
- Security: Prevent malicious file uploads
- User experience: Clear error messages for wrong file types
- Spec requirement: FR-007, FR-008 mandate type validation

**Implementation**:
```typescript
// New validators
const PDF_MIME_TYPES = ['application/pdf'];
const IMAGE_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 
  'image/webp', 'image/svg+xml'
];

// Server-side validation in field mutation resolver
if (!PDF_MIME_TYPES.includes(file.mimetype)) {
  throw new ValidationError('PDF fields only accept PDF files');
}
```

---

## 8. UI Component Patterns

### Existing File Components

Twenty has reusable file components:
- `Attachments` component: File list with upload/download
- `FileBlock` component: Individual file display
- Drag-and-drop hooks: File input handling

**Location**: `packages/twenty-front/src/modules/activities/files/`

**Decision**: **Adapt existing components** for PDF/IMAGE field display.

**Rationale**:
- DRY principle: Reuse tested upload/preview logic
- Consistent UX: Users familiar with attachment interface
- Less code: Extend vs. rebuild

**New Components Needed**:
- `PdfFieldInput`: Multi-file uploader (drag-drop + file picker)
- `PdfFieldDisplay`: List view with download/preview links
- `ImageFieldInput`: Multi-file uploader with image preview
- `ImageFieldDisplay`: Thumbnail grid with lightbox

---

## 9. Performance Considerations

### Query Performance

**Concern**: Joining 10 attachments per field on large record sets.

**Mitigation**:
- GraphQL DataLoader pattern (batch attachment fetches)
- Indexed `id` column on attachments table (already present)
- Lazy loading: Only fetch attachments when field requested

**Testing**: 
- Load 100 records with 10 attachments each (1000 attachments total)
- Measure query time with DataLoader vs. N+1 queries
- Target: <200ms p95 per spec constraints

### Concurrent Upload Performance

**Requirement**: Support 10 concurrent uploads (FR-037).

**Current Architecture**:
- NestJS handles concurrency via event loop
- File upload service uses streaming to avoid memory bloat
- S3 uploads are asynchronous

**Decision**: **No special optimizations needed** - existing infrastructure handles concurrency.

**Testing**: 
- Simulate 10 users uploading 5 files simultaneously
- Monitor server memory, CPU, response times

---

## 10. Testing Strategy

### Contract Tests

**Purpose**: Validate GraphQL/REST schemas match expectations.

**Approach**:
1. Write schema assertions (field types, mutations, queries)
2. Run before implementation (must fail)
3. Implementation makes tests pass

**Example**:
```typescript
describe('PDF Field GraphQL Schema', () => {
  it('generates PdfField type with attachmentIds', () => {
    const schema = generateSchema();
    const pdfType = schema.getType('PdfField');
    expect(pdfType.getFields()).toHaveProperty('attachmentIds');
  });
});
```

### Integration Tests

**Purpose**: Validate end-to-end user scenarios.

**Coverage**:
- Admin creates PDF/IMAGE fields
- User uploads valid/invalid files
- Workflow triggers on field updates
- Concurrent uploads from multiple users

**Tools**: Playwright for E2E, Jest for API integration

---

## Summary of Decisions

| **Area**               | **Decision**                                  | **Rationale**                                        |
|------------------------|-----------------------------------------------|------------------------------------------------------|
| Field Type Pattern     | Composite types (like LINKS, EMAILS)          | Established pattern, array semantics, type safety    |
| Storage                | Reuse existing attachment infrastructure      | Spec requirement (FR-012), avoids duplication        |
| Association            | Composite field stores attachmentIds array    | Scalable, no schema changes per object               |
| GraphQL Schema         | Auto-generation from composite type defs      | Consistent with Twenty architecture, zero manual work|
| REST API               | Auto-generated from GraphQL metadata          | Automatic propagation, consistent with patterns      |
| Workflow Integration   | No code changes (field-agnostic triggers)     | Existing infrastructure supports any field type      |
| File Validation        | Dedicated MIME type validators                | Security, UX, spec requirements (FR-007, FR-008)     |
| UI Components          | Adapt existing attachment components          | DRY, consistent UX, less code                        |
| Performance            | DataLoader batching, indexed queries          | Meets <200ms p95 constraint, handles 10 concurrent   |
| Testing                | TDD with contract + integration tests         | Validates schema, user flows, concurrent scenarios   |

---

## Open Questions (All Resolved)

None remaining. All technical unknowns resolved through codebase analysis.

---

## Next Steps

Proceed to **Phase 1: Design & Contracts** with:
1. Detailed data model (composite type definitions)
2. GraphQL/REST contract specifications
3. Contract tests (failing)
4. Integration test scenarios
5. Quickstart validation guide

