import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';

export const pageLayoutEntityRelationProperties = [
  'workspace',
  'objectMetadata',
  'tabs',
  'application',
] as const satisfies (keyof PageLayoutEntity)[];

export type PageLayoutEntityRelationProperties =
  (typeof pageLayoutEntityRelationProperties)[number];

export type FlatPageLayout = FlatEntityFrom<
  PageLayoutEntity,
  PageLayoutEntityRelationProperties
> & {
  tabIds: string[];
};
