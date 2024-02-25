import { Test, TestingModule } from '@nestjs/testing';

import { FileStorageService } from './file-storage.service';
import { STORAGE_DRIVER } from './file-storage.constants';

describe('FileStorageService', () => {
  let service: FileStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: STORAGE_DRIVER,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
