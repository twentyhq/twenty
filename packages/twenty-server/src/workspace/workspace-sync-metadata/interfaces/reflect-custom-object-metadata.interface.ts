import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

export type ExtendCustomObjectMetadataDecoratorParams =
  | { allowObjectNameList?: string[] }
  | { denyObjectNameList?: string[] };

export type ReflectExtendCustomObjectMetadata =
  ExtendCustomObjectMetadataDecoratorParams & {
    gate?: GateDecoratorParams;
  };
