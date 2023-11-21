import { Test, TestingModule } from '@nestjs/testing';

import { MemoryStorageService } from './memory-storage.service';

describe('MemoryStorageService', () => {
  let service: MemoryStorageService<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryStorageService],
    }).compile();

    service = module.get<MemoryStorageService<any>>(MemoryStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
