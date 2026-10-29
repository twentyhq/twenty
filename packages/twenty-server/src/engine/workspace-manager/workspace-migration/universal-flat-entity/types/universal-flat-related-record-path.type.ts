/* @license Enterprise */

import { type RelatedRecordPathEntity } from 'src/engine/metadata-modules/related-record-path/entities/related-record-path.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatRelatedRecordPath = UniversalFlatEntityFrom<
  RelatedRecordPathEntity,
  'relatedRecordPath'
>;
