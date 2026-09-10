import { type MetadataCursorPageInfo } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-page-info.type';

export type MetadataCursorPage<TEntity extends { id: string }> = {
  items: TEntity[];
  pageInfo: MetadataCursorPageInfo;
};
