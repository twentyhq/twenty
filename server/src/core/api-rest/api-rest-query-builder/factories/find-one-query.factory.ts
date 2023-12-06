import { Injectable } from '@nestjs/common';

import { capitalize } from 'src/utils/capitalize';
import { mapFieldMetadataToGraphqlQuery } from 'src/core/api-rest/api-rest-query-builder/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class FindOneQueryFactory {
  create(objectMetadata, depth?: number): string {
    return `
      query FindOne${capitalize(
        objectMetadata.objectMetadataItem.nameSingular,
      )}(
        $filter: ${capitalize(
          objectMetadata.objectMetadataItem.nameSingular,
        )}FilterInput!,
        ) {
        ${objectMetadata.objectMetadataItem.nameSingular}(filter: $filter) {
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
      }
    `;
  }
}
