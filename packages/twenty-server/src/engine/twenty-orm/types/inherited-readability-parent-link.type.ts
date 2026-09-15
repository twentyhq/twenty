import { type InheritedReadabilityColumnParent } from 'src/engine/twenty-orm/types/inherited-readability-column-parent.type';

export type InheritedReadabilityParentLink = Pick<
  InheritedReadabilityColumnParent,
  'joinColumnName' | 'parentFlatObjectMetadata'
>;
