import {
  type ApplicationManifest,
  type ObjectManifest,
  type LogicFunctionManifest,
  type AssetManifest,
  type FrontComponentManifest,
  type RoleManifest,
  type FieldManifest,
} from '@/application';
import { type Sources } from '@/types';
import { type PackageJson } from 'type-fest';

export type Manifest = {
  application: ApplicationManifest;
  objects: ObjectManifest[];
  fields: FieldManifest[];
  logicFunctions: LogicFunctionManifest[];
  frontComponents: FrontComponentManifest[];
  roles: RoleManifest[];
  publicAssets: AssetManifest[];
  sources: Sources;
  packageJson: PackageJson;
  packageJsonChecksum: string | null;
  yarnLockChecksum: string | null;
};
