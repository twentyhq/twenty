import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { RecordPositionQueryFactory } from 'src/workspace/workspace-query-builder/factories/record-position-query.factory';

describe('RecordPositionQueryFactory', () => {
  const objectMetadataItem = {
    isCustom: false,
    nameSingular: 'company',
  } as ObjectMetadataInterface;
  const dataSourceSchema = 'workspace_test';
  const factory: RecordPositionQueryFactory = new RecordPositionQueryFactory();

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('create', () => {
    it('should return a string with the position when positionValue is first', async () => {
      const positionValue = 'first';

      const result = await factory.create(
        positionValue,
        objectMetadataItem,
        dataSourceSchema,
      );

      expect(result).toEqual(
        `SELECT position FROM workspace_test."company"
            WHERE "position" IS NOT NULL ORDER BY "position" ASC LIMIT 1`,
      );
    });

    it('should return a string with the position when positionValue is last', async () => {
      const positionValue = 'last';

      const result = await factory.create(
        positionValue,
        objectMetadataItem,
        dataSourceSchema,
      );

      expect(result).toEqual(
        `SELECT position FROM workspace_test."company"
            WHERE "position" IS NOT NULL ORDER BY "position" DESC LIMIT 1`,
      );
    });
  });
});
