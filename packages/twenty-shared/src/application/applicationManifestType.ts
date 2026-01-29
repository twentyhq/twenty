import {
  type PackageJson,
  type Application,
  type ObjectManifest,
  type LogicFunctionManifest,
  type AssetManifest,
  type FrontComponentManifest,
  type RoleManifest,
  type FieldManifest,
} from '@/application';
import { type Sources } from '@/types';

export type ApplicationManifest = {
  application: Application;
  entities: {
    objects: ObjectManifest[];
    fields: FieldManifest[];
    logicFunctions: LogicFunctionManifest[];
    frontComponents: FrontComponentManifest[];
    roles: RoleManifest[];
  };
  publicAssets: AssetManifest[];
  sources: Sources;
  packageJson: PackageJson;
  yarnLock: string;
};
