/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { ACCESS_GROUP_SHARED_PREDICATE_KEY } from 'src/engine/permissions/internal/access-group/constants/access-group-shared-predicate-key.constant';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type AccessGroupSharedPredicate } from 'src/engine/permissions/internal/access-group/types/access-group-shared-predicate.type';

const isAccessGroupSharedPredicate = (
  value: unknown,
): value is AccessGroupSharedPredicate =>
  isPlainObject(value) &&
  isNonEmptyString(value.fieldMetadataId) &&
  isNonEmptyString(value.value) &&
  Array.isArray(value.unreadableFieldIds);

export const findAccessGroupSharedPredicate = ({
  memberFieldValues,
}: Pick<AccessGroup, 'memberFieldValues'>):
  | AccessGroupSharedPredicate
  | undefined => {
  const sharedPredicate =
    memberFieldValues?.[ACCESS_GROUP_SHARED_PREDICATE_KEY];

  return isAccessGroupSharedPredicate(sharedPredicate)
    ? sharedPredicate
    : undefined;
};
