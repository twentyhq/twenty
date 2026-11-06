import { PageLayoutType } from 'twenty-shared/types';

import { type UniversalCreatePageLayoutAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';

export const buildUniversalFlatPageLayout = ({
  universalIdentifier,
  defaultTabUniversalIdentifier = null,
}: {
  universalIdentifier: string;
  defaultTabUniversalIdentifier?: string | null;
}): UniversalCreatePageLayoutAction['flatEntity'] => ({
  universalIdentifier,
  applicationUniversalIdentifier: 'application',
  name: 'Layout',
  type: PageLayoutType.RECORD_PAGE,
  isSystemSideEffect: false,
  isFirstTabPinned: false,
  filters: null,
  objectMetadataUniversalIdentifier: null,
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
    defaultTabUniversalIdentifier,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
});
