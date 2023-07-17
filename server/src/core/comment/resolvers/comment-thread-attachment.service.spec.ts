import { Test, TestingModule } from '@nestjs/testing';
import { CommentThreadAttachmentService } from './comment-thread-attachment.service';

describe('CommentThreadAttachmentService', () => {
  let service: CommentThreadAttachmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentThreadAttachmentService],
    }).compile();

    service = module.get<CommentThreadAttachmentService>(
      CommentThreadAttachmentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
