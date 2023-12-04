import { Test, TestingModule } from '@nestjs/testing';

import { ApiRestService } from 'src/core/api-rest/api-rest.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

describe('ApiRestService', () => {
  let service: ApiRestService;
  const objectMetadataItem = {
    fields: [
      {
        name: 'fieldNumber',
        type: 'NUMBER',
        targetColumnMap: { value: 'fieldNumber' },
      },
      {
        name: 'fieldString',
        type: 'TEXT',
        targetColumnMap: { value: 'fieldString' },
      },
    ],
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiRestService,
        {
          provide: ObjectMetadataService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ApiRestService>(ApiRestService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('checkFilterQuery', () => {
    it('should check filter query', () => {
      expect(() => service.checkFilterQuery('(')).toThrow();
      expect(() => service.checkFilterQuery(')')).toThrow();
      expect(() => service.checkFilterQuery('(()')).toThrow();
      expect(() => service.checkFilterQuery('())')).toThrow();
      expect(() =>
        service.checkFilterQuery(
          'and(or(fieldNumber[eq]:1,fieldNumber[eq]:2)),fieldNumber[eq]:3)',
        ),
      ).toThrow();
      expect(() =>
        service.checkFilterQuery(
          'and(or(fieldNumber[eq]:1,fieldNumber[eq]:2),fieldNumber[eq]:3)',
        ),
      ).not.toThrow();
    });
  });
  describe('formatFieldValue', () => {
    it('should format fieldNumber value', () => {
      expect(service.formatFieldValue('1', 'NUMBER')).toEqual(1);
      expect(service.formatFieldValue('a', 'NUMBER')).toEqual(NaN);
      expect(service.formatFieldValue('true', 'BOOLEAN')).toEqual(true);
      expect(service.formatFieldValue('True', 'BOOLEAN')).toEqual(true);
      expect(service.formatFieldValue('false', 'BOOLEAN')).toEqual(false);
      expect(service.formatFieldValue('value', 'TEXT')).toEqual('value');
      expect(service.formatFieldValue('"value"', 'TEXT')).toEqual('value');
      expect(service.formatFieldValue("'value'", 'TEXT')).toEqual('value');
      expect(service.formatFieldValue('value', 'DATE_TIME')).toEqual('value');
      expect(service.formatFieldValue('"value"', 'DATE_TIME')).toEqual('value');
      expect(service.formatFieldValue("'value'", 'DATE_TIME')).toEqual('value');
      expect(
        service.formatFieldValue(
          '["2023-12-01T14:23:23.914Z","2024-12-01T14:23:23.914Z"]',
          null,
          'in',
        ),
      ).toEqual(['2023-12-01T14:23:23.914Z', '2024-12-01T14:23:23.914Z']);
      expect(service.formatFieldValue('[1,2]', 'NUMBER', 'in')).toEqual([1, 2]);
      expect(() =>
        service.formatFieldValue('2024-12-01T14:23:23.914Z', null, 'in'),
      ).toThrow();
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
          'and(fieldString[gt]:"value",or(fieldNumber[is]:NOT_NULL,not(fieldString[startsWith]:"val"),and(fieldNumber[eq]:6,fieldString[ilike]:"%val%")),or(fieldNumber[eq]:4,fieldString[is]:NULL))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { fieldString: { gt: 'value' } },
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
});
