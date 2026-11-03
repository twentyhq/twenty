import { rolePermissionGrantsSchema } from '@/application/rolePermissionGrantsSchema';

// ungranted is denied, but members and system objects stay readable
export const aiRunScopeSchema = rolePermissionGrantsSchema.omit({
  canAccessAllAgentChatChannels: true,
});
