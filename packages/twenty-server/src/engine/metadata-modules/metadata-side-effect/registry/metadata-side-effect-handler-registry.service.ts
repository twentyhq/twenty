import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { METADATA_SIDE_EFFECT_HANDLER_METADATA_KEY } from 'src/engine/metadata-modules/metadata-side-effect/constants/metadata-side-effect-handler-metadata-key.constant';
import { MetadataSideEffectHandlersModule } from 'src/engine/metadata-modules/metadata-side-effect/handlers/metadata-side-effect-handlers.module';
import { type BaseMetadataSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import {
  buildMetadataSideEffectHandlerKey,
  type MetadataSideEffectHandlerDescriptor,
  type MetadataSideEffectHandlerKey,
  type MetadataSideEffectOperation,
} from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operation.type';

type RegisteredSideEffectHandler =
  BaseMetadataSideEffectHandlerService<AllMetadataName>;

export type RegisteredMetadataSideEffectHandlerKey = {
  operation: MetadataSideEffectOperation;
  metadataName: AllMetadataName;
};

@Injectable()
export class MetadataSideEffectHandlerRegistryService implements OnModuleInit {
  private readonly handlersByKey = new Map<
    MetadataSideEffectHandlerKey,
    RegisteredSideEffectHandler[]
  >();
  private readonly registeredHandlerKeys: RegisteredMetadataSideEffectHandlerKey[] =
    [];
  private readonly registeredSideEffectNames = new Set<string>();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit() {
    this.discoverAndRegisterHandlers();
  }

  private discoverAndRegisterHandlers(): void {
    const providers = this.discoveryService.getProviders({
      include: [MetadataSideEffectHandlersModule],
    });

    providers.forEach((wrapper) => {
      const { instance, metatype } = wrapper;

      if (!instance || !metatype) return;

      const descriptor: MetadataSideEffectHandlerDescriptor | undefined =
        Reflect.getMetadata(
          METADATA_SIDE_EFFECT_HANDLER_METADATA_KEY,
          metatype,
        );

      if (
        !isDefined(descriptor) ||
        typeof instance.buildSideEffects !== 'function'
      ) {
        return;
      }

      this.registerHandler(instance);
    });
  }

  private registerHandler(instance: RegisteredSideEffectHandler): void {
    if (this.registeredSideEffectNames.has(instance.sideEffectName)) {
      throw new Error(
        `Duplicate metadata side-effect name "${instance.sideEffectName}". Side-effect names must be unique.`,
      );
    }
    this.registeredSideEffectNames.add(instance.sideEffectName);

    const handlerKey = buildMetadataSideEffectHandlerKey(
      instance.operation,
      instance.metadataName,
    );
    const existingHandlers = this.handlersByKey.get(handlerKey);

    if (isDefined(existingHandlers)) {
      existingHandlers.push(instance);

      return;
    }

    this.handlersByKey.set(handlerKey, [instance]);
    this.registeredHandlerKeys.push({
      operation: instance.operation,
      metadataName: instance.metadataName,
    });
  }

  getHandlers(
    operation: MetadataSideEffectOperation,
    metadataName: AllMetadataName,
  ): RegisteredSideEffectHandler[] {
    return (
      this.handlersByKey.get(
        buildMetadataSideEffectHandlerKey(operation, metadataName),
      ) ?? []
    );
  }

  getRegisteredHandlerKeys(): RegisteredMetadataSideEffectHandlerKey[] {
    return this.registeredHandlerKeys;
  }
}
