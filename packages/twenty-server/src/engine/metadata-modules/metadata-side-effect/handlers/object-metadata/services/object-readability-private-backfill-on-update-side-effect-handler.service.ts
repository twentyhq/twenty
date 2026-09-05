import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import {
  MetadataReadability,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type FlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { getEffectiveReadability } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-readability.util';
import { type UniversalFlatSharingRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-sharing-rule.type';

const BACKFILL_GRANTEE_PRINCIPAL_TYPES: RecordSharePrincipalType[] = [
  RecordSharePrincipalType.EVERYONE,
  RecordSharePrincipalType.ROLE,
];

const isBackfillSharingRule = (
  sharingRule: Pick<
    UniversalFlatSharingRule | FlatSharingRule,
    | 'isActive'
    | 'deletedAt'
    | 'granteePrincipalType'
    | 'rowLevelPermissionPredicateUniversalIdentifiers'
  >,
): boolean =>
  sharingRule.isActive &&
  !isDefined(sharingRule.deletedAt) &&
  BACKFILL_GRANTEE_PRINCIPAL_TYPES.includes(sharingRule.granteePrincipalType) &&
  sharingRule.rowLevelPermissionPredicateUniversalIdentifiers.length === 0;

@Injectable()
export class ObjectReadabilityPrivateBackfillOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'objectMetadata',
    name: 'objectReadabilityPrivateBackfillOnUpdate',
    description:
      'An object whose effective readability becomes PRIVATE hides every record from everyone who holds no share row, so the transition is refused unless the object keeps, after this same migration, at least one active sharing rule without criteria granting EVERYONE or a ROLE. Existing rules are read from the sharing rule maps, minus the ones deleted here, and rules created here count too. Noop when the effective readability does not become PRIVATE, and on system builds, which carry their own backfill.',
  },
) {
  buildSideEffects({
    flatEntity: updatedFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    if (context.buildOptions.isSystemBuild) {
      return { status: 'noop' };
    }

    const existingFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        updatedFlatObjectMetadata.universalIdentifier
      ];

    if (
      !isDefined(existingFlatObjectMetadata) ||
      getEffectiveReadability(updatedFlatObjectMetadata) !==
        MetadataReadability.PRIVATE ||
      getEffectiveReadability(existingFlatObjectMetadata) ===
        MetadataReadability.PRIVATE
    ) {
      return { status: 'noop' };
    }

    const sharingRuleOperations =
      allFlatEntityOperationRecordByMetadataName.sharingRule;
    const deletedSharingRuleUniversalIdentifiers = new Set(
      Object.keys(sharingRuleOperations?.flatEntityToDelete ?? {}),
    );

    const existingSharingRules = Object.values(
      relatedFlatEntityMaps.flatSharingRuleMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatSharingRule) =>
          flatSharingRule.objectMetadataUniversalIdentifier ===
            updatedFlatObjectMetadata.universalIdentifier &&
          !deletedSharingRuleUniversalIdentifiers.has(
            flatSharingRule.universalIdentifier,
          ),
      )
      .map(
        (flatSharingRule) =>
          sharingRuleOperations?.flatEntityToUpdate?.[
            flatSharingRule.universalIdentifier
          ] ?? flatSharingRule,
      );

    const createdSharingRules = Object.values(
      sharingRuleOperations?.flatEntityToCreate ?? {},
    )
      .filter(isDefined)
      .filter(
        (universalFlatSharingRule) =>
          universalFlatSharingRule.objectMetadataUniversalIdentifier ===
          updatedFlatObjectMetadata.universalIdentifier,
      );

    const hasBackfillSharingRule = [
      ...existingSharingRules,
      ...createdSharingRules,
    ].some(isBackfillSharingRule);

    if (hasBackfillSharingRule) {
      return { status: 'noop' };
    }

    const objectLabel = updatedFlatObjectMetadata.labelPlural;

    return {
      status: 'fail',
      type: 'update',
      metadataName: 'objectMetadata',
      flatEntityMinimalInformation: {
        universalIdentifier: updatedFlatObjectMetadata.universalIdentifier,
        nameSingular: updatedFlatObjectMetadata.nameSingular,
        namePlural: updatedFlatObjectMetadata.namePlural,
      } as Partial<MetadataFlatEntity<'objectMetadata'>>,
      errors: [
        {
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Cannot make ${objectLabel} private without a backfill sharing rule: nobody would be able to read the records`,
          userFriendlyMessage: msg`Making ${objectLabel} private needs a sharing rule that keeps everyone or a role reading the records`,
        },
      ],
    };
  }
}
