import { type ObjectPermissions } from './ObjectPermissions';
import { type ObjectRecord } from './ObjectRecord';

export type CommandMenuContextApi = {
  isShowPage: boolean;
  isInSidePanel: boolean;
  isFavorite: boolean;
  isRemote: boolean;
  isNoteOrTask: boolean;
  isSelectAll: boolean;
  hasAnySoftDeleteFilterOnView: boolean;
  numberOfSelectedRecords: number;
  objectPermissions: ObjectPermissions & { objectMetadataId: string };
  selectedRecord: ObjectRecord | undefined;
  featureFlags: Record<string, boolean>;
  targetObjectReadPermissions: Record<string, boolean>;
  targetObjectWritePermissions: Record<string, boolean>;
};
