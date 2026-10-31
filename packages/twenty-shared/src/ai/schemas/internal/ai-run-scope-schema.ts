import { rolePermissionGrantsSchema } from '@/application/rolePermissionGrantsSchema';

// ungranted is denied, but members and system objects stay readable; chat channel access never applies to a run
export const aiRunScopeSchema = rolePermissionGrantsSchema.omit({
  canAccessAllAgentChatChannels: true,
});
