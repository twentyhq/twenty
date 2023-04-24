import {
  HasuraInsertEvent,
  TrackedHasuraEventHandler,
} from '@golevelup/nestjs-hasura';
import { UserRepository } from './user.repository';
import { Injectable, Response } from '@nestjs/common';
import { WorkspaceRepository } from './workspace.repository';
import { response } from 'express';

interface User {
  id: number;
  email: string;
}

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private workspaceRepository: WorkspaceRepository,
  ) {}

  @TrackedHasuraEventHandler({
    triggerName: 'user-created',
    tableName: 'users',
    schema: 'auth',
    definition: { type: 'insert' },
  })
  async handleUserCreated(evt: HasuraInsertEvent<User>) {
    const emailDomain = evt.event.data.new.email.split('@')[1];

    if (!emailDomain) {
      return;
    }

    const workspace = await this.workspaceRepository.findWorkspaceByDomainName({
      where: { domain_name: emailDomain },
    });

    if (!workspace) {
      return;
    }

    const workspaceMember = await this.repository.upsertWorkspaceMember({
      data: {
        user_id: String(evt.event.data.new.id),
        workspace_id: workspace.id,
      },
    });
  }
}
