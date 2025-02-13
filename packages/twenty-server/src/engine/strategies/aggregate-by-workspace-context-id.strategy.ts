import {
  ContextId,
  ContextIdFactory,
  ContextIdStrategy,
  HostComponentInfo,
} from '@nestjs/core';

import { Request } from 'express';
import { jwtDecode } from 'jwt-decode';
import { isDefined } from 'twenty-shared';

import { JwtPayload } from 'src/engine/core-modules/auth/types/auth-context.type';

const workspaces = new Map<string, ContextId>();

export class AggregateByWorkspaceContextIdStrategy
  implements ContextIdStrategy
{
  attach(contextId: ContextId, request: Request) {
    const token = request.header('Authorization')?.replace('Bearer ', '');
    const jwtPayload = token ? jwtDecode<JwtPayload>(token) : null;
    let workspaceSubTreeId: ContextId;

    if (!jwtPayload) {
      return () => contextId;
    }

    const subTreeId = workspaces.get(jwtPayload.workspaceId);

    if (isDefined(subTreeId)) {
      workspaceSubTreeId = subTreeId;
    } else {
      workspaceSubTreeId = ContextIdFactory.create();
      workspaces.set(jwtPayload.workspaceId, workspaceSubTreeId);
    }

    // If tree is not durable, return the original "contextId" object
    return (info: HostComponentInfo) =>
      info.isTreeDurable ? workspaceSubTreeId : contextId;
  }
}
