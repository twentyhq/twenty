import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { MetadataReadability } from 'twenty-shared/types';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findBackfillSharingRulesAfterOperations } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/find-backfill-sharing-rules-after-operations.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { getEffectiveReadability } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-readability.util';

@Injectable()
export class ObjectReadabilityPrivateBackfillOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectReadabilityPrivateBackfillOnCreate',
    description:
      'An object created PRIVATE hides every record from everyone who holds no share row, which reaches the API through application manifests only, so the creation is refused unless the same migration creates at least one active sharing rule without criteria granting EVERYONE or a ROLE on it. Noop on other readability levels and on system builds, which carry their own backfill.',
  },
) {
  buildSideEffects({
    flatEntity: createdFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    if (
      context.buildOptions.isSystemBuild ||
      getEffectiveReadability(createdFlatObjectMetadata) !==
        MetadataReadability.PRIVATE
    ) {
      return { status: 'noop' };
    }

    const hasBackfillSharingRule =
      findBackfillSharingRulesAfterOperations({
        objectMetadataUniversalIdentifier:
          createdFlatObjectMetadata.universalIdentifier,
        flatSharingRuleMaps: relatedFlatEntityMaps.flatSharingRuleMaps,
        allFlatEntityOperationRecordByMetadataName,
      }).length > 0;

    if (hasBackfillSharingRule) {
      return { status: 'noop' };
    }

    const objectLabel = createdFlatObjectMetadata.labelPlural;

    return {
      status: 'fail',
      type: 'create',
      metadataName: 'objectMetadata',
      flatEntityMinimalInformation: {
        universalIdentifier: createdFlatObjectMetadata.universalIdentifier,
        nameSingular: createdFlatObjectMetadata.nameSingular,
        namePlural: createdFlatObjectMetadata.namePlural,
      } as Partial<MetadataFlatEntity<'objectMetadata'>>,
      errors: [
        {
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Cannot create ${objectLabel} as private without a backfill sharing rule: nobody would be able to read the records`,
          userFriendlyMessage: msg`Creating ${objectLabel} as private needs a sharing rule that keeps everyone or a role reading the records`,
        },
      ],
    };
  }
}
