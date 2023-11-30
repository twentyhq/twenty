import { Test, TestingModule } from '@nestjs/testing';

import { ApiRestService } from 'src/core/api-rest/api-rest.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

describe('ApiRestService', () => {
  let service: ApiRestService;
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
  describe('extractDeepestFilterQuery', () => {
    it('should extract the last encapsulated brackets', () => {
      const filterQuery = 'and(or(field_1[eq]:1,field_2[eq]:2))';
      const expectedResult = 'or(field_1[eq]:1,field_2[eq]:2)';
      expect(service.extractDeepestFilterQuery(filterQuery)).toEqual(
        expectedResult,
      );
    });
    it('should extract on complex filter query', () => {
      const filterQuery =
        'and(field_1[lte]:1,or(field_2[eq]:2,field_3[eq]:3,and(field_4[lte]:4,field_5[gte]:5),field_6[gte]:6))';
      const expectedResult = 'and(field_4[lte]:4,field_5[gte]:5)';
      expect(service.extractDeepestFilterQuery(filterQuery)).toEqual(
        expectedResult,
      );
    });
  });
  describe('computeStringFilterBlocks', () => {
    it('should deconstruct filter query', () => {
      const filterQuery = 'and(or(field_1[eq]:1,field_2[eq]:2),field_3[eq]:3)';
      const expectedResult = [
        'or(field_1[eq]:1,field_2[eq]:2)',
        'and(field_3[eq]:3)',
      ];
      expect(service.computeStringFilterBlocks(filterQuery)).toEqual(
        expectedResult,
      );
    });
  });
  describe('mergeFilterBlocks', () => {
    it('should merge filter blocks', () => {
      const filterBlocks = [
        { or: [{ field_1: { eq: 1 } }, { field_2: { eq: 2 } }] },
        { and: [{ field_3: { eq: 3 } }] },
      ];
      const expectedResult = {
        and: [
          { field_3: { eq: 3 } },
          { or: [{ field_1: { eq: 1 } }, { field_2: { eq: 2 } }] },
        ],
      };
      expect(service.mergeFilterBlocks(filterBlocks)).toEqual(expectedResult);
    });
  });
  describe('checkFilterQuery', () => {
    it('should check filter query', () => {
      expect(() => service.checkFilterQuery('(')).toThrow();
      expect(() => service.checkFilterQuery(')')).toThrow();
      expect(() => service.checkFilterQuery('(()')).toThrow();
      expect(() => service.checkFilterQuery('())')).toThrow();
      expect(() =>
        service.checkFilterQuery(
          'and(or(field_1[eq]:1,field_2[eq]:2)),field_3[eq]:3)',
        ),
      ).toThrow();
      expect(() =>
        service.checkFilterQuery(
          'and(or(field_1[eq]:1,field_2[eq]:2),field_3[eq]:3)',
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
});
