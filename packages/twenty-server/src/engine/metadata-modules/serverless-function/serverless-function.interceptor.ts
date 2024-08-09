import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';

import { FileService } from 'src/engine/core-modules/file/services/file.service';

@Injectable()
export class ServerlessFunctionInterceptor implements NestInterceptor {
  constructor(private readonly fileService: FileService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async (data) => {
        if (data.edges && Array.isArray(data.edges)) {
          return {
            ...data,
            edges: Promise.all(
              data.edges.map((item) => ({
                ...item,
                node: this.processItem(item.node),
              })),
            ),
          };
        } else {
          return this.processItem(data);
        }
      }),
    );
  }

  private async processItem(item: any): Promise<any> {
    if (item && item.sourceCodeFullPath) {
      const workspaceId = item.workspace?.id || item.workspaceId;

      if (!workspaceId) {
        return item;
      }

      const signedPayload = await this.fileService.encodeFileToken({
        serverlessFunctionId: item.id,
        workspace_id: workspaceId,
      });

      return {
        ...item,
        sourceCodeFullPath: `${item.sourceCodeFullPath}?token=${signedPayload}`,
      };
    }

    return item;
  }
}
