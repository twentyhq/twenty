import { MemoryStorageDriver } from 'src/integrations/memory-storage/drivers/interfaces/memory-storage-driver.interface';

export class MemoryStorageService<T> implements MemoryStorageDriver<T> {
  private driver: MemoryStorageDriver<T>;

  constructor(driver: MemoryStorageDriver<T>) {
    this.driver = driver;
  }

  write(params: { key: string; data: T }): Promise<void> {
    return this.driver.write(params);
  }

  read(params: { key: string }): Promise<T | null> {
    return this.driver.read(params);
  }

  delete(params: { key: string }): Promise<void> {
    return this.driver.delete(params);
  }
}
