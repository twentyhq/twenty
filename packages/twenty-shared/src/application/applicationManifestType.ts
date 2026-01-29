import {
  type PackageJson,
  type Application,
  type ObjectManifest,
  type LogicFunctionManifest,
} from '@/application';
import { type AssetManifest } from '@/application/assetManifestType';
import { type FrontComponentManifest } from '@/application/frontComponentManifestType';
import { type ObjectExtensionManifest } from '@/application/objectExtensionManifestType';
import { type RoleManifest } from '@/application/roleManifestType';
import { type Sources } from '@/types';

export type ApplicationManifest = {
  application: Application;
  entities: {
    objects: ObjectManifest[];
    objectExtensions: ObjectExtensionManifest[];
    logicFunctions: LogicFunctionManifest[];
    frontComponents: FrontComponentManifest[];
    roles: RoleManifest[];
    publicAssets: AssetManifest[];
  };
  sources: Sources;
  packageJson: PackageJson;
  yarnLock: string;
};
