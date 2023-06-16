import { Test, TestingModule } from '@nestjs/testing';
import { CompanyResolver } from './company.resolver';
import { CompanyService } from './company.service';
import { UpdateOneGuard } from 'src/guards/update-one.guard';
import { CanActivate } from '@nestjs/common';
import { DeleteManyGuard } from 'src/guards/delete-many.guard';
import { CreateOneGuard } from 'src/guards/create-one.guard';

describe('CompanyResolver', () => {
  let resolver: CompanyResolver;

  beforeEach(async () => {
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyResolver,
        {
          provide: CompanyService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(UpdateOneGuard)
      .useValue(mockGuard)
      .overrideGuard(DeleteManyGuard)
      .useValue(mockGuard)
      .overrideGuard(CreateOneGuard)
      .useValue(mockGuard)
      .compile();

    resolver = module.get<CompanyResolver>(CompanyResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
