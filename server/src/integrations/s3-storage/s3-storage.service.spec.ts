import { Test, TestingModule } from '@nestjs/testing';
import { S3StorageService } from './s3-storage.service';

describe('AwsS3Service', () => {
  let service: S3StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3StorageService],
    }).compile();

    service = module.get<S3StorageService>(S3StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
