import { Injectable, Logger } from '@nestjs/common';

export interface LeadScoreInput {
  emailOpens: number;
  emailClicks: number;
  pageViews: number;
  formSubmissions: number;
  websiteVisits: number;
  daysSinceLastActivity: number;
  emailResponseRate: number;
  eventAttendance: number;
  contentDownloads: number;
  socialEngagement: number;
}

export interface LeadScoreOutput {
  score: number;
  grade: 'HOT' | 'WARM' | 'COLD';
  conversionProbability: number;
  recommendedAction: string;
  factors: Array<{ factor: string; impact: number }>;
}

@Injectable()
export class LeadScoringService {
  private readonly logger = new Logger(LeadScoringService.name);

  private readonly weights: Record<string, number> = {
    emailOpens: 2,
    emailClicks: 5,
    pageViews: 1,
    formSubmissions: 15,
    websiteVisits: 1,
    daysSinceLastActivity: -3,
    emailResponseRate: 10,
    eventAttendance: 20,
    contentDownloads: 8,
    socialEngagement: 3,
  };

  calculateScore(input: LeadScoreInput): LeadScoreOutput {
    let totalScore = 0;
    const factors: Array<{ factor: string; impact: number }> = [];

    totalScore += input.emailOpens * this.weights.emailOpens;
    if (input.emailOpens > 0) {
      factors.push({ factor: 'Email opens', impact: input.emailOpens * this.weights.emailOpens });
    }

    totalScore += input.emailClicks * this.weights.emailClicks;
    if (input.emailClicks > 0) {
      factors.push({ factor: 'Email clicks', impact: input.emailClicks * this.weights.emailClicks });
    }

    totalScore += input.pageViews * this.weights.pageViews;
    if (input.pageViews > 0) {
      factors.push({ factor: 'Page views', impact: input.pageViews * this.weights.pageViews });
    }

    totalScore += input.formSubmissions * this.weights.formSubmissions;
    if (input.formSubmissions > 0) {
      factors.push({ factor: 'Form submissions', impact: input.formSubmissions * this.weights.formSubmissions });
    }

    totalScore += input.websiteVisits * this.weights.websiteVisits;

    if (input.daysSinceLastActivity < 7) {
      totalScore += 20;
      factors.push({ factor: 'Recent activity', impact: 20 });
    } else if (input.daysSinceLastActivity > 30) {
      totalScore += input.daysSinceLastActivity * this.weights.daysSinceLastActivity;
      factors.push({ factor: 'Inactive', impact: input.daysSinceLastActivity * this.weights.daysSinceLastActivity });
    }

    totalScore += input.emailResponseRate * this.weights.emailResponseRate;
    if (input.emailResponseRate > 0) {
      factors.push({ factor: 'Email responses', impact: input.emailResponseRate * this.weights.emailResponseRate });
    }

    totalScore += input.eventAttendance * this.weights.eventAttendance;
    if (input.eventAttendance > 0) {
      factors.push({ factor: 'Event attendance', impact: input.eventAttendance * this.weights.eventAttendance });
    }

    totalScore += input.contentDownloads * this.weights.contentDownloads;
    if (input.contentDownloads > 0) {
      factors.push({ factor: 'Content downloads', impact: input.contentDownloads * this.weights.contentDownloads });
    }

    totalScore += input.socialEngagement * this.weights.socialEngagement;

    const grade = this.determineGrade(totalScore);
    const conversionProbability = this.calculateConversionProbability(totalScore);
    const recommendedAction = this.getRecommendedAction(grade, totalScore);

    return {
      score: Math.max(0, Math.min(100, totalScore)),
      grade,
      conversionProbability,
      recommendedAction,
      factors: factors.sort((a, b) => b.impact - a.impact).slice(0, 5),
    };
  }

  private determineGrade(score: number): 'HOT' | 'WARM' | 'COLD' {
    if (score >= 50) return 'HOT';
    if (score >= 25) return 'WARM';
    return 'COLD';
  }

  private calculateConversionProbability(score: number): number {
    if (score >= 80) return 75;
    if (score >= 60) return 50;
    if (score >= 40) return 25;
    if (score >= 20) return 10;
    return 3;
  }

  private getRecommendedAction(grade: 'HOT' | 'WARM' | 'COLD', score: number): string {
    switch (grade) {
      case 'HOT':
        return 'Contactar inmediatamente para demostración';
      case 'WARM':
        return 'Enviar contenido relevante y agendar llamada';
      case 'COLD':
        return 'Añadir a secuencia de nurturing';
    }
  }

  batchScore(
    leads: Array<{ leadId: string; data: LeadScoreInput }>,
  ): Array<{ leadId: string; result: LeadScoreOutput }> {
    return leads.map((lead) => ({
      leadId: lead.leadId,
      result: this.calculateScore(lead.data),
    }));
  }
}
