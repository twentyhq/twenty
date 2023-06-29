import { Injectable } from '@nestjs/common';
import { CreateEventInput } from './dto/create-event.input';
import { HttpService } from '@nestjs/axios';
import { anonymize } from 'src/utils/anonymize';
import { User, Workspace } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(private readonly httpService: HttpService) {}

  create(
    createEventInput: CreateEventInput,
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

    this.httpService
      .post('https://t.twenty.com/api/v1/s2s/event', data, {
        headers: {
          'X-Auth-Token': 's2s.gs61um40nzhw7mh56uw1ft.4t4u3ku9ueu14cfg08yx91k',
        },
      })
      .subscribe({
        error: () => null,
      });

    return { success: true };
  }
}
