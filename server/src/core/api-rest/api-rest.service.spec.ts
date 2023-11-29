import { Test, TestingModule } from '@nestjs/testing';

import { ApiRestService } from 'src/core/api-rest/api-rest.service';

describe('ApiRestService', () => {
  let service: ApiRestService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiRestService],
    }).compile();

    service = module.get<ApiRestService>(ApiRestService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
