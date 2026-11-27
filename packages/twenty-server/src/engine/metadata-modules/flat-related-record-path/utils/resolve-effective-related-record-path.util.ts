/* @license Enterprise */

import { type OverridableFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { type RelatedRecordPathEntity } from 'src/engine/metadata-modules/related-record-path/entities/related-record-path.entity';

export const resolveEffectiveRelatedRecordPath = <
  TRelatedRecordPath extends OverridableFlatEntity &
    Partial<Pick<RelatedRecordPathEntity, 'isActive'>>,
>(
  relatedRecordPath: TRelatedRecordPath,
): TRelatedRecordPath =>
  resolveEffectiveFlatEntity({
    metadataName: 'relatedRecordPath',
    flatEntity: {
      ...relatedRecordPath,
      isActive: relatedRecordPath.isActive ?? true,
    },
  });
