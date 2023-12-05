import { Test, TestingModule } from '@nestjs/testing';

import { objectMetadataItem } from 'src/core/api-rest/utils/__tests__/utils';
import { FilterParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/filter-parser.factory';

describe('FilterParserFactory', () => {
  const objectMetadata = { objectMetadataItem: objectMetadataItem };
  let service: FilterParserFactory;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilterParserFactory],
    }).compile();
    service = module.get<FilterParserFactory>(FilterParserFactory);
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
        "'filter' invalid for 'fieldNumber[wrongComparator]:1'. eg: price[gte]:10",
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
            'and(fieldNumber[eq]:1,fieldString[gte]:"Test",not(fieldString[ilike]:"%val%"),or(not(fieldString[startsWith]:"test"),fieldCurrency.amountMicros[gt]:1))',
        },
      };
      expect(service.create(request, objectMetadata)).toEqual({
        and: [
          { fieldNumber: { eq: 1 } },
          { fieldString: { gte: 'Test' } },
          { not: { fieldString: { ilike: '%val%' } } },
          {
            or: [
              { not: { fieldString: { startsWith: 'test' } } },
              { fieldCurrency: { amountMicros: { gt: '1' } } },
            ],
          },
        ],
      });
    });
  });
});
