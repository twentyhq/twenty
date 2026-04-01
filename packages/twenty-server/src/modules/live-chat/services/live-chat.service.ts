import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatSessionWorkspaceEntity } from 'src/modules/live-chat/standard-objects/chat-session.workspace-entity';

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
  private activeSessions = new Map<string, Set<(msg: ChatMessage) => void>>();

  constructor(
    @InjectRepository(ChatSessionWorkspaceEntity, 'core')
    private readonly chatRepository: Repository<ChatSessionWorkspaceEntity>,
  ) {}

  async createSession(visitorData: {
    visitorName?: string | null;
    visitorEmail?: string | null;
    visitorPhone?: string | null;
    source: string;
    currentPage?: string | null;
  }): Promise<ChatSessionWorkspaceEntity> {
    const sessionId = this.generateSessionId();
    
    const session = this.chatRepository.create({
      name: `Chat ${sessionId}`,
      status: 'WAITING',
      sessionId,
      visitorName: visitorData.visitorName,
      visitorEmail: visitorData.visitorEmail,
      visitorPhone: visitorData.visitorPhone,
      source: visitorData.source,
      currentPage: visitorData.currentPage,
      startedAt: new Date(),
      messages: JSON.stringify([]),
    });

    return this.chatRepository.save(session);
  }

  async sendMessage(
    sessionId: string,
    sender: 'VISITOR' | 'AGENT',
    content: string,
  ): Promise<void> {
    const session = await this.chatRepository.findOne({
      where: { sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const messages: ChatMessage[] = session.messages
      ? JSON.parse(session.messages)
      : [];

    const newMessage: ChatMessage = {
      sessionId,
      sender,
      content,
      timestamp: new Date(),
    };

    messages.push(newMessage);

    const newStatus = sender === 'AGENT' ? 'ACTIVE' : session.status;
    
    await this.chatRepository.update(session.id, {
      messages: JSON.stringify(messages),
      status: newStatus,
      ...(sender === 'AGENT' && !session.firstResponseAt
        ? { firstResponseAt: new Date() }
        : {}),
    });

    this.broadcastMessage(sessionId, newMessage);
  }

  subscribeToSession(
    sessionId: string,
    callback: (msg: ChatMessage) => void,
  ): () => void {
    if (!this.activeSessions.has(sessionId)) {
      this.activeSessions.set(sessionId, new Set());
    }
    this.activeSessions.get(sessionId)!.add(callback);

    return () => {
      this.activeSessions.get(sessionId)?.delete(callback);
    };
  }

  private broadcastMessage(sessionId: string, message: ChatMessage): void {
    const subscribers = this.activeSessions.get(sessionId);
    if (subscribers) {
      subscribers.forEach((callback) => callback(message));
    }
  }

  async assignAgent(sessionId: string, agentId: string): Promise<void> {
    await this.chatRepository.update(
      { sessionId },
      { assignedToId: agentId, status: 'ACTIVE' },
    );
  }

  async resolveSession(sessionId: string, rating?: number, feedback?: string): Promise<void> {
    await this.chatRepository.update(
      { sessionId },
      {
        status: 'RESOLVED',
        rating,
        feedback,
        endedAt: new Date(),
      },
    );
  }

  async getActiveChats(): Promise<ChatSessionWorkspaceEntity[]> {
    return this.chatRepository.find({
      where: [
        { status: 'WAITING' },
        { status: 'ACTIVE' },
        { status: 'ON_HOLD' },
      ],
      order: { startedAt: 'ASC' },
    });
  }

  async getChatStats(): Promise<{
    active: number;
    waiting: number;
    resolved: number;
    avgResponseTime: number;
    avgDuration: number;
    satisfaction: number;
  }> {
    const sessions = await this.chatRepository.find();

    const active = sessions.filter(s => s.status === 'ACTIVE').length;
    const waiting = sessions.filter(s => s.status === 'WAITING').length;
    const resolved = sessions.filter(s => s.status === 'RESOLVED' || s.status === 'CLOSED').length;

    const withResponse = sessions.filter(s => s.firstResponseAt && s.startedAt);
    const avgResponseTime = withResponse.length > 0
      ? withResponse.reduce((sum, s) => {
          const diff = new Date(s.firstResponseAt!).getTime() - new Date(s.startedAt!).getTime();
          return sum + diff;
        }, 0) / withResponse.length / 1000 / 60
      : 0;

    const closed = sessions.filter(s => s.endedAt && s.startedAt);
    const avgDuration = closed.length > 0
      ? closed.reduce((sum, s) => {
          const diff = new Date(s.endedAt!).getTime() - new Date(s.startedAt!).getTime();
          return sum + diff;
        }, 0) / closed.length / 1000 / 60
      : 0;

    const rated = sessions.filter(s => s.rating !== null);
    const satisfaction = rated.length > 0
      ? rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length
      : 0;

    return { active, waiting, resolved, avgResponseTime, avgDuration, satisfaction };
  }

  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
