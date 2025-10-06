# Quickstart Guide: PDF and Image Field Types

**Feature**: PDF and IMAGE field types validation  
**Date**: 2025-10-06  
**Purpose**: Step-by-step validation of all user scenarios from the feature specification

---

## Prerequisites

**Environment Setup**:
1. Twenty CRM instance running (backend + frontend)
2. Test workspace created with admin access
3. Test custom object created (e.g., "Deal" or "Product")
4. Sample files prepared:
   - 3 valid PDF files (<10MB each)
   - 5 valid image files (JPEG, PNG, GIF, WebP)
   - 1 invalid file (e.g., `.txt` or `.zip`)

**Authentication**:
- Admin user logged in for field creation scenarios
- Regular user logged in for file upload scenarios

**Test Data Cleanup**:
- Clear any existing test records before starting
- Delete previous test fields if re-running

---

## Scenario 1: Admin Creates PDF Field

**User Story**: As a workspace administrator, I want to add a PDF field to a custom object so that users can attach PDF documents to records.

### Steps

1. **Navigate to Settings > Data Model > [Object Name]**
   - Expected: Object settings page displays

2. **Click "Add Field" button**
   - Expected: Field creation modal opens

3. **Select "PDF" from field type dropdown**
   - Expected: PDF type is available in the list
   - Expected: Field type icon shows PDF symbol

4. **Fill in field details**:
   - Name: `contractDocuments`
   - Label: `Contract Documents`
   - Description: `Legal contracts for this deal`
   - Is Nullable: ✓ (checked)
   
5. **Click "Create Field"**
   - Expected: Field created successfully
   - Expected: Success notification displayed
   - Expected: Field appears in object schema list

6. **Verify field configuration**:
   - Expected: Field name = `contractDocuments`
   - Expected: Field type = `PDF`
   - Expected: Field marked as array/multiple files

### Validation

```bash
# GraphQL query to verify field creation
curl -X POST https://api.twenty.com/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { fieldMetadata(filter: {name: {eq: \"contractDocuments\"}}) { id type name label isNullable } }"
  }'

# Expected response:
# {
#   "data": {
#     "fieldMetadata": [{
#       "id": "field-uuid",
#       "type": "PDF",
#       "name": "contractDocuments",
#       "label": "Contract Documents",
#       "isNullable": true
#     }]
#   }
# }
```

**Success Criteria**: ✅ PDF field created and visible in object schema

---

## Scenario 2: Admin Creates IMAGE Field

**User Story**: As a workspace administrator, I want to add an Image field to a custom object so that users can attach product photos.

### Steps

1. **Navigate to Settings > Data Model > [Object Name]**
   - Expected: Object settings page displays

2. **Click "Add Field" button**
   - Expected: Field creation modal opens

3. **Select "Image" from field type dropdown**
   - Expected: IMAGE type is available in the list
   - Expected: Field type icon shows image symbol

4. **Fill in field details**:
   - Name: `productImages`
   - Label: `Product Images`
   - Description: `Photos of the product`
   - Is Nullable: ✓ (checked)
   
5. **Click "Create Field"**
   - Expected: Field created successfully
   - Expected: Success notification displayed
   - Expected: Field appears in object schema list

### Validation

```bash
# GraphQL query to verify field creation
curl -X POST https://api.twenty.com/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { fieldMetadata(filter: {name: {eq: \"productImages\"}}) { id type name label isNullable } }"
  }'

# Expected response:
# {
#   "data": {
#     "fieldMetadata": [{
#       "id": "field-uuid",
#       "type": "IMAGE",
#       "name": "productImages",
#       "label": "Product Images",
#       "isNullable": true
#     }]
#   }
# }
```

**Success Criteria**: ✅ IMAGE field created and visible in object schema

---

## Scenario 3: User Uploads Multiple PDFs

**User Story**: As an end user, I want to upload 3 PDF contracts to a deal record.

### Steps

1. **Navigate to record detail view**
   - Open a specific record (e.g., "Acme Corp Deal")
   - Expected: Record detail page displays with all fields

2. **Locate the "Contract Documents" PDF field**
   - Expected: Field shows empty state or "Drop files here" UI
   - Expected: Upload button or drag-drop zone visible

3. **Upload first PDF**:
   - Drag `Contract_v1.pdf` onto field OR click "Upload" and select file
   - Expected: Upload progress indicator appears
   - Expected: PDF file added to field with name and file size

4. **Upload second PDF**:
   - Drag `Contract_v2.pdf` onto field
   - Expected: Second PDF added below first
   - Expected: Both PDFs listed with names and sizes

5. **Upload third PDF**:
   - Click "Upload" and select `NDA.pdf`
   - Expected: Third PDF added to list
   - Expected: Total count shows "3 files"

6. **Verify file display**:
   - Expected: All 3 PDFs listed with:
     * File name
     * File size
     * Upload date
     * Download link
     * Remove button

### Validation

```bash
# GraphQL query to verify attachments
curl -X POST https://api.twenty.com/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { deal(id: \"record-uuid\") { contractDocuments { attachmentIds } } }"
  }'

# Expected response:
# {
#   "data": {
#     "deal": {
#       "contractDocuments": {
#         "attachmentIds": ["uuid-1", "uuid-2", "uuid-3"]
#       }
#     }
#   }
# }

# Fetch attachment details
curl -X POST https://api.twenty.com/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { attachments(ids: [\"uuid-1\", \"uuid-2\", \"uuid-3\"]) { id name type fullPath } }"
  }'

# Expected: 3 attachments with type "application/pdf"
```

**Success Criteria**: ✅ 3 PDFs uploaded and displayed correctly

---

## Scenario 4: User Uploads Invalid File Type

**User Story**: As a user, I want clear error messages when I try to upload the wrong file type.

### Steps

1. **Navigate to PDF field on a record**
   - Expected: PDF field upload zone visible

2. **Attempt to upload a non-PDF file** (e.g., `document.txt` or `image.jpg`):
   - Drag `document.txt` onto field
   - Expected: Upload rejected immediately
   - Expected: Error notification displayed: "Only PDF files are allowed for this field"
   - Expected: No file added to field

3. **Navigate to IMAGE field on a record**
   - Expected: Image field upload zone visible

4. **Attempt to upload a non-image file** (e.g., `contract.pdf`):
   - Drag `contract.pdf` onto field
   - Expected: Upload rejected immediately
   - Expected: Error notification displayed: "Only image files are allowed for this field"
   - Expected: No file added to field

### Validation

```bash
# REST API attempt (should fail)
curl -X POST https://api.twenty.com/rest/files/upload/pdf \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.txt"

# Expected response (400):
# {
#   "error": "ValidationError",
#   "message": "Only PDF files are allowed for this field",
#   "statusCode": 400
# }
```

**Success Criteria**: ✅ Invalid file types rejected with clear error messages

---

## Scenario 5: User Uploads 10 Images (Maximum Limit)

**User Story**: As a user, I want to upload multiple product images, respecting the 10-file maximum.

### Steps

1. **Navigate to IMAGE field on a record**
   - Expected: Image field upload zone visible

2. **Upload 10 images** (one at a time or batch):
   - Select 10 image files and upload
   - Expected: All 10 images uploaded successfully
   - Expected: Thumbnail previews displayed in grid
   - Expected: Count shows "10 files"

3. **Attempt to upload an 11th image**:
   - Drag additional image onto field
   - Expected: Upload rejected
   - Expected: Error notification: "Maximum 10 attachments per field reached"
   - Expected: Only 10 images remain in field

### Validation

```bash
# GraphQL mutation to test limit enforcement
curl -X POST https://api.twenty.com/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateDeal(id: \"record-uuid\", data: { productImages: { attachmentIds: [\"uuid-1\", \"uuid-2\", \"uuid-3\", \"uuid-4\", \"uuid-5\", \"uuid-6\", \"uuid-7\", \"uuid-8\", \"uuid-9\", \"uuid-10\", \"uuid-11\"] } }) { productImages { attachmentIds } } }"
  }'

# Expected response (400):
# {
#   "errors": [{
#     "message": "PDF fields support maximum 10 attachments",
#     "extensions": { "code": "VALIDATION_ERROR" }
#   }]
# }
```

**Success Criteria**: ✅ 10-file limit enforced, 11th upload rejected

---

## Scenario 6: User Views and Downloads Attachments

**User Story**: As a user, I want to view image thumbnails and download files.

### Steps

1. **Navigate to record with IMAGE field containing 5 images**
   - Expected: 5 thumbnail previews displayed in grid layout
   - Expected: Each thumbnail shows partial image preview

2. **Click on first image thumbnail**:
   - Expected: Image opens in lightbox/modal at full size
   - Expected: Navigation arrows to view other images
   - Expected: Close button to exit lightbox

3. **Navigate through images in lightbox**:
   - Click next arrow
   - Expected: Second image displayed
   - Repeat through all 5 images

4. **Click download button on image**:
   - Expected: Image file downloaded to device
   - Expected: Filename matches original upload name

5. **Navigate to record with PDF field containing 3 PDFs**
   - Expected: 3 PDF files listed with names and sizes

6. **Click on first PDF file name**:
   - Expected: PDF opens in new browser tab OR embedded viewer
   - Expected: PDF content displayed correctly

7. **Click download button on PDF**:
   - Expected: PDF file downloaded to device

### Validation

```bash
# Verify download URLs are accessible
curl -I "https://s3.../workspace_xyz/contracts/contract_v1.pdf?signature=..."

# Expected response: 200 OK with proper headers
```

**Success Criteria**: ✅ Images viewable in lightbox, all files downloadable

---

## Scenario 7: User Removes Attachments from Field

**User Story**: As a user, I want to remove attachments I no longer need.

### Steps

1. **Navigate to record with PDF field containing 3 PDFs**
   - Expected: 3 PDFs listed

2. **Click remove/delete button on second PDF** (`Contract_v2.pdf`):
   - Expected: Confirmation dialog (optional)
   - Confirm deletion
   - Expected: PDF immediately removed from list
   - Expected: Count updates to "2 files"

3. **Verify remaining PDFs**:
   - Expected: Only `Contract_v1.pdf` and `NDA.pdf` remain
   - Expected: Order maintained

4. **Attempt to access removed PDF**:
   - Use direct URL from previous step
   - Expected: 404 Not Found (file deleted from storage)

### Validation

```bash
# Verify attachment deleted from database
curl -X POST https://api.twenty.com/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { attachment(id: \"removed-uuid\") { id name } }"
  }'

# Expected response: null or 404 error
```

**Success Criteria**: ✅ Attachment removed from field and deleted from storage

---

## Scenario 8: Workflow Triggers on PDF Upload

**User Story**: As a workspace admin, I want workflows to trigger when users upload PDFs to specific fields.

### Steps

**Setup**:
1. **Create workflow in workflow builder**:
   - Trigger: "Deal updated"
   - Condition: Field "contractDocuments" changed
   - Action: Send email to deal owner with subject "New contract uploaded"

2. **Activate workflow**

**Execution**:
3. **Navigate to a deal record**
   - Expected: Deal detail page displays

4. **Upload a new PDF to "Contract Documents" field**:
   - Upload `NewContract.pdf`
   - Expected: PDF uploaded successfully

5. **Wait 5-10 seconds for workflow processing**

6. **Check workflow execution logs** (Admin > Workflows > Executions):
   - Expected: New execution record for "Deal updated" workflow
   - Expected: Status: Success
   - Expected: Trigger payload includes:
     * Updated field name: `contractDocuments`
     * New attachmentIds array
     * Record ID and object type

7. **Verify workflow action executed**:
   - Check email inbox for deal owner
   - Expected: Email received with subject "New contract uploaded"

### Validation

```bash
# Query workflow executions
curl -X POST https://api.twenty.com/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { workflowRuns(filter: { recordId: { eq: \"deal-uuid\" } }, orderBy: { createdAt: DESC }, first: 1) { edges { node { id status trigger { updatedFields } } } } }"
  }'

# Expected: Recent workflow run with "contractDocuments" in updatedFields
```

**Success Criteria**: ✅ Workflow triggers and executes when PDF field updated

---

## Scenario 9: Concurrent Uploads from Multiple Users

**User Story**: As the system, I want to handle 10 users uploading files simultaneously without errors.

### Steps

**Setup**:
1. Prepare 10 test user accounts
2. Prepare 50 test files (5 per user)
3. Create test script to simulate concurrent uploads

**Execution**:
```bash
# Concurrent upload test script (pseudo-code)
for i in {1..10}; do
  (
    TOKEN=$(get_user_token "user$i")
    for file in test_files/user$i/*; do
      curl -X POST https://api.twenty.com/rest/files/upload/pdf \
        -H "Authorization: Bearer $TOKEN" \
        -F "file=@$file" &
    done
    wait
  ) &
done
wait

echo "All uploads complete"
```

**Validation**:
1. **Check all files uploaded successfully**:
   - Expected: 50 attachments created (5 per user × 10 users)
   - Expected: No errors in server logs
   - Expected: No file corruption

2. **Verify server performance**:
   - Expected: Response times < 5 seconds per upload
   - Expected: Server memory stable (no leaks)
   - Expected: CPU usage returns to baseline after completion

3. **Check database consistency**:
   - Expected: All attachments have valid IDs
   - Expected: All attachments linked to correct records
   - Expected: No orphaned files in storage

### Validation

```bash
# Count total attachments created in test window
curl -X POST https://api.twenty.com/graphql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { attachments(filter: { createdAt: { gte: \"2025-10-06T10:00:00Z\" } }) { totalCount } }"
  }'

# Expected: totalCount = 50
```

**Success Criteria**: ✅ 10 concurrent users upload files successfully, system remains stable

---

## Edge Case Testing

### Edge Case 1: Maximum File Size

**Test**: Upload a 100MB PDF file  
**Expected**: Upload rejected with error "File size exceeds maximum allowed (10MB)"

### Edge Case 2: Corrupted File

**Test**: Upload a corrupted PDF (e.g., truncated file)  
**Expected**: Upload accepted (MIME validation passes), but preview may fail gracefully

### Edge Case 3: Special Characters in Filename

**Test**: Upload file named `Contract (v2.1) [FINAL]!.pdf`  
**Expected**: Filename sanitized, file uploaded successfully, display shows original name

### Edge Case 4: Network Interruption During Upload

**Test**: Start upload, disconnect network mid-transfer  
**Expected**: Upload fails with timeout error, no partial attachment created, user can retry

### Edge Case 5: Delete Record with Attachments

**Test**: Delete a record that has 5 PDFs attached  
**Expected**: All 5 attachments deleted from storage (cascade), no orphaned files

---

## Automated Test Execution

### Run All Integration Tests

```bash
# Navigate to repository root
cd /Users/connor/Dev/MIQ/backoffice

# Run backend integration tests
bun nx test twenty-server --testPathPattern=pdf-field
bun nx test twenty-server --testPathPattern=image-field

# Run frontend E2E tests
bun nx e2e twenty-e2e-testing --grep "PDF field"
bun nx e2e twenty-e2e-testing --grep "Image field"

# Run workflow integration tests
bun nx test twenty-server --testPathPattern=workflow.*pdf
```

### Expected Results

- ✅ All contract tests pass (GraphQL schema validated)
- ✅ All unit tests pass (composite types, validators)
- ✅ All integration tests pass (upload, download, delete)
- ✅ All E2E tests pass (user scenarios 1-8)
- ✅ Performance tests pass (scenario 9)

---

## Success Checklist

**Admin Scenarios**:
- [ ] Admin can create PDF field on custom object
- [ ] Admin can create IMAGE field on custom object
- [ ] PDF and IMAGE appear in field type dropdown
- [ ] Fields visible in object schema after creation

**User Upload Scenarios**:
- [ ] User can upload multiple PDFs (up to 10)
- [ ] User can upload multiple images (up to 10)
- [ ] Invalid file types rejected with clear errors
- [ ] 10-file limit enforced on 11th upload attempt
- [ ] Upload progress indicators work correctly

**Display Scenarios**:
- [ ] PDFs listed with name, size, date, download link
- [ ] Images shown as thumbnail previews in grid
- [ ] Image lightbox opens on thumbnail click
- [ ] PDFs preview in new tab or embedded viewer
- [ ] Download buttons work for all file types

**Management Scenarios**:
- [ ] User can remove individual attachments
- [ ] Removed attachments deleted from storage immediately
- [ ] Field count updates correctly when files added/removed
- [ ] No orphaned files after deletion

**Workflow Scenarios**:
- [ ] Workflow triggers on PDF field update
- [ ] Workflow triggers on IMAGE field update
- [ ] Trigger payload includes updated field name
- [ ] Workflow actions can access attachment metadata

**Performance Scenarios**:
- [ ] 10 concurrent uploads complete successfully
- [ ] Server remains stable under load
- [ ] Response times < 5 seconds per upload
- [ ] No memory leaks or resource exhaustion

**API Scenarios**:
- [ ] GraphQL queries return PDF/IMAGE field data
- [ ] REST API exposes PDF/IMAGE fields correctly
- [ ] Filtering works (isEmpty, isNotEmpty, contains)
- [ ] Batch attachment retrieval optimized

---

## Rollback Plan

If critical issues discovered during validation:

1. **Feature Flag**: Disable PDF/IMAGE field types in UI (hide from dropdown)
2. **Database**: Existing data preserved (no migrations to rollback)
3. **Investigation**: Review logs, reproduce issues, file bugs
4. **Re-enable**: After fixes validated, re-enable feature flag

---

## Next Steps After Validation

1. **Performance Monitoring**: Track upload times, query performance
2. **User Feedback**: Collect feedback from pilot users
3. **Documentation**: Update user guide with PDF/IMAGE field instructions
4. **Training**: Create tutorial videos for admins and users
5. **Scale Testing**: Test with larger datasets (100+ attachments per record)

---

**Validation Complete**: If all scenarios pass, feature is ready for production release! 🎉

