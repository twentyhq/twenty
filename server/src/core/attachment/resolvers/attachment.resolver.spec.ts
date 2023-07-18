import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentResolver } from './attachment.resolver';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { AttachmentService } from '../services/attachment.service';

describe('AttachmentResolver', () => {
  let resolver: AttachmentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentResolver,
        {
          provide: FileUploadService,
          useValue: {},
        },
        {
          provide: AttachmentService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<AttachmentResolver>(AttachmentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
