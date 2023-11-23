export interface MemoryStorageSerializer<T> {
  serialize(item: T): string;
  deserialize(data: string): T;
}
