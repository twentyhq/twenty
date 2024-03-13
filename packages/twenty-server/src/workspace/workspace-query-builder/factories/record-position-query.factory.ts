import { Injectable } from '@nestjs/common';

export enum RecordPositionQueryType {
  GET = 'GET',
  UPDATE = 'UPDATE',
}

@Injectable()
export class RecordPositionQueryFactory {
  async create(
    recordPositionQueryType: RecordPositionQueryType,
    positionValue: 'first' | 'last' | number,
    objectMetadata: { isCustom: boolean; nameSingular: string },
    dataSourceSchema: string,
    recordId?: string,
  ): Promise<string> {
    const name =
      (objectMetadata.isCustom ? '_' : '') + objectMetadata.nameSingular;

    switch (recordPositionQueryType) {
      case RecordPositionQueryType.GET:
        if (typeof positionValue === 'number') {
          throw new Error(
            'RecordPositionQueryType.GET requires positionValue to be a number',
          );
        }

        return this.createForGet(positionValue, name, dataSourceSchema);
      case RecordPositionQueryType.UPDATE:
        if (typeof positionValue !== 'number') {
          throw new Error(
            'RecordPositionQueryType.UPDATE requires positionValue to be a number',
          );
        }

        if (!recordId) {
          throw new Error(
            'RecordPositionQueryType.UPDATE requires recordId to be defined',
          );
        }

        return this.createForUpdate(
          positionValue,
          name,
          dataSourceSchema,
          recordId,
        );
      default:
        throw new Error('Invalid RecordPositionQueryType');
    }
  }

  private async createForGet(
    positionValue: 'first' | 'last',
    name: string,
    dataSourceSchema: string,
  ): Promise<string> {
    const orderByDirection = positionValue === 'first' ? 'ASC' : 'DESC';

    return `SELECT position FROM ${dataSourceSchema}."${name}"
            WHERE "position" IS NOT NULL ORDER BY "position" ${orderByDirection} LIMIT 1`;
  }

  private async createForUpdate(
    positionValue: number,
    name: string,
    dataSourceSchema: string,
    recordId: string,
  ): Promise<string> {
    return `UPDATE ${dataSourceSchema}."${name}"
            SET "position" = ${positionValue}
            WHERE "id" = '${recordId}'`;
  }
}
