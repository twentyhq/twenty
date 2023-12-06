import { Test, TestingModule } from '@nestjs/testing';

import { ExceptionCapturerService } from 'src/integrations/exception-capturer/exception-capturer.service';

import { EXCEPTION_CAPTURER_DRIVER } from './exception-capturer.constants';

describe('ExceptionCapturerService', () => {
  let service: ExceptionCapturerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExceptionCapturerService,
        {
          provide: EXCEPTION_CAPTURER_DRIVER,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExceptionCapturerService>(ExceptionCapturerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
