import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate } from '@nestjs/common';

import { UpdateOneGuard } from 'src/guards/update-one.guard';
import { DeleteManyGuard } from 'src/guards/delete-many.guard';
import { CreateOneGuard } from 'src/guards/create-one.guard';
import { AbilityFactory } from 'src/ability/ability.factory';

import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';

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
        {
          provide: AbilityFactory,
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
