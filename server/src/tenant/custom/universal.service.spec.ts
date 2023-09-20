import { Test, TestingModule } from '@nestjs/testing';

import { UnivervalService } from './universal.service';

describe('UnivervalService', () => {
  let service: UnivervalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnivervalService],
    }).compile();

    service = module.get<UnivervalService>(UnivervalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
