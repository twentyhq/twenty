import { UserRepository } from './user.repository';
import { Injectable, Response } from '@nestjs/common';
import { WorkspaceRepository } from './workspace.repository';
import { v4 } from 'uuid';

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

  async handleUserCreated(evt: any) {
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
        id: v4(),
        user_id: String(evt.event.data.new.id),
        workspace_id: workspace.id,
      },
    });
  }
}
