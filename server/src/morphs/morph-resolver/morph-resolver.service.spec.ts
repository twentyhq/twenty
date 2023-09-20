import { Test, TestingModule } from '@nestjs/testing';

import { MorphResolverService } from './morph-resolver.service';

describe('MorphResolverService', () => {
  let service: MorphResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MorphResolverService],
    }).compile();

    service = module.get<MorphResolverService>(MorphResolverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
