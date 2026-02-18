import { type ApplicationManifest } from './applicationType';
import { type AssetManifest } from './assetManifestType';
import { type FieldManifest } from './fieldManifestType';
import { type FrontComponentManifest } from './frontComponentManifestType';
import { type LogicFunctionManifest } from './logicFunctionManifestType';
import { type NavigationMenuItemManifest } from './navigationMenuItemManifestType';
import { type ObjectManifest } from './objectManifestType';
import { type PageLayoutManifest } from './pageLayoutManifestType';
import { type RoleManifest } from './roleManifestType';
import { type ViewManifest } from './viewManifestType';

export type Manifest = {
  application: ApplicationManifest;
  objects: ObjectManifest[];
  fields: FieldManifest[];
  logicFunctions: LogicFunctionManifest[];
  frontComponents: FrontComponentManifest[];
  roles: RoleManifest[];
  publicAssets: AssetManifest[];
  views: ViewManifest[];
  navigationMenuItems: NavigationMenuItemManifest[];
  pageLayouts: PageLayoutManifest[];
};
