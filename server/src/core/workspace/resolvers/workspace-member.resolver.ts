import * as TypeGraphQL from '@nestjs/graphql';
import { WorkspaceMember } from '../../@generated/workspace-member/workspace-member.model';

@TypeGraphQL.Resolver(() => WorkspaceMember)
export class WorkspaceMemberResolver {}
