import { Injectable } from '@nestjs/common';

import { capitalize } from 'src/utils/capitalize';
import { mapFieldMetadataToGraphqlQuery } from 'src/core/api-rest/api-rest-query-builder/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class FindManyQueryFactory {
  create(objectMetadata, depth?: number): string {
    return `
      query FindMany${capitalize(objectMetadata.objectMetadataItem.namePlural)}(
        $filter: ${capitalize(
          objectMetadata.objectMetadataItem.nameSingular,
        )}FilterInput,
        $orderBy: ${capitalize(
          objectMetadata.objectMetadataItem.nameSingular,
        )}OrderByInput,
        $lastCursor: String,
        $limit: Float = 60
        ) {
        ${objectMetadata.objectMetadataItem.namePlural}(
        filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor
        ) {
          edges {
            node {
              id
              ${objectMetadata.objectMetadataItem.fields
                .map((field) =>
                  mapFieldMetadataToGraphqlQuery(
                    objectMetadata.objectMetadataItems,
                    field,
                    depth,
                  ),
                )
                .join('\n')}
              }
            cursor
          }
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `;
  }
}
