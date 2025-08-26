import { type ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';

export type FlatViewField = Pick<
  ViewField,
  'fieldMetadataId' | 'position' | 'isVisible' | 'size'
>;
