import { Injectable } from '@nestjs/common';
import { User, Workspace } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';
import { CreateAnalyticsInput } from './dto/create-analytics.input';
import { anonymize } from 'src/utils/anonymize';

@Injectable()
export class AnalyticsService {
  private readonly httpService: AxiosInstance;

  constructor() {
    this.httpService = axios.create({
      baseURL: 'https://t.twenty.com/api/v1/s2s',
    });
  }

  async create(
    createEventInput: CreateAnalyticsInput,
    user: User | undefined,
    workspace: Workspace | undefined,
  ) {
    if (process.env.IS_TELEMETRY_ENABLED === 'false') {
      return;
    }

    const data = {
      type: createEventInput.type,
      data: {
        userUUID: user ? anonymize(user.id) : undefined,
        workspaceUUID: workspace ? anonymize(workspace.id) : undefined,
        workspaceDomain: workspace ? workspace.domainName : undefined,
        ...createEventInput.data,
      },
    };

    try {
      await this.httpService.post('/event?noToken', data);
    } catch {}

    return { success: true };
  }
}
