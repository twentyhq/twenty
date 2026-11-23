/* @license Enterprise */

import { type OverridableFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { type RelatedRecordPathEntity } from 'src/engine/metadata-modules/related-record-path/entities/related-record-path.entity';

// The upgrade-aware adapter hides isActive until its 2.63 instance command runs, and paths stay active meanwhile
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
