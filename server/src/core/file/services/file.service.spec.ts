import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { S3StorageService } from 'src/integrations/s3-storage/s3-storage.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: S3StorageService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
