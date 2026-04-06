import { Injectable, Logger } from '@nestjs/common';

export interface ChatMessage {
  sessionId: string;
  sender: 'VISITOR' | 'AGENT' | 'SYSTEM';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class LiveChatService {
  private readonly logger = new Logger(LiveChatService.name);
  private readonly activeSessions = new Map<string, Set<(msg: ChatMessage) => void>>();
  private readonly inMemorySessions = new Map<string, { messages: ChatMessage[]; status: string }>();

  async createSession(visitorData: {
    visitorName?: string | null;
    visitorEmail?: string | null;
    visitorPhone?: string | null;
    source: string;
    currentPage?: string | null;
  }): Promise<{ id: string; sessionId: string; status: string }> {
    const sessionId = this.generateSessionId();
    this.inMemorySessions.set(sessionId, { messages: [], status: 'WAITING' });
    this.logger.log(`Created chat session ${sessionId} from ${visitorData.source}`);
    return { id: sessionId, sessionId, status: 'WAITING' };
  }

  async sendMessage(sessionId: string, sender: 'VISITOR' | 'AGENT', content: string): Promise<void> {
    const session = this.inMemorySessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    const msg: ChatMessage = { sessionId, sender, content, timestamp: new Date() };
    session.messages.push(msg);
    if (sender === 'AGENT') session.status = 'ACTIVE';
    this.broadcastMessage(sessionId, msg);
  }

  subscribeToSession(sessionId: string, callback: (msg: ChatMessage) => void): () => void {
    if (!this.activeSessions.has(sessionId)) {
      this.activeSessions.set(sessionId, new Set());
    }
    this.activeSessions.get(sessionId)!.add(callback);
    return () => this.activeSessions.get(sessionId)?.delete(callback);
  }

  private broadcastMessage(sessionId: string, message: ChatMessage): void {
    this.activeSessions.get(sessionId)?.forEach((cb) => cb(message));
  }

  async assignAgent(sessionId: string, agentId: string): Promise<void> {
    this.logger.log(`Assigning agent ${agentId} to session ${sessionId}`);
  }

  async resolveSession(sessionId: string, rating?: number, feedback?: string): Promise<void> {
    const session = this.inMemorySessions.get(sessionId);
    if (session) session.status = 'RESOLVED';
    this.logger.log(`Resolved session ${sessionId}, rating: ${rating}, feedback: ${feedback}`);
  }

  async getActiveChats(): Promise<unknown[]> {
    return [];
  }

  async getChatStats(): Promise<{
    active: number;
    waiting: number;
    resolved: number;
    avgResponseTime: number;
    avgDuration: number;
    satisfaction: number;
  }> {
    return { active: 0, waiting: 0, resolved: 0, avgResponseTime: 0, avgDuration: 0, satisfaction: 0 };
  }

  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
