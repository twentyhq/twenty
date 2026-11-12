import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { type UniversalCreatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';

export const buildUniversalFlatPageLayoutTab = ({
  universalIdentifier,
  pageLayoutUniversalIdentifier,
}: {
  universalIdentifier: string;
  pageLayoutUniversalIdentifier: string;
}): UniversalCreatePageLayoutTabAction['flatEntity'] => ({
  universalIdentifier,
  pageLayoutUniversalIdentifier,
  applicationUniversalIdentifier: 'application',
  title: 'Tab',
  position: 0,
  icon: null,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  overrides: null,
  isActive: true,
  isSystemSideEffect: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
});
