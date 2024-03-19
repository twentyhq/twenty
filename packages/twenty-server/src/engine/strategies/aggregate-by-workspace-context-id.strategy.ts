import {
  HostComponentInfo,
  ContextId,
  ContextIdFactory,
  ContextIdStrategy,
} from '@nestjs/core';

import { jwtDecode } from 'jwt-decode';
import { Request } from 'express';

import { JwtPayload } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';

const workspaces = new Map<string, ContextId>();

export class AggregateByWorkspaceContextIdStrategy
  implements ContextIdStrategy
{
  attach(contextId: ContextId, request: Request) {
    console.log('attach', contextId);
    const token = request.header('Authorization')?.replace('Bearer ', '');
    const jwtPayload = token ? jwtDecode<JwtPayload>(token) : null;
    let workspaceSubTreeId: ContextId;

    console.log('contextId', contextId);

    if (!jwtPayload) {
      return () => contextId;
    }

    console.log('jwtPayload', jwtPayload);

    if (workspaces.has(jwtPayload.workspaceId)) {
      workspaceSubTreeId = workspaces.get(jwtPayload.workspaceId)!;
    } else {
      workspaceSubTreeId = ContextIdFactory.create();
      workspaces.set(jwtPayload.workspaceId, workspaceSubTreeId);
    }

    // If tree is not durable, return the original "contextId" object
    return (info: HostComponentInfo) =>
      info.isTreeDurable ? workspaceSubTreeId : contextId;
  }
}
