import { z } from 'zod';

export const objectPermissionGrantSchema = z.strictObject({
  objectUniversalIdentifier: z.string(),
  canReadObjectRecords: z.boolean().optional(),
  canUpdateObjectRecords: z.boolean().optional(),
  canSoftDeleteObjectRecords: z.boolean().optional(),
  canDestroyObjectRecords: z.boolean().optional(),
});

export const fieldPermissionGrantSchema = z.strictObject({
  objectUniversalIdentifier: z.string(),
  fieldUniversalIdentifier: z.string(),
  canReadFieldValue: z.boolean().optional(),
  canUpdateFieldValue: z.boolean().optional(),
});

// what a role allows, without its identity or row-level predicates
export const rolePermissionGrantsSchema = z.strictObject({
  canReadAllObjectRecords: z.boolean().optional(),
  canUpdateAllObjectRecords: z.boolean().optional(),
  canSoftDeleteAllObjectRecords: z.boolean().optional(),
  canDestroyAllObjectRecords: z.boolean().optional(),
  canUpdateAllSettings: z.boolean().optional(),
  canAccessAllTools: z.boolean().optional(),
  canAccessAllAgentChatChannels: z.boolean().optional(),
  objectPermissions: z.array(objectPermissionGrantSchema).optional(),
  fieldPermissions: z.array(fieldPermissionGrantSchema).optional(),
  permissionFlagUniversalIdentifiers: z.array(z.string()).optional(),
});

export type ObjectPermissionGrant = z.infer<typeof objectPermissionGrantSchema>;

export type FieldPermissionGrant = z.infer<typeof fieldPermissionGrantSchema>;

export type RolePermissionGrants = z.infer<typeof rolePermissionGrantsSchema>;
