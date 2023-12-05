import { Test, TestingModule } from '@nestjs/testing';

import { LastCursorParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/last-cursor-parser.factory';

describe('LastCursorParserFactory', () => {
  let service: LastCursorParserFactory;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LastCursorParserFactory],
    }).compile();
    service = module.get<LastCursorParserFactory>(LastCursorParserFactory);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should return default if last_cursor missing', () => {
      const request: any = { query: {} };
      expect(service.create(request)).toEqual(undefined);
    });
    it('should return last_cursor', () => {
      const request: any = { query: { last_cursor: 'uuid' } };
      expect(service.create(request)).toEqual('uuid');
    });
  });
});
