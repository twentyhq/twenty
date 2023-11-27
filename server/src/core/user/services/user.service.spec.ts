import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from 'src/core/user/user.entity';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: DataSourceService,
          useValue: {},
        },
        {
          provide: TypeORMService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
