import { Test, TestingModule } from '@nestjs/testing';

import { ApiRestService } from 'src/core/api-rest/api-rest.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

describe('ApiRestService', () => {
  let service: ApiRestService;
  const objectMetadataItem = { fields: [{ name: 'field', type: 'NUMBER' }] };
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
          'and(or(field[eq]:1,field[eq]:2)),field[eq]:3)',
        ),
      ).toThrow();
      expect(() =>
        service.checkFilterQuery(
          'and(or(field[eq]:1,field[eq]:2),field[eq]:3)',
        ),
      ).not.toThrow();
    });
  });
  describe('formatFieldValue', () => {
    it('should format field value', () => {
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
      expect(service.parseFilterQueryContent('and(field[eq]:1)')).toEqual([
        'field[eq]:1',
      ]);
    });
    it('should parse query filter test 2', () => {
      expect(
        service.parseFilterQueryContent('and(field[eq]:1,field[eq]:2)'),
      ).toEqual(['field[eq]:1', 'field[eq]:2']);
    });
    it('should parse query filter test 3', () => {
      expect(
        service.parseFilterQueryContent(
          'and(field[eq]:1,or(field[eq]:2,field[eq]:3))',
        ),
      ).toEqual(['field[eq]:1', 'or(field[eq]:2,field[eq]:3)']);
    });
    it('should parse query filter test 4', () => {
      expect(
        service.parseFilterQueryContent(
          'and(field[eq]:1,or(field[eq]:2,not(field[eq]:3)),field[eq]:4,not(field[eq]:5))',
        ),
      ).toEqual([
        'field[eq]:1',
        'or(field[eq]:2,not(field[eq]:3))',
        'field[eq]:4',
        'not(field[eq]:5)',
      ]);
    });
    it('should parse query filter test 5', () => {
      expect(
        service.parseFilterQueryContent('and(field[in]:[1,2],field[eq]:4)'),
      ).toEqual(['field[in]:[1,2]', 'field[eq]:4']);
    });
  });
  describe('parseStringFilter', () => {
    it('should parse string filter test 1', () => {
      expect(
        service.parseStringFilter(
          'and(field[eq]:1,field[eq]:2)',
          objectMetadataItem,
        ),
      ).toEqual({ and: [{ field: { eq: 1 } }, { field: { eq: 2 } }] });
    });
    it('should parse string filter test 2', () => {
      expect(
        service.parseStringFilter(
          'and(field[eq]:1,or(field[eq]:2,field[eq]:3))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { field: { eq: 1 } },
          { or: [{ field: { eq: 2 } }, { field: { eq: 3 } }] },
        ],
      });
    });
    it('should parse string filter test 3', () => {
      expect(
        service.parseStringFilter(
          'and(field[eq]:1,or(field[eq]:2,field[eq]:3,and(field[eq]:6,field[eq]:7)),or(field[eq]:4,field[eq]:5))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { field: { eq: 1 } },
          {
            or: [
              { field: { eq: 2 } },
              { field: { eq: 3 } },
              { and: [{ field: { eq: 6 } }, { field: { eq: 7 } }] },
            ],
          },
          { or: [{ field: { eq: 4 } }, { field: { eq: 5 } }] },
        ],
      });
    });
    it('should handler not', () => {
      expect(
        service.parseStringFilter(
          'and(field[eq]:1,not(field[eq]:2))',
          objectMetadataItem,
        ),
      ).toEqual({
        and: [
          { field: { eq: 1 } },
          {
            not: { field: { eq: 2 } },
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
        service.parseSimpleFilterString('field[gt]:valStart]:[valEnd'),
      ).toEqual({
        fields: ['field'],
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
        value: '2023-12-01T14:23:23.914Z',
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
