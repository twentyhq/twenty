import { Test, TestingModule } from '@nestjs/testing';

import { MetadataResolver } from './metadata.resolver';
import { MetadataService } from './metadata.service';

describe('MetadataResolver', () => {
  let resolver: MetadataResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataResolver,
        {
          provide: MetadataService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<MetadataResolver>(MetadataResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
