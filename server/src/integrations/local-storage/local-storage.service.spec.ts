import { Test, TestingModule } from '@nestjs/testing';
import { LocalStorageService } from './local-storage.service';
import { MODULE_OPTIONS_TOKEN } from './local-storage.module-definition';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStorageService,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LocalStorageService>(LocalStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
