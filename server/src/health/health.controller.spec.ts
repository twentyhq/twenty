import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from 'src/health/health.controller';
import { PrismaHealthIndicator } from 'src/health/indicators/prisma-health-indicator';

describe('HealthController', () => {
  let healthController: HealthController;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        HealthController,
        {
          provide: HealthCheckService,
          useValue: {},
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {},
        },
        {
          provide: HttpHealthIndicator,
          useValue: {},
        },
      ],
    }).compile();

    healthController = testingModule.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
  });
});
