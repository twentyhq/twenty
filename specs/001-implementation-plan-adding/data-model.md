# Data Model: PDF and Image Field Types

**Feature**: PDF and IMAGE field types  
**Date**: 2025-10-06  
**Status**: Phase 1 Complete

## Overview

This document defines the data structures for PDF and IMAGE field types in Twenty CRM. Both types follow the composite field pattern, storing arrays of attachment references while reusing the existing `AttachmentWorkspaceEntity` for file metadata and storage.

---

## 1. Field Metadata Extensions

### FieldMetadataType Enum

**File**: `packages/twenty-shared/src/types/FieldMetadataType.ts`

**Changes**:
```typescript
export enum FieldMetadataType {
  // ... existing types
  RICH_TEXT_V2 = 'RICH_TEXT_V2',
  ACTOR = 'ACTOR',
  ARRAY = 'ARRAY',
  TS_VECTOR = 'TS_VECTOR',
  
  // New types
  PDF = 'PDF',           // Added for PDF file fields
  IMAGE = 'IMAGE',       // Added for image file fields
}
```

**Properties**:
- **PDF**: Represents a field that stores one or more PDF documents
- **IMAGE**: Represents a field that stores one or more image files

---

## 2. Composite Type Definitions

### PDF Composite Type

**File**: `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/pdf.composite-type.ts`

**Structure**:
```typescript
import { FieldMetadataType } from 'twenty-shared/types';
import { CompositeType } from '../interfaces/composite-type.interface';

export const pdfCompositeType: CompositeType = {
  type: FieldMetadataType.PDF,
  properties: [
    {
      name: 'attachmentIds',
      type: FieldMetadataType.ARRAY,
      targetColumnMap: {
        value: 'attachmentIds',
      },
      isRequired: true,
      defaultValue: [],
      description: 'Array of attachment UUIDs for PDF files (max 10)',
    },
  ],
};
```

**Properties**:
- `attachmentIds`: Array of UUID strings referencing `AttachmentWorkspaceEntity` records
- **Constraints**: Maximum 10 elements (enforced in business logic)
- **Default**: Empty array
- **Storage**: PostgreSQL JSONB column

### IMAGE Composite Type

**File**: `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/image.composite-type.ts`

**Structure**:
```typescript
import { FieldMetadataType } from 'twenty-shared/types';
import { CompositeType } from '../interfaces/composite-type.interface';

export const imageCompositeType: CompositeType = {
  type: FieldMetadataType.IMAGE,
  properties: [
    {
      name: 'attachmentIds',
      type: FieldMetadataType.ARRAY,
      targetColumnMap: {
        value: 'attachmentIds',
      },
      isRequired: true,
      defaultValue: [],
      description: 'Array of attachment UUIDs for image files (max 10)',
    },
  ],
};
```

**Properties**:
- `attachmentIds`: Array of UUID strings referencing `AttachmentWorkspaceEntity` records
- **Constraints**: Maximum 10 elements (enforced in business logic)
- **Default**: Empty array
- **Storage**: PostgreSQL JSONB column

### Composite Type Registration

**File**: `packages/twenty-server/src/engine/metadata-modules/field-metadata/composite-types/index.ts`

**Changes**:
```typescript
import { pdfCompositeType } from './pdf.composite-type';
import { imageCompositeType } from './image.composite-type';

export const compositeTypeDefinitions = new Map<
  FieldMetadataType,
  CompositeType
>([
  [FieldMetadataType.LINKS, linksCompositeType],
  [FieldMetadataType.CURRENCY, currencyCompositeType],
  [FieldMetadataType.FULL_NAME, fullNameCompositeType],
  [FieldMetadataType.ADDRESS, addressCompositeType],
  [FieldMetadataType.ACTOR, actorCompositeType],
  [FieldMetadataType.EMAILS, emailsCompositeType],
  [FieldMetadataType.PHONES, phonesCompositeType],
  [FieldMetadataType.RICH_TEXT_V2, richTextV2CompositeType],
  
  // New registrations
  [FieldMetadataType.PDF, pdfCompositeType],
  [FieldMetadataType.IMAGE, imageCompositeType],
]);
```

---

## 3. Attachment Entity (Reused)

### AttachmentWorkspaceEntity

**File**: `packages/twenty-server/src/modules/attachment/standard-objects/attachment.workspace-entity.ts`

**Schema** (existing, no changes):
```typescript
@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.attachment,
  namePlural: 'attachments',
  labelSingular: 'Attachment',
  labelPlural: 'Attachments',
})
export class AttachmentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({ type: FieldMetadataType.TEXT })
  name: string;                 // Original filename

  @WorkspaceField({ type: FieldMetadataType.TEXT })
  fullPath: string;             // S3 signed URL or storage path

  @WorkspaceField({ type: FieldMetadataType.TEXT })
  type: string;                 // MIME type (e.g., "application/pdf", "image/png")

  @WorkspaceRelation({ type: RelationType.MANY_TO_ONE })
  author: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('author')
  authorId: string | null;      // Creator of attachment

  // Existing relations to tasks, notes, etc.
  @WorkspaceRelation({ type: RelationType.MANY_TO_ONE })
  task: Relation<TaskWorkspaceEntity> | null;

  @WorkspaceJoinColumn('task')
  taskId: string | null;

  // ... other relations
}
```

**Usage for PDF/IMAGE Fields**:
- No new columns needed
- Attachments referenced via `attachmentIds` array in composite fields
- Lifecycle: Created on upload, deleted when removed from field

**Important**: Attachments are **never shared** across fields or objects (per FR-021). When an attachment is removed from a PDF/IMAGE field, it is deleted from storage immediately.

---

## 4. Database Schema

### Field Metadata Table

**Table**: `fieldMetadata` (existing, no schema changes)

**Example Row**:
```json
{
  "id": "field-uuid-1",
  "objectMetadataId": "object-uuid",
  "type": "PDF",
  "name": "contractDocuments",
  "label": "Contract Documents",
  "description": "PDF contracts for this deal",
  "isNullable": true,
  "isActive": true,
  "isCustom": true,
  "defaultValue": null,
  "settings": {},
  "workspaceId": "workspace-uuid"
}
```

### Object Data Table (Dynamic)

**Table**: `{workspace_id}.{object_name}` (e.g., `workspace_xyz.deal`)

**Example Columns**:
```sql
CREATE TABLE workspace_xyz.deal (
  id UUID PRIMARY KEY,
  name TEXT,
  
  -- PDF field (composite)
  "contractDocuments" JSONB DEFAULT '{"attachmentIds": []}'::jsonb,
  
  -- IMAGE field (composite)
  "productImages" JSONB DEFAULT '{"attachmentIds": []}'::jsonb,
  
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

**Example Data**:
```json
{
  "id": "deal-uuid-1",
  "name": "Acme Corp Deal",
  "contractDocuments": {
    "attachmentIds": [
      "attach-uuid-1",
      "attach-uuid-2",
      "attach-uuid-3"
    ]
  },
  "productImages": {
    "attachmentIds": [
      "attach-uuid-4",
      "attach-uuid-5"
    ]
  }
}
```

### Attachments Table

**Table**: `{workspace_id}.attachments` (existing, no changes)

**Schema**:
```sql
CREATE TABLE workspace_xyz.attachments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  "fullPath" TEXT NOT NULL,
  type TEXT NOT NULL,              -- MIME type
  "authorId" UUID REFERENCES workspace_xyz."workspaceMembers"(id),
  "taskId" UUID REFERENCES workspace_xyz.tasks(id),
  "noteId" UUID REFERENCES workspace_xyz.notes(id),
  -- ... other relations
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  "deletedAt" TIMESTAMP
);

CREATE INDEX idx_attachments_author ON workspace_xyz.attachments("authorId");
CREATE INDEX idx_attachments_task ON workspace_xyz.attachments("taskId");
```

**Example Rows**:
```json
[
  {
    "id": "attach-uuid-1",
    "name": "Contract_v1.pdf",
    "fullPath": "https://s3.../workspace_xyz/contracts/contract_v1.pdf",
    "type": "application/pdf",
    "authorId": "member-uuid-1",
    "taskId": null,
    "noteId": null,
    "createdAt": "2025-10-06T10:00:00Z",
    "updatedAt": "2025-10-06T10:00:00Z"
  },
  {
    "id": "attach-uuid-4",
    "name": "product_front.jpg",
    "fullPath": "https://s3.../workspace_xyz/images/product_front.jpg",
    "type": "image/jpeg",
    "authorId": "member-uuid-1",
    "taskId": null,
    "noteId": null,
    "createdAt": "2025-10-06T10:05:00Z",
    "updatedAt": "2025-10-06T10:05:00Z"
  }
]
```

---

## 5. GraphQL Type Mappings

### Auto-Generated Types

The GraphQL schema generator will create these types automatically:

**PdfField Type**:
```graphql
type PdfField {
  attachmentIds: [UUID!]!
}
```

**ImageField Type**:
```graphql
type ImageField {
  attachmentIds: [UUID!]!
}
```

**Object with PDF/IMAGE Fields** (example):
```graphql
type Deal {
  id: UUID!
  name: String
  contractDocuments: PdfField
  productImages: ImageField
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Resolvers

**Attachment Resolution** (custom resolver):
```typescript
// Automatically resolve attachmentIds to full Attachment objects
{
  contractDocuments: {
    attachmentIds: ["uuid-1", "uuid-2"],
    // Resolved via DataLoader
    attachments: [
      { id: "uuid-1", name: "Contract_v1.pdf", fullPath: "https://...", type: "application/pdf" },
      { id: "uuid-2", name: "Contract_v2.pdf", fullPath: "https://...", type: "application/pdf" }
    ]
  }
}
```

---

## 6. Validation Rules

### Field-Level Validation

**Rule**: Maximum 10 attachments per field  
**Enforcement**: Business logic in mutation resolver  
**Error**: `ValidationError: PDF fields support maximum 10 attachments`

**Implementation**:
```typescript
if (input.contractDocuments.attachmentIds.length > 10) {
  throw new ValidationError('PDF fields support maximum 10 attachments');
}
```

### File Type Validation

**Rule**: PDF fields only accept `application/pdf` MIME type  
**Enforcement**: Upload mutation validator  
**Error**: `ValidationError: Only PDF files are allowed for this field`

**Implementation**:
```typescript
const PDF_MIME_TYPES = ['application/pdf'];
if (!PDF_MIME_TYPES.includes(file.mimetype)) {
  throw new ValidationError('Only PDF files are allowed for this field');
}
```

**Rule**: IMAGE fields only accept image MIME types  
**Allowed**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`  
**Enforcement**: Upload mutation validator  
**Error**: `ValidationError: Only image files are allowed for this field`

**Implementation**:
```typescript
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
if (!IMAGE_MIME_TYPES.some(type => file.mimetype.startsWith(type))) {
  throw new ValidationError('Only image files are allowed for this field');
}
```

---

## 7. State Transitions

### Attachment Lifecycle

**States**:
1. **Uploaded**: File uploaded, attachment record created
2. **Associated**: Attachment ID added to field's `attachmentIds` array
3. **Removed**: Attachment ID removed from array
4. **Deleted**: Attachment record and file deleted from storage

**Transitions**:
```
[None] --upload--> [Uploaded] --associate--> [Associated]
[Associated] --remove--> [Removed] --delete--> [Deleted]
```

**Deletion Logic** (critical - per FR-021):
```typescript
// When attachment removed from field
async removeAttachmentFromField(fieldValue: PdfField, attachmentId: string) {
  // 1. Remove from attachmentIds array
  fieldValue.attachmentIds = fieldValue.attachmentIds.filter(id => id !== attachmentId);
  
  // 2. Delete attachment record (cascades to file storage)
  await attachmentRepository.delete(attachmentId);
  
  // Attachments are NEVER shared, so immediate deletion is safe
}
```

---

## 8. Query Patterns

### Fetching Records with PDF/IMAGE Fields

**Query**:
```graphql
query GetDeal($id: UUID!) {
  deal(id: $id) {
    id
    name
    contractDocuments {
      attachmentIds
    }
    productImages {
      attachmentIds
    }
  }
}
```

**With Attachment Details** (via custom resolver):
```graphql
query GetDealWithAttachments($id: UUID!) {
  deal(id: $id) {
    id
    name
    contractDocuments {
      attachments {
        id
        name
        fullPath
        type
        author {
          id
          name
        }
        createdAt
      }
    }
  }
}
```

### Filtering by Attachment Presence

**Query**:
```graphql
query GetDealsWithContracts {
  deals(filter: {
    contractDocuments: { attachmentIds: { isNotEmpty: true } }
  }) {
    edges {
      node {
        id
        name
        contractDocuments {
          attachmentIds
        }
      }
    }
  }
}
```

---

## 9. Relationships

### Entity Relationship Diagram

```
┌────────────────────┐
│  FieldMetadata     │
│  (metadata table)  │
│  ----------------  │
│  id: UUID          │
│  type: "PDF"       │
│  name: "contracts" │
└────────────────────┘
         │
         │ defines
         ▼
┌────────────────────┐       references        ┌──────────────────┐
│  Deal (object)     │────────────────────────▶│  Attachment      │
│  ----------------  │   (via attachmentIds)   │  --------------  │
│  id: UUID          │                         │  id: UUID        │
│  contracts: {      │◀─────────many-to-many───│  name: TEXT      │
│    attachmentIds:  │      (array in JSONB)   │  fullPath: TEXT  │
│    ["uuid-1",...]  │                         │  type: TEXT      │
│  }                 │                         │  authorId: UUID  │
└────────────────────┘                         └──────────────────┘
                                                        │
                                                        │ created by
                                                        ▼
                                               ┌──────────────────┐
                                               │ WorkspaceMember  │
                                               │  --------------  │
                                               │  id: UUID        │
                                               │  name: TEXT      │
                                               └──────────────────┘
```

**Key Points**:
- Field metadata defines the field type (PDF or IMAGE)
- Object table stores composite field with `attachmentIds` array
- Attachments table stores file metadata (reused across Twenty)
- No direct foreign keys (join via array membership)
- Deletion cascades: Field removed → attachments deleted

---

## 10. Performance Considerations

### Indexing Strategy

**Attachment Queries**:
- Existing `id` primary key index covers lookup by ID
- No additional indexes needed (queries are by ID list)

**Field Queries**:
- JSONB GIN index on composite columns for filtering (optional optimization)
```sql
CREATE INDEX idx_deal_contracts_gin ON workspace_xyz.deal 
USING GIN ("contractDocuments");
```

### Query Optimization

**DataLoader Pattern**:
```typescript
// Batch load attachments for multiple records
const attachmentLoader = new DataLoader(async (attachmentIds) => {
  const attachments = await attachmentRepository.findByIds(attachmentIds);
  return attachmentIds.map(id => attachments.find(a => a.id === id));
});

// Usage in resolver
const attachments = await Promise.all(
  field.attachmentIds.map(id => attachmentLoader.load(id))
);
```

**Benefits**:
- N+1 query prevention (single batch query vs. query per record)
- Caching within request lifecycle
- Handles 1000+ attachments efficiently

---

## Summary

**Data Model Highlights**:
- **2 new field types**: PDF and IMAGE (composite types)
- **0 new tables**: Reuses existing attachments infrastructure
- **0 schema migrations**: Composite fields stored as JSONB
- **Array semantics**: Up to 10 attachments per field
- **Immediate deletion**: Attachments removed when field updated (never shared)
- **Auto-generated APIs**: GraphQL and REST follow from field metadata

**Next Steps**: Generate API contracts (GraphQL schema, REST OpenAPI) in Phase 1.

