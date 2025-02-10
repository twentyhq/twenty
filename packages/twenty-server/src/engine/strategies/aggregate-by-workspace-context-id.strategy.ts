import {
  ContextId,
  ContextIdFactory,
  ContextIdStrategy,
  HostComponentInfo,
} from '@nestjs/core';

import { Request } from 'express';
import { jwtDecode } from 'jwt-decode';

import { JwtPayload } from 'src/engine/core-modules/auth/types/auth-context.type';
import { genericValidator } from 'src/engine/utils/assert-is-defined-or-throw';

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

    if (workspaces.has(jwtPayload.workspaceId)) {
      const subTreeId = workspaces.get(jwtPayload.workspaceId);

      genericValidator.assertIsDefinedOrThrow(subTreeId);
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
