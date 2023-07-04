import { Test, TestingModule } from '@nestjs/testing';
import { S3StorageService } from './s3-storage.service';
import { MODULE_OPTIONS_TOKEN } from './s3-storage.module-definition';

describe('S3StorageService', () => {
  let service: S3StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3StorageService,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<S3StorageService>(S3StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
