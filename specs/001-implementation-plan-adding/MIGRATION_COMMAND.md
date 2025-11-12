# Composite Field Migration Command

## Quick Reference

### Command
```bash
npx nx run twenty-server:command workspace:fix-composite-field-columns
```

### Purpose
Adds missing database columns for composite field properties (IMAGE, PDF fields) that were defined in metadata but never created in the workspace database schema.

### When To Use
Run this command if you encounter:
- `column "fieldNameFullPaths" does not exist` errors
- `400 Bad Request` when updating IMAGE/PDF fields
- Data disappearing after page reload for composite fields
- Unable to create records with IMAGE/PDF fields

### What It Does
1. Scans all active workspaces
2. Identifies composite fields (IMAGE, PDF, etc.)
3. Checks for missing columns in the database schema
4. Adds missing columns with correct types and constraints
5. Reports number of columns added

### Command Options
```bash
# All workspaces
npx nx run twenty-server:command workspace:fix-composite-field-columns

# Specific workspace
npx nx run twenty-server:command workspace:fix-composite-field-columns -w <workspace-id>

# Start from specific workspace
npx nx run twenty-server:command workspace:fix-composite-field-columns --start-from-workspace-id <id>

# Limit number of workspaces
npx nx run twenty-server:command workspace:fix-composite-field-columns --workspace-count-limit 10
```

### Expected Output
```
[FixCompositeFieldColumnsCommand] Running composite field column fix for workspace: 3b8e6458-...
[FixCompositeFieldColumnsCommand] Added column sfdagFullPaths (jsonb) to workspace_xxx._deal
[FixCompositeFieldColumnsCommand] Added column sfdagNames (jsonb) to workspace_xxx._deal
[FixCompositeFieldColumnsCommand] Added column sfdagTypes (jsonb) to workspace_xxx._deal
[FixCompositeFieldColumnsCommand] Added 9 missing composite field columns for workspace 3b8e6458-...
```

### Safety
- ✅ Idempotent - safe to run multiple times
- ✅ Only adds missing columns, never removes or modifies existing ones
- ✅ Uses proper transaction management
- ✅ Validates workspace schema before operations

### Implementation Details

**Location**: `packages/twenty-server/src/engine/workspace-manager/workspace-sync-metadata/commands/fix-composite-field-columns.command.ts`

**Key Components**:
- Extends `ActiveOrSuspendedWorkspacesMigrationCommandRunner`
- Uses `QueryRunner` for safe database operations
- Maps field metadata types to PostgreSQL types
- Applies proper nullable/required constraints via `computeCompositeColumnName()`

**Composite Types Supported**:
- IMAGE (attachmentIds, fullPaths, names, types)
- PDF (attachmentIds, fullPaths, names, types)
- Any future composite types with RAW_JSON properties

### Related Documentation
- Full guide: [COMPOSITE_FIELD_MIGRATION_GUIDE.md](../../COMPOSITE_FIELD_MIGRATION_GUIDE.md)
- Implementation plan: [plan.md](./plan.md)
- Original bug report: [BUG_REPORT_IMAGE_PDF_PERSISTENCE_FAILURE.md](../../BUG_REPORT_IMAGE_PDF_PERSISTENCE_FAILURE.md)

### Troubleshooting

**No columns added**:
- Columns may already exist (command is idempotent)
- No IMAGE/PDF fields in workspace
- Check field metadata is active

**Permission errors**:
- Fixed in latest version by using QueryRunner
- Update to latest code if you see this error

**Columns still missing**:
- Check command output for errors
- Verify workspace ID
- Check PostgreSQL logs
- Run with specific workspace ID using `-w` flag

### Integration With Frontend

After running this command, the frontend IMAGE/PDF field components will work correctly:
- Data persists across page reloads
- No more 400 Bad Request errors
- Attachments remain linked to records
- Full metadata (paths, names, types) is stored

### Change History

**2025-10-06**: Initial creation
- Created command structure
- Added composite field column detection
- Implemented column creation with proper types
- Registered in workspace-sync-metadata-commands module
- Fixed AgentEntity metadata sync error
- Updated frontend IMAGE/PDF components

