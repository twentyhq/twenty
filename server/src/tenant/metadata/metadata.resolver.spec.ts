import { Test, TestingModule } from '@nestjs/testing';

import { MetadataResolver } from './metadata.resolver';

describe('MetadataResolver', () => {
  let resolver: MetadataResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetadataResolver],
    }).compile();

    resolver = module.get<MetadataResolver>(MetadataResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
