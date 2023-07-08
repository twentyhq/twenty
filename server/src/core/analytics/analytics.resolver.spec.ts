import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsResolver } from './analytics.resolver';
import { AnalyticsService } from './analytics.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

describe('AnalyticsResolver', () => {
  let resolver: AnalyticsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsResolver,
        AnalyticsService,
        {
          provide: EnvironmentService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<AnalyticsResolver>(AnalyticsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
