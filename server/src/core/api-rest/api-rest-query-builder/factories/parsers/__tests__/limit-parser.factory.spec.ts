import { Test, TestingModule } from '@nestjs/testing';

import { LimitParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/limit-parser.factory';

describe('LimitParserFactory', () => {
  let service: LimitParserFactory;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LimitParserFactory],
    }).compile();
    service = module.get<LimitParserFactory>(LimitParserFactory);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should return default if limit missing', () => {
      const request: any = { query: {} };
      expect(service.create(request)).toEqual(60);
    });
    it('should return limit', () => {
      const request: any = { query: { limit: '10' } };
      expect(service.create(request)).toEqual(10);
    });
    it('should throw if not integer', () => {
      const request: any = { query: { limit: 'aaa' } };
      expect(() => service.create(request)).toThrow(
        "limit 'aaa' is invalid. Should be an integer",
      );
    });
  });
});
