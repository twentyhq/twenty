import { rolePermissionGrantsSchema } from '@/application/rolePermissionGrantsSchema';

// a role without identity or row predicates: ungranted is denied, but members and system objects stay readable.
// Chat channel access is left out: it decides which channels a role's members see, which a run never does
export const aiRunScopeSchema = rolePermissionGrantsSchema.omit({
  canAccessAllAgentChatChannels: true,
});
