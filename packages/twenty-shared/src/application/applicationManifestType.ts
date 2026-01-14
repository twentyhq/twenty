import {
  type ObjectManifest,
  type ServerlessFunctionManifest,
  type Application,
} from '@/application';
import { type ObjectExtensionManifest } from '@/application/objectExtensionManifestType';
import { type RoleManifest } from '@/application/roleManifestType';
import { type Sources } from '@/types';

export type ApplicationManifest = {
  application: Application;
  objects: ObjectManifest[];
  objectExtensions?: ObjectExtensionManifest[];
  serverlessFunctions: ServerlessFunctionManifest[];
  roles?: RoleManifest[];
  sources: Sources;
};
