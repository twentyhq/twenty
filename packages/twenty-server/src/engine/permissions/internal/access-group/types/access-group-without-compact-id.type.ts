/* @license Enterprise */

import { type AccessGroupSplitValue } from 'src/engine/permissions/internal/access-group/types/access-group-split-value.type';

export type AccessGroupWithoutCompactId = {
  groupHash: string;
  objectMetadataId: string;
  ruleShapeHash: string;
  unreadableFieldIds: string[];
} & AccessGroupSplitValue;
