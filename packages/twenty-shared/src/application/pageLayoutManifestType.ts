import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type PageLayoutTabLayoutMode,
  type PageLayoutType,
  type PageLayoutWidgetCanvasPosition,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetGridPosition,
  type PageLayoutWidgetUniversalConfiguration,
  type PageLayoutWidgetVerticalListHeightBehavior,
  type PageLayoutWidgetVerticalListPosition,
  type WidgetType,
} from '@/types';

export type PageLayoutWidgetManifestPosition =
  | (Omit<PageLayoutWidgetGridPosition, 'layoutMode'> & {
      layoutMode:
        | PageLayoutTabLayoutMode.GRID
        | `${PageLayoutTabLayoutMode.GRID}`;
    })
  | (Omit<
      PageLayoutWidgetVerticalListPosition,
      'layoutMode' | 'heightBehavior'
    > & {
      layoutMode:
        | PageLayoutTabLayoutMode.VERTICAL_LIST
        | `${PageLayoutTabLayoutMode.VERTICAL_LIST}`;
      heightBehavior?:
        | PageLayoutWidgetVerticalListHeightBehavior
        | `${PageLayoutWidgetVerticalListHeightBehavior}`;
    })
  | (Omit<PageLayoutWidgetCanvasPosition, 'layoutMode'> & {
      layoutMode:
        | PageLayoutTabLayoutMode.CANVAS
        | `${PageLayoutTabLayoutMode.CANVAS}`;
    });

export type PageLayoutWidgetManifest = SyncableEntityOptions & {
  title: string;
  type: `${WidgetType}`;
  objectUniversalIdentifier?: string;
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay;
  position?: PageLayoutWidgetManifestPosition;
  heightBehavior?: `${PageLayoutWidgetVerticalListHeightBehavior}`;
  configuration: PageLayoutWidgetUniversalConfiguration;
};

export type StandalonePageLayoutWidgetManifest = PageLayoutWidgetManifest & {
  pageLayoutTabUniversalIdentifier: string;
  position: PageLayoutWidgetManifestPosition;
};

export type PageLayoutTabManifest = SyncableEntityOptions & {
  title: string;
  position: number;
  icon?: string;
  layoutMode?: PageLayoutTabLayoutMode | `${PageLayoutTabLayoutMode}`;
  widgets?: PageLayoutWidgetManifest[];
  pageLayoutUniversalIdentifier?: string;
};

export type PageLayoutManifest = SyncableEntityOptions & {
  name: string;
  type: `${PageLayoutType}`;
  objectUniversalIdentifier?: string;
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier?: string;
  tabs?: PageLayoutTabManifest[];
};
