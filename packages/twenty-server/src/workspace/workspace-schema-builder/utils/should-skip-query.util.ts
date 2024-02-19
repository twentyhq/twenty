import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';
import { WorkspaceResolverBuilderMethodNames } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { duplicateCriteriaCollection } from 'src/workspace/workspace-resolver-builder/constants/duplicate-criteria.constants';

export const shouldSkipQuery = (
  methodName: WorkspaceResolverBuilderMethodNames,
  objectMetadata: ObjectMetadataInterface,
) => {
  switch (methodName) {
    case 'findDuplicates': {
      const objectHasSomeDuplicateCriteria = duplicateCriteriaCollection.some(
        (dc) => dc.objectName === objectMetadata.nameSingular,
      );

      return !objectHasSomeDuplicateCriteria;
    }
    default: {
      return false;
    }
  }
};
