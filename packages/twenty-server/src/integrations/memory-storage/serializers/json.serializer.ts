import { MemoryStorageSerializer } from 'src/integrations/memory-storage/serializers/interfaces/memory-storage-serializer.interface';

export class MemoryStorageJsonSerializer<T>
  implements MemoryStorageSerializer<T>
{
  serialize(item: T): string {
    return JSON.stringify(item);
  }

  deserialize(data: string): T {
    return JSON.parse(data) as T;
  }
}
