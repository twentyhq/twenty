import { Test, TestingModule } from '@nestjs/testing';

import { OrderByDirection } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { OrderByParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/order-by-parser.factory';
import { objectMetadataItem } from 'src/core/api-rest/utils/__tests__/utils';

describe('OrderByParserFactory', () => {
  const objectMetadata = { objectMetadataItem: objectMetadataItem };
  let service: OrderByParserFactory;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderByParserFactory],
    }).compile();
    service = module.get<OrderByParserFactory>(OrderByParserFactory);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should return default if order by missing', () => {
      const request: any = { query: {} };
      expect(service.create(request, objectMetadata)).toEqual({});
    });
    it('should create order by parser properly', () => {
      const request: any = {
        query: {
          order_by: 'fieldNumber[AscNullsFirst],fieldString[DescNullsLast]',
        },
      };
      expect(service.create(request, objectMetadata)).toEqual({
        fieldNumber: OrderByDirection.AscNullsFirst,
        fieldString: OrderByDirection.DescNullsLast,
      });
    });
    it('should choose default direction if missing', () => {
      const request: any = {
        query: {
          order_by: 'fieldNumber',
        },
      };
      expect(service.create(request, objectMetadata)).toEqual({
        fieldNumber: OrderByDirection.AscNullsFirst,
      });
    });
    it('should handler complex fields', () => {
      const request: any = {
        query: {
          order_by: 'fieldCurrency.amountMicros',
        },
      };
      expect(service.create(request, objectMetadata)).toEqual({
        fieldCurrency: { amountMicros: OrderByDirection.AscNullsFirst },
      });
    });
    it('should handler complex fields with direction', () => {
      const request: any = {
        query: {
          order_by: 'fieldCurrency.amountMicros[DescNullsLast]',
        },
      };
      expect(service.create(request, objectMetadata)).toEqual({
        fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast },
      });
    });
    it('should handler multiple complex fields with direction', () => {
      const request: any = {
        query: {
          order_by:
            'fieldCurrency.amountMicros[DescNullsLast],fieldLink.label[AscNullsLast]',
        },
      };
      expect(service.create(request, objectMetadata)).toEqual({
        fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast },
        fieldLink: { label: OrderByDirection.AscNullsLast },
      });
    });
  });
});
