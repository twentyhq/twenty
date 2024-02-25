import { Test, TestingModule } from '@nestjs/testing';

import { FILE_STORAGE_DRIVER } from 'src/integrations/file-storage/constants/FileStorageDriver';

import { FileStorageService } from './file-storage.service';

describe('FileStorageService', () => {
  let service: FileStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: FILE_STORAGE_DRIVER,
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
