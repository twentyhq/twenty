import { z } from 'zod';

const aiRunScopeObjectPermissionSchema = z
  .object({
    objectUniversalIdentifier: z.string(),
    canReadObjectRecords: z.boolean().optional(),
    canUpdateObjectRecords: z.boolean().optional(),
    canSoftDeleteObjectRecords: z.boolean().optional(),
    canDestroyObjectRecords: z.boolean().optional(),
  })
  .strict();

const aiRunScopeFieldPermissionSchema = z
  .object({
    objectUniversalIdentifier: z.string(),
    fieldUniversalIdentifier: z.string(),
    canReadFieldValue: z.boolean().optional(),
    canUpdateFieldValue: z.boolean().optional(),
  })
  .strict();

// a role minus identity and row predicates: ungranted is denied, but members and system objects stay readable
export const aiRunScopeSchema = z
  .object({
    canReadAllObjectRecords: z.boolean().optional(),
    canUpdateAllObjectRecords: z.boolean().optional(),
    canSoftDeleteAllObjectRecords: z.boolean().optional(),
    canDestroyAllObjectRecords: z.boolean().optional(),
    canUpdateAllSettings: z.boolean().optional(),
    canAccessAllTools: z.boolean().optional(),
    objectPermissions: z.array(aiRunScopeObjectPermissionSchema).optional(),
    fieldPermissions: z.array(aiRunScopeFieldPermissionSchema).optional(),
    permissionFlagUniversalIdentifiers: z.array(z.string()).optional(),
  })
  .strict();
