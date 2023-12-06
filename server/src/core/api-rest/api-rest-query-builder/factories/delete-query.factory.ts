import { Injectable } from '@nestjs/common';

import { capitalize } from 'src/utils/capitalize';

@Injectable()
export class DeleteQueryFactory {
  create(objectMetadataItem): string {
    return `
      mutation Delete${capitalize(objectMetadataItem.nameSingular)}($id: ID!) {
        delete${capitalize(objectMetadataItem.nameSingular)}(id: $id) {
          id
        }
      }
    `;
  }
}
