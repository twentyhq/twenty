import { type PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export const pageLayoutTabEntityRelationProperties = [
  'workspace',
  'pageLayout',
  'widgets',
  'application',
] as const;

export type PageLayoutTabEntityRelationProperties =
  (typeof pageLayoutTabEntityRelationProperties)[number];

export type FlatPageLayoutTab = FlatEntityFrom<
  PageLayoutTabEntity,
  PageLayoutTabEntityRelationProperties
>;

