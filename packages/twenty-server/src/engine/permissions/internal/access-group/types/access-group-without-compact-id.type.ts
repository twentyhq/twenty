/* @license Enterprise */

import { type AccessGroupSplit } from 'src/engine/permissions/internal/access-group/types/access-group-split.type';

export type AccessGroupWithoutCompactId = {
  groupHash: string;
  objectMetadataId: string;
  ruleShapeHash: string;
  unreadableFieldIds: string[];
} & AccessGroupSplit;
