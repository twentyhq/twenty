import { ContextType, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CustomContextCreator {
  create(context: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getResponse: () => context.res,
        getRequest: () => context.req,
        getNext: () => context.next,
      }),
      switchToWs: () => ({
        getClient: () => ({} as any),
        getData: () => ({} as any),
      }),
      switchToRpc: () => ({
        getContext: () => ({} as any),
        getData: () => ({} as any),
      }),
      getClass: () => new ({} as any)(),
      getHandler: () => new ({} as any)(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      getType: () => 'http' as ContextType,
    };
  }
}
