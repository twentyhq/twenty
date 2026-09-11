import {
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from '@/application/pageLayoutManifestType';
import {
  type PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from '@/types';

export type NormalizedPageLayoutWidgetManifest = Omit<
  PageLayoutWidgetManifest,
  'position' | 'heightBehavior'
> & {
  position: PageLayoutWidgetPosition;
};

export type NormalizedPageLayoutTabManifest = Omit<
  PageLayoutTabManifest,
  'layoutMode' | 'widgets'
> & {
  layoutMode: PageLayoutTabLayoutMode;
  widgets: NormalizedPageLayoutWidgetManifest[];
};
