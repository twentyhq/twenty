import { z } from 'zod';

export const rolePermissionsSchema = z.object({
  canUpdateAllSettings: z
    .boolean()
    .optional()
    .describe('Grants full settings/admin access'),
  canAccessAllTools: z
    .boolean()
    .optional()
    .describe('Grants access to all workspace tools'),
  canReadAllObjectRecords: z
    .boolean()
    .optional()
    .describe('Default read access on all objects'),
  canUpdateAllObjectRecords: z
    .boolean()
    .optional()
    .describe('Default update access on all objects'),
  canSoftDeleteAllObjectRecords: z
    .boolean()
    .optional()
    .describe('Default soft-delete access on all objects'),
  canDestroyAllObjectRecords: z
    .boolean()
    .optional()
    .describe('Default destroy access on all objects'),
  canBeAssignedToUsers: z
    .boolean()
    .optional()
    .describe('Whether the role can be assigned to users'),
  canBeAssignedToAgents: z
    .boolean()
    .optional()
    .describe('Whether the role can be assigned to AI agents'),
  canBeAssignedToApiKeys: z
    .boolean()
    .optional()
    .describe('Whether the role can be assigned to API keys'),
});
