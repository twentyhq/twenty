import { Test, TestingModule } from '@nestjs/testing';
import { PersonService } from './person.service';
import { PrismaService } from 'src/database/prisma.service';
import { prismaMock } from 'src/prisma-mock/jest-prisma-singleton';

describe('PersonService', () => {
  let service: PersonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
