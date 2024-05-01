import { Type } from '@nestjs/common';

import { EntitySchema } from 'typeorm';

export class ObjectLiteralStorage {
  private static readonly objects: Map<EntitySchema, Type<any>> = new Map();

  public static getObjectLiteral(target: EntitySchema): Type<any> | undefined {
    return this.objects.get(target);
  }

  public static setObjectLiteral(
    target: EntitySchema,
    objectLiteral: Type<any>,
  ): void {
    this.objects.set(target, objectLiteral);
  }

  public static getAllObjects(): Type<any>[] {
    return Array.from(this.objects.values());
  }

  public static getAllEntitySchemas(): EntitySchema[] {
    return Array.from(this.objects.keys());
  }

  public static clear(): void {
    this.objects.clear();
  }
}
