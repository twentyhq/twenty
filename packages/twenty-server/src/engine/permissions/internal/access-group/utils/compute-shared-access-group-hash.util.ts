/* @license Enterprise */

import { createHash } from 'crypto';

import { ACCESS_GROUP_SHARED_PREDICATE_KEY } from 'src/engine/permissions/internal/access-group/constants/access-group-shared-predicate-key.constant';
import { type AccessGroupSharedPredicate } from 'src/engine/permissions/internal/access-group/types/access-group-shared-predicate.type';

export const computeSharedAccessGroupHash = ({
  sharedPredicate,
  isRelationHopEnabled,
}: {
  sharedPredicate: AccessGroupSharedPredicate;
  isRelationHopEnabled: boolean;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify([
        ACCESS_GROUP_SHARED_PREDICATE_KEY,
        sharedPredicate.objectMetadataId,
        sharedPredicate.relationFieldMetadataId,
        sharedPredicate.fieldMetadataId,
        sharedPredicate.subFieldName,
        sharedPredicate.operand,
        sharedPredicate.value,
        sharedPredicate.unreadableFieldIds,
        isRelationHopEnabled,
      ]),
    )
    .digest('hex');
