import { type ContextStorePageType } from './ContextStorePageType';
import { type ObjectPermissions } from './ObjectPermissions';
import { type ObjectRecord } from './ObjectRecord';

export type CommandMenuContextApi = {
  pageType: ContextStorePageType;
  isInSidePanel: boolean;
  isDashboardPageLayoutInEditMode: boolean;
  isLayoutCustomizationModeEnabled: boolean;
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
  objectMetadataLabel: string;
};
