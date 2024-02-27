import { IndexMetadata } from 'src/metadata/object-metadata/types/index-metadata';

export interface IndexDecoratorParams
  extends Pick<IndexMetadata, 'columns' | 'name'> {}
