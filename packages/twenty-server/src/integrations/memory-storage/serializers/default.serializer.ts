import { MemoryStorageSerializer } from 'src/integrations/memory-storage/serializers/interfaces/memory-storage-serializer.interface';

export class MemoryStorageDefaultSerializer<T>
  implements MemoryStorageSerializer<T>
{
  serialize(item: T): string {
    if (typeof item !== 'string') {
      throw new Error('DefaultSerializer can only serialize strings');
    }

    return item;
  }

  deserialize(data: string): T {
    return data as unknown as T;
  }
}
