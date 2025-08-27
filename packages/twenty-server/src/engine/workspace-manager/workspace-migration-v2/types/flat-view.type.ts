import { type ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { type FlatViewField } from 'src/engine/workspace-manager/workspace-migration-v2/types/flat-view-field.type';

export type FlatView = Pick<
  ViewEntity,
  'name' | 'objectMetadataId' | 'type' | 'isCustom' | 'key' | 'icon'
> & {
  viewFields: FlatViewField[];
};
