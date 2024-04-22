import { GateDecoratorParams } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/gate-decorator.interface';

import { TypedReflect } from 'src/utils/typed-reflect';

export const Gate =
  (metadata: GateDecoratorParams) => (target: object, fieldKey?: string) => {
    if (fieldKey) {
      TypedReflect.defineMetadata('gate', metadata, target, fieldKey);
    } else {
      TypedReflect.defineMetadata('gate', metadata, target);
    }
  };
