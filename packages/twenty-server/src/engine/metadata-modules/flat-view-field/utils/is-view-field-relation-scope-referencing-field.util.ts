import { type UniversalViewFieldRelationScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isViewFieldRelationScopeReferencingField = ({
  universalRelationScope,
  fieldMetadataUniversalIdentifier,
}: {
  universalRelationScope: UniversalViewFieldRelationScope | null;
  fieldMetadataUniversalIdentifier: string;
}): boolean =>
  isDefined(universalRelationScope) &&
  [...universalRelationScope.filters, ...universalRelationScope.sorts].some(
    (fieldReference) =>
      fieldReference.fieldMetadataUniversalIdentifier ===
        fieldMetadataUniversalIdentifier ||
      fieldReference.relationTargetFieldMetadataUniversalIdentifier ===
        fieldMetadataUniversalIdentifier,
  );
