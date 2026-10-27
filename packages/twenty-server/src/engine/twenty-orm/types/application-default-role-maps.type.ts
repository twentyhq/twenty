import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type ApplicationDefaultRoleMaps = {
  byId: Partial<
    Record<string, Pick<FlatApplication, 'id' | 'defaultRoleId' | 'deletedAt'>>
  >;
};
