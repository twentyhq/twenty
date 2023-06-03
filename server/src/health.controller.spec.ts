import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { TerminusModule } from '@nestjs/terminus';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      imports: [TerminusModule],
      providers: [AppService],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
  });
});
