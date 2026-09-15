import { type InheritedReadabilityChildrenParent } from 'src/engine/twenty-orm/types/inherited-readability-children-parent.type';
import { type InheritedReadabilityColumnParent } from 'src/engine/twenty-orm/types/inherited-readability-column-parent.type';

export type InheritedReadabilityParent =
  | InheritedReadabilityColumnParent
  | InheritedReadabilityChildrenParent;
