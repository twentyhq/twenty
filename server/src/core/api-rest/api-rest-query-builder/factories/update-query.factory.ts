import { Injectable } from '@nestjs/common';

import { capitalize } from 'src/utils/capitalize';
import { mapFieldMetadataToGraphqlQuery } from 'src/core/api-rest/api-rest-query-builder/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class UpdateQueryFactory {
  create(objectMetadata, depth?: number): string {
    return `
      mutation Update${capitalize(
        objectMetadata.objectMetadataItem.nameSingular,
      )}($id: ID!, $data: CompanyUpdateInput!) {
        update${capitalize(
          objectMetadata.objectMetadataItem.nameSingular,
        )}(id: $id, data: $data) {
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
