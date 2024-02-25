import { Test, TestingModule } from '@nestjs/testing';

import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';

import { EXCEPTION_HANDLER_DRIVER } from './constants/ExceptionHandlerDriver';

describe('ExceptionHandlerService', () => {
  let service: ExceptionHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExceptionHandlerService,
        {
          provide: EXCEPTION_HANDLER_DRIVER,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExceptionHandlerService>(ExceptionHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
