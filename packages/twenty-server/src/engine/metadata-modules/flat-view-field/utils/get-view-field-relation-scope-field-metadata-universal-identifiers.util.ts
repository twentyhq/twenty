import { type UniversalViewFieldRelationScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getViewFieldRelationScopeFieldMetadataUniversalIdentifiers = ({
  filters,
  sorts,
}: UniversalViewFieldRelationScope): string[] =>
  [...filters, ...sorts]
    .flatMap((fieldReference) => [
      fieldReference.fieldMetadataUniversalIdentifier,
      fieldReference.relationTargetFieldMetadataUniversalIdentifier,
    ])
    .filter(isDefined);
