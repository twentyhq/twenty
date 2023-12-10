import { MemoryStorageSerializer } from 'src/integrations/memory-storage/serializers/interfaces/memory-storage-serializer.interface';

import { MemoryStorageDriver } from './interfaces/memory-storage-driver.interface';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LocalMemoryDriverOptions {}

export class LocalMemoryDriver<T> implements MemoryStorageDriver<T> {
  private identifier: string;
  private options: LocalMemoryDriverOptions;
  private serializer: MemoryStorageSerializer<T>;
  private storage: Map<string, string> = new Map();

  constructor(
    identifier: string,
    options: LocalMemoryDriverOptions,
    serializer: MemoryStorageSerializer<T>,
  ) {
    this.identifier = identifier;
    this.options = options;
    this.serializer = serializer;
  }

  async write(params: { key: string; data: T }): Promise<void> {
    const compositeKey = this.generateCompositeKey(params.key);
    const serializedData = this.serializer.serialize(params.data);

    this.storage.set(compositeKey, serializedData);
  }

  async read(params: { key: string }): Promise<T | null> {
    const compositeKey = this.generateCompositeKey(params.key);

    if (!this.storage.has(compositeKey)) {
      return null;
    }

    const data = this.storage.get(compositeKey);

    if (!data) {
      return null;
    }

    const deserializeData = this.serializer.deserialize(data);

    return deserializeData;
  }

  async delete(params: { key: string }): Promise<void> {
    const compositeKey = this.generateCompositeKey(params.key);

    if (!this.storage.has(compositeKey)) {
      return;
    }

    this.storage.delete(compositeKey);
  }

  private generateCompositeKey(key: string): string {
    return `${this.identifier}:${key}`;
  }
}
