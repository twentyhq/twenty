/* @license Enterprise */

import { type AccessGroupSplitValue } from 'src/engine/permissions/internal/access-group/types/access-group-split-value.type';
import { type AccessGroupType } from 'src/engine/permissions/internal/access-group/types/access-group-type.type';

export type AccessGroupOfType<TType extends AccessGroupType> = Extract<
  AccessGroupSplitValue,
  { type: TType }
>;
