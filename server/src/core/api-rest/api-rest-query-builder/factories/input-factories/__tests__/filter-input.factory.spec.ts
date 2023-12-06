import { Test, TestingModule } from '@nestjs/testing';

import { objectMetadataItem } from 'src/core/api-rest/utils/__tests__/utils';
import { FilterInputFactory } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-input.factory';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

describe('FilterInputFactory', () => {
  const objectMetadata = { objectMetadataItem: objectMetadataItem };

  let service: FilterInputFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilterInputFactory],
    }).compile();

    service = module.get<FilterInputFactory>(FilterInputFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return default if filter missing', () => {
      const request: any = { query: {} };

      expect(service.create(request, objectMetadata)).toEqual({});
    });

    it('should throw when wrong field provided', () => {
      const request: any = {
        query: {
          filter: 'wrongField[eq]:1',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "field 'wrongField' does not exist in 'testingObject' object",
      );
    });

    it('should throw when wrong comparator provided', () => {
      const request: any = {
        query: {
          filter: 'fieldNumber[wrongComparator]:1',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "'filter' invalid for 'fieldNumber[wrongComparator]:1', comparator wrongComparator not in eq,neq,in,is,gt,gte,lt,lte,startsWith,like,ilike",
      );
    });

    it('should throw when wrong filter provided', () => {
      const request: any = {
        query: {
          filter: 'fieldNumber[wrongComparator:1',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "'filter' invalid for 'fieldNumber[wrongComparator:1'. eg: price[gte]:10",
      );
    });

    it('should throw when parenthesis are not closed', () => {
      const request: any = {
        query: {
          filter: 'and(fieldNumber[eq]:1,not(fieldNumber[neq]:1)',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "'filter' invalid. 1 close bracket is missing in the query",
      );
    });

    it('should create filter parser properly', () => {
      const request: any = {
        query: {
          filter: 'fieldNumber[eq]:1,fieldString[eq]:"Test"',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual({
        and: [{ fieldNumber: { eq: 1 } }, { fieldString: { eq: 'Test' } }],
      });
    });

    it('should create complex filter parser properly', () => {
      const request: any = {
        query: {
          filter:
            'and(fieldNumber[eq]:1,fieldString[gte]:"Test",not(fieldString[ilike]:"%val%"),or(not(and(fieldString[startsWith]:"test",fieldNumber[in]:[2,4,5])),fieldCurrency.amountMicros[gt]:1))',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual({
        and: [
          { fieldNumber: { eq: 1 } },
          { fieldString: { gte: 'Test' } },
          { not: { fieldString: { ilike: '%val%' } } },
          {
            or: [
              {
                not: {
                  and: [
                    { fieldString: { startsWith: 'test' } },
                    { fieldNumber: { in: [2, 4, 5] } },
                  ],
                },
              },
              { fieldCurrency: { amountMicros: { gt: '1' } } },
            ],
          },
        ],
      });
    });
  });

  describe('addDefaultConjunctionIfMissing', () => {
    it('should add default conjunction if missing', () => {
      expect(service.addDefaultConjunctionIfMissing('field[eq]:1')).toEqual(
        'and(field[eq]:1)',
      );
    });

    it('should not add default conjunction if not missing', () => {
      expect(
        service.addDefaultConjunctionIfMissing('and(field[eq]:1)'),
      ).toEqual('and(field[eq]:1)');
    });
  });

  describe('checkFilterQuery', () => {
    it('should check filter query', () => {
      expect(() => service.checkFilterQuery('(')).toThrow(
        "'filter' invalid. 1 close bracket is missing in the query",
      );

      expect(() => service.checkFilterQuery(')')).toThrow(
        "'filter' invalid. 1 open bracket is missing in the query",
      );

      expect(() => service.checkFilterQuery('(()')).toThrow(
        "'filter' invalid. 1 close bracket is missing in the query",
      );

      expect(() => service.checkFilterQuery('()))')).toThrow(
        "'filter' invalid. 2 open brackets are missing in the query",
      );

      expect(() =>
        service.checkFilterQuery(
          'and(or(fieldNumber[eq]:1,fieldNumber[eq]:2)),fieldNumber[eq]:3)',
        ),
      ).toThrow("'filter' invalid. 1 open bracket is missing in the query");

      expect(() =>
        service.checkFilterQuery(
          'and(or(fieldNumber[eq]:1,fieldNumber[eq]:2),fieldNumber[eq]:3)',
        ),
      ).not.toThrow();
    });
  });

  describe('parseFilterQueryContent', () => {
    it('should parse query filter test 1', () => {
      expect(service.parseFilterQueryContent('and(fieldNumber[eq]:1)')).toEqual(
        ['fieldNumber[eq]:1'],
      );
    });

    it('should parse query filter test 2', () => {
      expect(
        service.parseFilterQueryContent(
          'and(fieldNumber[eq]:1,fieldNumber[eq]:2)',
        ),
      ).toEqual(['fieldNumber[eq]:1', 'fieldNumber[eq]:2']);
    });

    it('should parse query filter test 3', () => {
      expect(
        service.parseFilterQueryContent(
          'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3))',
        ),
      ).toEqual([
        'fieldNumber[eq]:1',
        'or(fieldNumber[eq]:2,fieldNumber[eq]:3)',
      ]);
    });

    it('should parse query filter test 4', () => {
      expect(
        service.parseFilterQueryContent(
          'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,not(fieldNumber[eq]:3)),fieldNumber[eq]:4,not(fieldNumber[eq]:5))',
        ),
      ).toEqual([
        'fieldNumber[eq]:1',
        'or(fieldNumber[eq]:2,not(fieldNumber[eq]:3))',
        'fieldNumber[eq]:4',
        'not(fieldNumber[eq]:5)',
      ]);
    });

    it('should parse query filter test 5', () => {
      expect(
        service.parseFilterQueryContent(
          'and(fieldNumber[in]:[1,2],fieldNumber[eq]:4)',
        ),
      ).toEqual(['fieldNumber[in]:[1,2]', 'fieldNumber[eq]:4']);
    });

    it('should parse query filter with comma in value ', () => {
      expect(
        service.parseFilterQueryContent('and(fieldString[eq]:"val,ue")'),
      ).toEqual(['fieldString[eq]:"val,ue"']);
    });

    it('should parse query filter with comma in value ', () => {
      expect(
        service.parseFilterQueryContent("and(fieldString[eq]:'val,ue')"),
      ).toEqual(["fieldString[eq]:'val,ue'"]);
    });
  });

  describe('parseSimpleFilterString', () => {
    it('should parse simple filter string test 1', () => {
      expect(service.parseSimpleFilterString('price[lte]:100')).toEqual({
        fields: ['price'],
        comparator: 'lte',
        value: '100',
      });
    });

    it('should parse simple filter string test 2', () => {
      expect(
        service.parseSimpleFilterString('date[gt]:2023-12-01T14:23:23.914Z'),
      ).toEqual({
        fields: ['date'],
        comparator: 'gt',
        value: '2023-12-01T14:23:23.914Z',
      });
    });

    it('should parse simple filter string test 3', () => {
      expect(
        service.parseSimpleFilterString('fieldNumber[gt]:valStart]:[valEnd'),
      ).toEqual({
        fields: ['fieldNumber'],
        comparator: 'gt',
        value: 'valStart]:[valEnd',
      });
    });

    it('should parse simple filter string test 4', () => {
      expect(
        service.parseSimpleFilterString(
          'person.createdAt[gt]:"2023-12-01T14:23:23.914Z"',
        ),
      ).toEqual({
        fields: ['person', 'createdAt'],
        comparator: 'gt',
        value: '"2023-12-01T14:23:23.914Z"',
      });
    });

    it('should parse simple filter string test 5', () => {
      expect(
        service.parseSimpleFilterString(
          'person.createdAt[in]:["2023-12-01T14:23:23.914Z","2024-12-01T14:23:23.914Z"]',
        ),
      ).toEqual({
        fields: ['person', 'createdAt'],
        comparator: 'in',
        value: '["2023-12-01T14:23:23.914Z","2024-12-01T14:23:23.914Z"]',
      });
    });
  });

  describe('formatFieldValue', () => {
    it('should format fieldNumber value', () => {
      expect(service.formatFieldValue('1', FieldMetadataType.NUMBER)).toEqual(
        1,
      );

      expect(service.formatFieldValue('a', FieldMetadataType.NUMBER)).toEqual(
        NaN,
      );

      expect(
        service.formatFieldValue('true', FieldMetadataType.BOOLEAN),
      ).toEqual(true);

      expect(
        service.formatFieldValue('True', FieldMetadataType.BOOLEAN),
      ).toEqual(true);

      expect(
        service.formatFieldValue('false', FieldMetadataType.BOOLEAN),
      ).toEqual(false);

      expect(service.formatFieldValue('value', FieldMetadataType.TEXT)).toEqual(
        'value',
      );

      expect(
        service.formatFieldValue('"value"', FieldMetadataType.TEXT),
      ).toEqual('value');

      expect(
        service.formatFieldValue("'value'", FieldMetadataType.TEXT),
      ).toEqual('value');

      expect(
        service.formatFieldValue('value', FieldMetadataType.DATE_TIME),
      ).toEqual('value');

      expect(
        service.formatFieldValue('"value"', FieldMetadataType.DATE_TIME),
      ).toEqual('value');

      expect(
        service.formatFieldValue("'value'", FieldMetadataType.DATE_TIME),
      ).toEqual('value');

      expect(
        service.formatFieldValue(
          '["2023-12-01T14:23:23.914Z","2024-12-01T14:23:23.914Z"]',
          null,
          'in',
        ),
      ).toEqual(['2023-12-01T14:23:23.914Z', '2024-12-01T14:23:23.914Z']);

      expect(
        service.formatFieldValue('[1,2]', FieldMetadataType.NUMBER, 'in'),
      ).toEqual([1, 2]);

      expect(() =>
        service.formatFieldValue('2024-12-01T14:23:23.914Z', null, 'in'),
      ).toThrow(
        "'filter' invalid for 'in' operator. Received '2024-12-01T14:23:23.914Z' but array value expected eg: 'field[in]:[value_1,value_2]'",
      );
    });
  });

  describe('parseStringFilter', () => {
    it('should parse string filter test 1', () => {
      expect(
        service.parseStringFilter(
          'and(fieldNumber[eq]:1,fieldNumber[eq]:2)',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [{ fieldNumber: { eq: 1 } }, { fieldNumber: { eq: 2 } }],
      });
    });

    it('should parse string filter test 2', () => {
      expect(
        service.parseStringFilter(
          'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { fieldNumber: { eq: 1 } },
          { or: [{ fieldNumber: { eq: 2 } }, { fieldNumber: { eq: 3 } }] },
        ],
      });
    });

    it('should parse string filter test 3', () => {
      expect(
        service.parseStringFilter(
          'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3,and(fieldNumber[eq]:6,fieldNumber[eq]:7)),or(fieldNumber[eq]:4,fieldNumber[eq]:5))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { fieldNumber: { eq: 1 } },
          {
            or: [
              { fieldNumber: { eq: 2 } },
              { fieldNumber: { eq: 3 } },
              { and: [{ fieldNumber: { eq: 6 } }, { fieldNumber: { eq: 7 } }] },
            ],
          },
          { or: [{ fieldNumber: { eq: 4 } }, { fieldNumber: { eq: 5 } }] },
        ],
      });
    });

    it('should parse string filter test 4', () => {
      expect(
        service.parseStringFilter(
          'and(fieldString[gt]:"val,ue",or(fieldNumber[is]:NOT_NULL,not(fieldString[startsWith]:"val"),and(fieldNumber[eq]:6,fieldString[ilike]:"%val%")),or(fieldNumber[eq]:4,fieldString[is]:NULL))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { fieldString: { gt: 'val,ue' } },
          {
            or: [
              { fieldNumber: { is: 'NOT_NULL' } },
              { not: { fieldString: { startsWith: 'val' } } },
              {
                and: [
                  { fieldNumber: { eq: 6 } },
                  { fieldString: { ilike: '%val%' } },
                ],
              },
            ],
          },
          { or: [{ fieldNumber: { eq: 4 } }, { fieldString: { is: 'NULL' } }] },
        ],
      });
    });

    it('should handler not', () => {
      expect(
        service.parseStringFilter(
          'and(fieldNumber[eq]:1,not(fieldNumber[eq]:2))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { fieldNumber: { eq: 1 } },
          {
            not: { fieldNumber: { eq: 2 } },
          },
        ],
      });
    });
  });
});
