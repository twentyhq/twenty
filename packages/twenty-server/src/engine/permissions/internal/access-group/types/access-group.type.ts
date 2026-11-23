/* @license Enterprise */

import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group-without-compact-id.type';

export type AccessGroup = AccessGroupWithoutCompactId & { compactId: number };
