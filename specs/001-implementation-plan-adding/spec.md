# Feature Specification: PDF and Image Field Types

**Feature Branch**: `001-implementation-plan-adding`  
**Created**: 2025-10-06  
**Status**: Ready for Planning  
**Input**: User description: "Implementation plan: adding PDF and Image field types to Twenty"

## Execution Flow (main)
```
1. Parse user description from Input
   → Feature: Add PDF and IMAGE as first-class custom field types
2. Extract key concepts from description
   → Actors: workspace admins, end users, workflow engine
   → Actions: create custom fields, upload files, view/download files, trigger workflows
   → Data: PDF files, image files, file metadata, attachment references
   → Constraints: file type validation, multiple files per field, reuse existing attachment storage
3. For each unclear aspect:
   → All key aspects specified in detailed implementation plan
4. Fill User Scenarios & Testing section
   → Clear user flows identified for admin and end user
5. Generate Functional Requirements
   → All requirements derived from implementation plan
6. Identify Key Entities (if data involved)
   → Entities: Field Metadata, Attachments, Join Table for field values
7. Run Review Checklist
   → No implementation details included (focused on WHAT, not HOW)
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story
As a workspace administrator, I want to add PDF and Image fields to custom objects so that users can attach relevant documents and pictures directly to their records (e.g., contracts to deals, product images to inventory items).

As an end user, I want to upload multiple PDFs or images to these custom fields, view them inline or as previews, download them when needed, and have them automatically trigger workflows when changed.

### Acceptance Scenarios

#### Admin Field Creation
1. **Given** I am a workspace administrator viewing the object builder, **When** I create a new custom field and select "PDF" or "Image" as the field type, **Then** the system allows me to configure the field name, label, and marks it as supporting multiple files by default.

2. **Given** I have created a PDF field on a "Contract" object, **When** I save the field configuration, **Then** the field appears in the object schema and is available for users to populate with PDF files.

#### End User File Upload
3. **Given** I am viewing a record with a PDF field, **When** I drag and drop three PDF files onto the field or use the file picker, **Then** all three files are uploaded and displayed with their names and file sizes.

4. **Given** I am uploading files to an Image field, **When** I attempt to upload a PDF file, **Then** the system rejects the file and displays an error message indicating only image files are allowed.

5. **Given** I have uploaded multiple images to an Image field, **When** I view the record, **Then** thumbnail previews of all images are displayed, and I can click to view them in a larger preview or download them.

#### File Management
6. **Given** I have uploaded files to a PDF or Image field, **When** I remove one or more attachments, **Then** the removed files no longer appear in the field and are deleted from storage immediately.

7. **Given** I have PDF attachments on a record, **When** I click on a PDF file name, **Then** the PDF opens in a new tab or viewer for preview.

8. **Given** I have already uploaded 10 images to an Image field (the maximum), **When** I attempt to upload an additional image, **Then** the system rejects the upload and displays an error message indicating the maximum limit has been reached.

#### Workflow Integration
9. **Given** I have created a workflow trigger on "PDF field updated", **When** a user uploads a new PDF to that field, **Then** the workflow executes automatically with access to the uploaded file metadata.

10. **Given** I have a workflow action to "send email with attachments", **When** the workflow runs, **Then** the PDFs or images from the specified field are attached to the email.

### Edge Cases
- What happens when a user uploads a file that exceeds the maximum file size limit?
- What happens when a user tries to upload more than the 10-file maximum to a single field?
- How does the system handle corrupted or unreadable image/PDF files?
- What happens when a user's browser loses connection during a file upload?
- How does the system handle special characters or very long file names?
- What happens when 10 users simultaneously upload files to different records?

---

## Requirements

### Functional Requirements

#### Field Type Management
- **FR-001**: System MUST allow workspace administrators to create custom fields of type "PDF" on any object.
- **FR-002**: System MUST allow workspace administrators to create custom fields of type "Image" on any object.
- **FR-003**: System MUST mark PDF and Image fields as supporting multiple files (array) by default.
- **FR-004**: System MUST display PDF and Image as available field types in the object builder UI alongside existing types (Text, Number, Date, etc.).

#### File Upload & Validation
- **FR-005**: System MUST allow users to upload multiple files (up to 10) to a PDF field via drag-and-drop or file picker.
- **FR-006**: System MUST allow users to upload multiple files (up to 10) to an Image field via drag-and-drop or file picker.
- **FR-007**: System MUST validate that files uploaded to a PDF field are valid PDF documents (MIME type: application/pdf).
- **FR-008**: System MUST validate that files uploaded to an Image field are valid image files (MIME types: image/jpeg, image/png, image/gif, image/webp, etc.).
- **FR-009**: System MUST reject files that do not match the field's required type and display a clear error message to the user.
- **FR-010**: System MUST enforce a maximum of 10 attachments per PDF or Image field and reject additional uploads with an appropriate error message.
- **FR-011**: System MUST store file metadata including file name, size, MIME type, and upload timestamp.
- **FR-012**: System MUST reuse the existing attachment storage mechanism rather than creating duplicate storage.

#### File Display & Access
- **FR-013**: System MUST display uploaded PDF files with file names, icons, and file sizes in record detail views.
- **FR-014**: System MUST display uploaded images as thumbnail previews in record detail views.
- **FR-015**: System MUST allow users to click on image thumbnails to view full-size previews in a lightbox or modal.
- **FR-016**: System MUST allow users to click on PDF file names to open/preview the PDF in a new tab or embedded viewer.
- **FR-017**: System MUST provide download links for all uploaded files.
- **FR-018**: System MUST display file metadata (name, size, upload date) for each attachment in a field.

#### File Management
- **FR-019**: System MUST allow users to remove individual files from a PDF or Image field.
- **FR-020**: System MUST update the field value when files are added or removed.
- **FR-021**: System MUST delete attachments from storage immediately when they are removed from a field, as attachments are never shared across fields or objects.
- **FR-022**: System MUST maintain referential integrity between records and their attachments.

#### API & Data Access
- **FR-023**: System MUST expose PDF and Image field values through the GraphQL API as arrays of attachment objects.
- **FR-024**: System MUST expose PDF and Image field values through the REST API as arrays of attachment objects.
- **FR-025**: System MUST return file metadata (id, name, MIME type, size) and download URLs in API responses.
- **FR-026**: System MUST accept file uploads via API mutations/endpoints.
- **FR-027**: System MUST accept attachment IDs via API for associating existing attachments with fields.

#### Workflow Engine Integration
- **FR-028**: System MUST support PDF and Image fields in workflow trigger conditions (e.g., "when PDF uploaded", "when Image field changes").
- **FR-029**: System MUST provide workflow actions to access attachment metadata and URLs.
- **FR-030**: System MUST support workflow actions that use PDF/Image attachments (e.g., send email with attachments, copy attachments between records).
- **FR-031**: System MUST treat PDF and Image fields as arrays in workflow expressions and conditions.
- **FR-032**: System MUST provide functions to check the number of attachments, iterate through them, or filter by properties in workflows.

#### Permissions & Security
- **FR-033**: System MUST use existing object-level permissions for PDF and Image fields without additional field-specific permissions.
- **FR-034**: System MUST validate file types on the server side to prevent malicious file uploads.
- **FR-035**: System MUST sanitize file names to prevent path traversal or injection attacks.

#### Performance & Scalability
- **FR-036**: System MUST handle fields with up to 10 attachments (the enforced maximum) without performance degradation.
- **FR-037**: System MUST support at least 10 concurrent file uploads across different users and records.

#### Backward Compatibility
- **FR-038**: System MUST maintain compatibility with existing attachment functionality for tasks, notes, and other objects.
- **FR-039**: System MUST NOT break existing custom fields or object schemas when PDF/Image types are added.

### Key Entities

- **Field Metadata**: Represents the configuration of a custom field, including its type (PDF or IMAGE), name, label, and settings (e.g., isArray flag). Each field metadata record defines a field available on an object.

- **Attachment**: Represents an uploaded file with metadata such as file name, file path, MIME type, size, and timestamps. Each attachment is unique to a specific field on a specific record and is never shared across fields or objects.

- **Field Value Join**: Represents the association between a specific record, a field on that record, and one or more attachments (up to 10 per field). This entity stores references (IDs) linking records to their uploaded files for PDF and Image fields.

- **Object Record**: Represents a row of data in a custom object (e.g., a specific "Deal" or "Product"). Records have fields, and some fields (PDF/Image) reference attachments.

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded (PDF and Image fields only, reusing existing attachment infrastructure)
- [x] Dependencies and assumptions identified (assumes existing attachment module is functional)

**Clarifications Resolved**:
- Attachments are never shared across fields or objects (FR-021)
- Use existing object-level permissions only, no field-specific permissions (FR-033)
- Maximum of 10 attachments per field (FR-010, FR-036)
- Support at least 10 concurrent uploads (FR-037)

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed (all clarifications resolved)

---

## Notes for Planning Phase

**Assumptions**:
- Existing attachment upload, storage, and download mechanisms are fully functional.
- The current field metadata system supports adding new field types without breaking changes.
- GraphQL and REST APIs are dynamically generated based on field metadata.
- The UI already has reusable file upload and preview components that can be adapted.

**Dependencies**:
- Attachment module must be stable and support referencing attachments from multiple sources.
- Field metadata infrastructure must support array-type fields.
- Workflow engine must support custom field types as trigger sources and action inputs.

**Scope Boundaries**:
- This feature does NOT introduce new storage backends; it reuses existing attachment storage.
- This feature does NOT support inline editing of PDFs or images (viewing/downloading only).
- This feature does NOT include OCR, image processing, or PDF parsing capabilities.
- Initial rollout may be behind a feature flag for gradual adoption.

**Risks**:
- Large file uploads may impact server performance and require streaming or chunking.
- Query performance should be monitored when loading records with the maximum 10 attachments per field.

**Success Metrics**:
- Workspace admins successfully create PDF and Image fields on custom objects.
- Users upload and view files without errors in >95% of attempts.
- Workflows correctly trigger on PDF/Image field changes.
- No performance degradation observed on records with up to 10 attachments per field.
- System successfully handles at least 10 concurrent uploads from different users.
