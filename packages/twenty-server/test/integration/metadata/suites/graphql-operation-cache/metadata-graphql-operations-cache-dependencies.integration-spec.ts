import { gql } from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ASTNode } from 'graphql';

import { METADATA_GRAPHQL_OPERATIONS_TO_CACHE } from 'src/engine/api/graphql/graphql-config/constants/metadata-graphql-operations-to-cache.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheOrDerivedCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

// Mirrors OBJECT_METADATA_FRAGMENT from twenty-front
// (packages/twenty-front/src/modules/object-metadata/graphql/fragment.ts):
// the recorded resolver reads are only as complete as this selection set.
const OBJECT_METADATA_ITEMS_QUERY = gql`
  query ObjectMetadataItems {
    objects(paging: { first: 1000 }) {
      edges {
        node {
          id
          universalIdentifier
          nameSingular
          namePlural
          labelSingular
          labelPlural
          color
          description
          icon
          isRemote
          isActive
          isSystem
          isUIEditable
          isUICreatable
          createdAt
          updatedAt
          labelIdentifierFieldMetadataId
          imageIdentifierFieldMetadataId
          applicationId
          shortcut
          isLabelSyncedWithName
          isSearchable
          duplicateCriteria
          searchFieldMetadataList {
            id
            fieldMetadataId
            tsVectorFieldMetadataId
            position
          }
          indexMetadataList {
            id
            name
            indexWhereClause
            indexType
            isUnique
            isSystemSideEffect
            indexFieldMetadataList {
              id
              fieldMetadataId
              subFieldName
              order
            }
          }
          fieldsList {
            id
            universalIdentifier
            type
            name
            label
            description
            icon
            isActive
            isSystem
            isUIEditable
            isNullable
            isUnique
            defaultValue
            options
            settings
            isLabelSyncedWithName
            morphId
            applicationId
            relation {
              type
              sourceObjectMetadata {
                id
                nameSingular
                namePlural
              }
              targetObjectMetadata {
                id
                nameSingular
                namePlural
              }
              sourceFieldMetadata {
                id
                name
              }
              targetFieldMetadata {
                id
                name
              }
            }
            morphRelations {
              type
              sourceObjectMetadata {
                id
                nameSingular
                namePlural
              }
              targetObjectMetadata {
                id
                nameSingular
                namePlural
              }
              sourceFieldMetadata {
                id
                name
              }
              targetFieldMetadata {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

const OBJECT_METADATA_ITEMS_BASELINE_QUERY = gql`
  query ObjectMetadataItems {
    objects(paging: { first: 1 }) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

describe('metadata GraphQL operations cache dependencies', () => {
  const recordAccessedCacheKeys = async (
    query: ASTNode,
  ): Promise<Set<WorkspaceCacheOrDerivedCacheKeyName>> => {
    const workspaceCacheService =
      getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');
    const spy = jest.spyOn(workspaceCacheService, 'getOrRecomputeWithHashes');

    try {
      const response = await makeMetadataApiRequest({ query });

      expect(response.body.errors).toBeUndefined();

      return new Set<WorkspaceCacheOrDerivedCacheKeyName>(
        spy.mock.calls.flatMap(([, cacheKeyNames]) => cacheKeyNames),
      );
    } finally {
      spy.mockRestore();
    }
  };

  const findUndeclaredDependencies = async ({
    operationName,
    fullQuery,
    baselineQuery,
  }: {
    operationName: string;
    fullQuery: ASTNode;
    baselineQuery: ASTNode;
  }): Promise<WorkspaceCacheOrDerivedCacheKeyName[]> => {
    const declaredDependencies = new Set<WorkspaceCacheOrDerivedCacheKeyName>(
      METADATA_GRAPHQL_OPERATIONS_TO_CACHE[operationName].dependencies,
    );
    const requestInfrastructureKeys =
      await recordAccessedCacheKeys(baselineQuery);
    const accessedCacheKeys = await recordAccessedCacheKeys(fullQuery);

    return [...accessedCacheKeys].filter(
      (cacheKeyName) =>
        !declaredDependencies.has(cacheKeyName) &&
        !requestInfrastructureKeys.has(cacheKeyName),
    );
  };

  it('declares every flat map the ObjectMetadataItems resolvers read', async () => {
    const undeclaredDependencies = await findUndeclaredDependencies({
      operationName: 'ObjectMetadataItems',
      fullQuery: OBJECT_METADATA_ITEMS_QUERY,
      baselineQuery: OBJECT_METADATA_ITEMS_BASELINE_QUERY,
    });

    expect(undeclaredDependencies).toEqual([]);
  });
});
