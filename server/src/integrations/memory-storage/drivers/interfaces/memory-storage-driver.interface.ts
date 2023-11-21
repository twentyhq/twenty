export interface MemoryStorageDriver<T> {
  read(params: { key: string }): Promise<T | null>;
  write(params: { key: string; data: T }): Promise<void>;
  delete(params: { key: string }): Promise<void>;
}
