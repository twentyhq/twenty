import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentService } from './attachment.service';
import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/database/client-mock/jest-prisma-singleton';

describe('AttachmentService', () => {
  let service: AttachmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AttachmentService>(AttachmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
