import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
} from '@/application/pageLayoutManifestType';
import { PageLayoutTabLayoutMode, PageLayoutType } from '@/types';

export const getPageLayoutTabManifestLayoutMode = ({
  pageLayoutTabManifest,
  pageLayoutType,
}: {
  pageLayoutTabManifest: Pick<PageLayoutTabManifest, 'layoutMode'>;
  pageLayoutType: PageLayoutManifest['type'] | undefined;
}): PageLayoutTabLayoutMode =>
  pageLayoutTabManifest.layoutMode ??
  (pageLayoutType === PageLayoutType.STANDALONE_PAGE
    ? PageLayoutTabLayoutMode.VERTICAL_LIST
    : PageLayoutTabLayoutMode.GRID);
