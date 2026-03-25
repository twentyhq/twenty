import { type CommandMenuContextApiPageType } from './CommandMenuContextApiPageType';
import { type ObjectPermissions } from './ObjectPermissions';
import { type ObjectRecord } from './ObjectRecord';

export type CommandMenuContextApi = {
  pageType: CommandMenuContextApiPageType;
  isInSidePanel: boolean;
  isPageInEditMode: boolean;
  favoriteRecordIds: string[];
  isSelectAll: boolean;
  hasAnySoftDeleteFilterOnView: boolean;
  numberOfSelectedRecords: number;
  objectPermissions: ObjectPermissions & { objectMetadataId: string };
  selectedRecords: ObjectRecord[];
  featureFlags: Record<string, boolean>;
  targetObjectReadPermissions: Record<string, boolean>;
  targetObjectWritePermissions: Record<string, boolean>;
  objectMetadataItem: Record<string, unknown>;
};
