/* @license Enterprise */

import { ACCESS_GROUP_TYPE_HANDLERS } from 'src/engine/permissions/internal/access-group/type-handlers/access-group-type-handlers.constant';
import { type AccessGroupType } from 'src/engine/permissions/internal/access-group/types/access-group-type.type';
import { type AccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/types/access-group-type-handler.type';

export const findAccessGroupTypeHandler = <TType extends AccessGroupType>(
  type: TType,
): AccessGroupTypeHandler<TType> => ACCESS_GROUP_TYPE_HANDLERS[type];
