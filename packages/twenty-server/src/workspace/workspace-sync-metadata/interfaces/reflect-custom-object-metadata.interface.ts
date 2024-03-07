import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

export type BaseCustomObjectMetadataDecoratorParams =
  | { allowObjectNameList?: string[] }
  | { denyObjectNameList?: string[] };

export type ReflectBaseCustomObjectMetadata =
  BaseCustomObjectMetadataDecoratorParams & {
    gate?: GateDecoratorParams;
  };
