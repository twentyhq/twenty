import { Injectable } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

@Injectable()
export class RecordPositionQueryFactory {
  async create(
    positionValue: 'first' | 'last',
    objectMetadataItem: ObjectMetadataInterface,
    dataSourceSchema: string,
  ): Promise<string> {
    const orderByDirection = positionValue === 'first' ? 'ASC' : 'DESC';

    const name =
      (objectMetadataItem.isCustom ? '_' : '') +
      objectMetadataItem.nameSingular;

    return `SELECT position FROM ${dataSourceSchema}."${name}"
            WHERE "position" IS NOT NULL ORDER BY "position" ${orderByDirection} LIMIT 1`;
  }
}
