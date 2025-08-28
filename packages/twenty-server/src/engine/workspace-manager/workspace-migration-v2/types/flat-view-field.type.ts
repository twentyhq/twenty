import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';

export type FlatViewField = Pick<
  ViewFieldEntity,
  'fieldMetadataId' | 'position' | 'isVisible' | 'size'
>;
