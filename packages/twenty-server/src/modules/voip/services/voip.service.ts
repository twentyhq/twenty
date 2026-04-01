import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CallWorkspaceEntity } from 'src/modules/voip/standard-objects/call.workspace-entity';

@Injectable()
export class VoIPService {
  private readonly logger = new Logger(VoIPService.name);

  constructor(
    @InjectRepository(CallWorkspaceEntity, 'core')
    private readonly callRepository: Repository<CallWorkspaceEntity>,
  ) {}

  async initiateCall(
    phoneNumber: string,
    contactId: string | null,
    assigneeId: string,
  ): Promise<CallWorkspaceEntity> {
    const call = this.callRepository.create({
      name: `Call to ${phoneNumber}`,
      status: 'INITIATED',
      direction: 'OUTBOUND',
      phoneNumber,
      contactId,
      assigneeId,
      startedAt: new Date(),
    });

    return this.callRepository.save(call);
  }

  async recordCall(
    callId: string,
    duration: number,
    recordingUrl: string | null,
    notes: string | null,
  ): Promise<void> {
    await this.callRepository.update(callId, {
      status: 'COMPLETED',
      duration,
      recordingUrl,
      notes,
      endedAt: new Date(),
    });
  }

  async transcribeCall(callId: string, transcription: string): Promise<void> {
    const sentiment = this.analyzeSentiment(transcription);
    await this.callRepository.update(callId, {
      transcription,
      sentiment,
      sentimentScore: sentiment === 'POSITIVE' ? 0.8 : sentiment === 'NEGATIVE' ? 0.2 : 0.5,
    });
  }

  private analyzeSentiment(text: string): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' {
    const positiveWords = ['great', 'excellent', 'thank you', 'happy', 'love', 'perfect', 'wonderful', 'gracias', 'excelente'];
    const negativeWords = ['bad', 'terrible', 'hate', 'angry', 'frustrated', 'problem', 'issue', 'malo', 'problema'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (lowerText.includes(word)) positiveCount++;
    }
    for (const word of negativeWords) {
      if (lowerText.includes(word)) negativeCount++;
    }

    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  async getCallHistory(assigneeId: string, limit = 50): Promise<CallWorkspaceEntity[]> {
    return this.callRepository.find({
      where: { assigneeId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getCallStats(assigneeId: string): Promise<{
    totalCalls: number;
    totalDuration: number;
    avgDuration: number;
    answeredCalls: number;
    missedCalls: number;
  }> {
    const calls = await this.callRepository.find({ where: { assigneeId } });

    const totalCalls = calls.length;
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const answeredCalls = calls.filter(c => c.status === 'COMPLETED').length;
    const missedCalls = calls.filter(c => c.status === 'NO_ANSWER').length;

    return {
      totalCalls,
      totalDuration,
      avgDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
      answeredCalls,
      missedCalls,
    };
  }
}
