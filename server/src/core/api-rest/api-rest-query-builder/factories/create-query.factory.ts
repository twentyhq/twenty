import { Injectable } from '@nestjs/common';

import { capitalize } from 'src/utils/capitalize';
import { mapFieldMetadataToGraphqlQuery } from 'src/core/api-rest/utils/map-field-metadata-to-graphql-query.utils';

@Injectable()
export class CreateQueryFactory {
  create(objectMetadata, depth: number | undefined) {
    return `
      mutation Create${capitalize(
        objectMetadata.objectMetadataItem.nameSingular,
      )}($data: CompanyCreateInput!) {
        create${capitalize(
          objectMetadata.objectMetadataItem.nameSingular,
        )}(data: $data) {
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
