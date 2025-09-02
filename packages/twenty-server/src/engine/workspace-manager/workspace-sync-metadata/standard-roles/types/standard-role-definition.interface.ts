import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export type StandardRoleDefinition = Omit<
  FlatRole,
  'id' | 'workspaceId' | 'universalIdentifier' | 'standardId'
> & {
  standardId: string;
};
