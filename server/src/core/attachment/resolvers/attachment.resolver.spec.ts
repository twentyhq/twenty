import { Test, TestingModule } from '@nestjs/testing';

import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { AttachmentService } from 'src/core/attachment/services/attachment.service';
import { AbilityFactory } from 'src/ability/ability.factory';

import { AttachmentResolver } from './attachment.resolver';

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
        {
          provide: AbilityFactory,
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
