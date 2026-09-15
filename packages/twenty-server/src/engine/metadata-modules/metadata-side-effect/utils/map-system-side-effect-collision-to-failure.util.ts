import { msg, t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import { type MetadataSideEffectFailure } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type SystemSideEffectUniversalIdentifierCollision } from 'src/engine/metadata-modules/metadata-side-effect/types/system-side-effect-universal-identifier-collision.type';

// A reserved-identifier collision is just another side-effect failure: mapping it
// to the shared MetadataSideEffectFailure shape lets the engine merge collisions
// and handler failures into a single report.
export const mapSystemSideEffectCollisionToFailure = (
  collision: SystemSideEffectUniversalIdentifierCollision,
): MetadataSideEffectFailure => ({
  status: 'fail',
  type: collision.operation,
  metadataName: collision.metadataName,
  flatEntityMinimalInformation: {
    universalIdentifier: collision.universalIdentifier,
    ...(collision.name !== undefined ? { name: collision.name } : {}),
  } as Partial<MetadataFlatEntity<AllMetadataName>>,
  errors: [
    {
      code: MetadataSideEffectExceptionCode.RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER,
      message: t`Universal identifier is reserved for system-managed metadata`,
      userFriendlyMessage: msg`This identifier is reserved by the system`,
    },
  ],
});
