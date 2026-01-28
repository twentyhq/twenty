import {
  type PackageJson,
  type Application,
  type ObjectManifest,
  type LogicFunctionManifest,
} from '@/application';
import { type FrontComponentManifest } from '@/application/frontComponentManifestType';
import { type ObjectExtensionManifest } from '@/application/objectExtensionManifestType';
import { type RoleManifest } from '@/application/roleManifestType';
import { type Sources } from '@/types';

export type ApplicationManifest = {
  application: Application;
  objects: ObjectManifest[];
  objectExtensions?: ObjectExtensionManifest[];
  functions: LogicFunctionManifest[];
  frontComponents: FrontComponentManifest[];
  roles?: RoleManifest[];
  sources: Sources;
  packageJson: PackageJson;
  yarnLock: string;
};
