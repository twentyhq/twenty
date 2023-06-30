import { Resolver } from '@nestjs/graphql';
import { WorkspaceMember } from '../../@generated/workspace-member/workspace-member.model';

@Resolver(() => WorkspaceMember)
export class WorkspaceMemberResolver {}
