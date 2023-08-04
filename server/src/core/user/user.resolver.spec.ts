import { Test, TestingModule } from '@nestjs/testing';

import { AbilityFactory } from 'src/ability/ability.factory';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

describe('UserResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: AbilityFactory,
          useValue: {},
        },
        {
          provide: FileUploadService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
