import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { S3StorageService } from 'src/integrations/s3-storage/s3-storage.service';
import { LocalStorageService } from 'src/integrations/local-storage/local-storage.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: S3StorageService,
          useValue: {},
        },
        {
          provide: LocalStorageService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
