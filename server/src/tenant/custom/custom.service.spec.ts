import { Test, TestingModule } from '@nestjs/testing';

import { CustomService } from './custom.service';

describe('CustomService', () => {
  let service: CustomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomService],
    }).compile();

    service = module.get<CustomService>(CustomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
