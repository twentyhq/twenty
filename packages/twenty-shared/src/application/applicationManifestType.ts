import {
  type ObjectManifest,
  type ServerlessFunctionManifest,
  type Application,
} from '@/application';
import { type Sources } from '@/types';

export type ApplicationManifest = {
  application: Application;
  objects: ObjectManifest[];
  serverlessFunctions: ServerlessFunctionManifest[];
  sources: Sources;
};
