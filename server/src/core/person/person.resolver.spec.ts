import { Test, TestingModule } from '@nestjs/testing';
import { PersonResolver } from './person.resolver';
import { PersonService } from './person.service';
import { UpdateOneGuard } from 'src/guards/update-one.guard';
import { CanActivate } from '@nestjs/common';
import { DeleteManyGuard } from 'src/guards/delete-many.guard';
import { CreateOneGuard } from 'src/guards/create-one.guard';
import { AbilityFactory } from 'src/ability/ability.factory';

describe('PersonResolver', () => {
  let resolver: PersonResolver;

  beforeEach(async () => {
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonResolver,
        {
          provide: PersonService,
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

    resolver = module.get<PersonResolver>(PersonResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
