import { type AgentManifest } from './agentManifestType';
import { type ApplicationManifest } from './applicationType';
import { type AssetManifest } from './assetManifestType';
import { type ConnectionProviderManifest } from './connectionProviderManifestType';
import { type FieldManifest } from './fieldManifestType';
import {
  type CommandMenuItemManifest,
  type FrontComponentManifest,
} from './frontComponentManifestType';
import { type LogicFunctionManifest } from './logicFunctionManifestType';
import { type NavigationMenuItemManifest } from './navigationMenuItemManifestType';
import { type ObjectManifest } from './objectManifestType';
import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
} from './pageLayoutManifestType';
import { type RoleManifest } from './roleManifestType';
import { type SkillManifest } from './skillManifestType';
import { type ViewManifest } from './viewManifestType';

export type Manifest = {
  application: ApplicationManifest;
  objects: ObjectManifest[];
  fields: FieldManifest[];
  logicFunctions: LogicFunctionManifest[];
  frontComponents: FrontComponentManifest[];
  roles: RoleManifest[];
  skills: SkillManifest[];
  agents: AgentManifest[];
  connectionProviders?: ConnectionProviderManifest[];
  publicAssets: AssetManifest[];
  views: ViewManifest[];
  navigationMenuItems: NavigationMenuItemManifest[];
  pageLayouts: PageLayoutManifest[];
  pageLayoutTabs: PageLayoutTabManifest[];
  // Standalone command menu items declared via defineCommandMenuItem.
  // Optional so older manifests continue to type-check without this array.
  commandMenuItems?: CommandMenuItemManifest[];
};
