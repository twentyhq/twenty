import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

export interface ObjectMetadataDecoratorParams {
  standardId: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
}

export interface ReflectObjectMetadata extends ObjectMetadataDecoratorParams {
  nameSingular: string;
  targetTableName: string;
  isSystem: boolean;
  isCustom: boolean;
  gate?: GateDecoratorParams;
}
