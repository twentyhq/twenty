import { Injectable } from '@nestjs/common';
import { User, Workspace } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';
import { CreateAnalyticsInput } from './dto/create-analytics.input';
import { anonymize } from 'src/utils/anonymize';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class AnalyticsService {
  private readonly httpService: AxiosInstance;

  constructor(private readonly environmentService: EnvironmentService) {
    this.httpService = axios.create({
      baseURL: 'https://t.twenty.com/api/v1/s2s',
    });
  }

  async create(
    createEventInput: CreateAnalyticsInput,
    user: User | undefined,
    workspace: Workspace | undefined,
  ) {
    if (!this.environmentService.isTelemetryEnabled()) {
      return { success: true };
    }

    const anonymizationEnabled =
      this.environmentService.isTelemetryAnonymizationEnabled();

    const data = {
      type: createEventInput.type,
      data: {
        userUUID: user
          ? anonymizationEnabled
            ? anonymize(user.id)
            : user.id
          : undefined,
        workspaceUUID: workspace
          ? anonymizationEnabled
            ? anonymize(workspace.id)
            : workspace.id
          : undefined,
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
