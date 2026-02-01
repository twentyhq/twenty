
import { Test, TestingModule } from '@nestjs/testing';
import { ImapService } from './imap.service';

describe('ImapService', () => {
  let service: ImapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImapService],
    }).compile();

    service = module.get<ImapService>(ImapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
