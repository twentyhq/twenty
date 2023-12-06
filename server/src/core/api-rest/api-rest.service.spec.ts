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
      expect(service.formatFieldValue(1, 'NUMBER')).toEqual(1);
      expect(service.formatFieldValue('a', 'NUMBER')).toEqual(NaN);
      expect(service.formatFieldValue('true', 'BOOLEAN')).toEqual(true);
      expect(service.formatFieldValue('True', 'BOOLEAN')).toEqual(true);
      expect(service.formatFieldValue('false', 'BOOLEAN')).toEqual(false);
      expect(service.formatFieldValue('1', 'TEXT')).toEqual('1');
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
});
