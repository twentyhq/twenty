import { Test, type TestingModule } from '@nestjs/testing';

import { LeadScoringService } from 'src/modules/lead-scoring/services/lead-scoring.service';

describe('LeadScoringService', () => {
  let service: LeadScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadScoringService],
    }).compile();

    service = module.get(LeadScoringService);
  });

  it('calculates score, grade and action from engagement signals', () => {
    const result = service.calculateScore({
      emailOpens: 1,
      emailClicks: 1,
      pageViews: 2,
      formSubmissions: 1,
      websiteVisits: 5,
      daysSinceLastActivity: 10,
      emailResponseRate: 1,
      eventAttendance: 0,
      contentDownloads: 0,
      socialEngagement: 0,
    });

    expect(result).toMatchObject({
      score: 39,
      grade: 'WARM',
      conversionProbability: 10,
    });
    expect(result.recommendedAction).toContain('llamada');
    expect(result.factors.map((factor) => factor.factor)).toEqual([
      'Form submissions',
      'Email responses',
      'Email clicks',
      'Email opens',
      'Page views',
    ]);
  });

  it('scores batches consistently', () => {
    const result = service.batchScore([
      {
        leadId: 'lead-1',
        data: {
          emailOpens: 0,
          emailClicks: 0,
          pageViews: 0,
          formSubmissions: 0,
          websiteVisits: 0,
          daysSinceLastActivity: 40,
          emailResponseRate: 0,
          eventAttendance: 0,
          contentDownloads: 0,
          socialEngagement: 0,
        },
      },
      {
        leadId: 'lead-2',
        data: {
          emailOpens: 2,
          emailClicks: 2,
          pageViews: 1,
          formSubmissions: 1,
          websiteVisits: 1,
          daysSinceLastActivity: 2,
          emailResponseRate: 1,
          eventAttendance: 1,
          contentDownloads: 1,
          socialEngagement: 1,
        },
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      leadId: 'lead-1',
      result: {
        grade: 'COLD',
      },
    });
    expect(result[1].result.score).toBeGreaterThan(result[0].result.score);
  });
});
