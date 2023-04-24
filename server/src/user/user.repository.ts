import { Injectable } from '@nestjs/common';
import { Prisma, WorkspaceMember } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UserRepository {
    constructor(private prisma: PrismaService) {}

    async upsertWorkspaceMember(params: { data: Prisma.WorkspaceMemberCreateInput }): Promise<WorkspaceMember> {
      const { data } = params;

      return await this.prisma.workspaceMember.upsert({
        where: {
            user_id: data.user_id,
        },
        create: {
          user_id: data.user_id,
          workspace_id: data.workspace_id,
        },
        update: {
        }
      });
    }
}