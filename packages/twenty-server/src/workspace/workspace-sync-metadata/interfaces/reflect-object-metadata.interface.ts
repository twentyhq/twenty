import { GateDecoratorParams } from 'src/workspace/workspace-sync-metadata/interfaces/gate-decorator.interface';

export interface ObjectMetadataDecoratorParams {
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
