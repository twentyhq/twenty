import { type ApplicationWithRuntimeRole } from 'src/engine/core-modules/application/application-grant/utils/get-application-runtime-role-id.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type ApplicationDefaultRoleMaps = {
  byId: Partial<
    Record<
      string,
      Pick<FlatApplication, 'id' | 'deletedAt'> & ApplicationWithRuntimeRole
    >
  >;
};
