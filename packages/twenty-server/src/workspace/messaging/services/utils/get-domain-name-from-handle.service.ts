import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDomainNameFromHandleService {
  constructor() {}

  public getDomainNameFromHandle(handle: string): string {
    return handle.split('@')?.[1].split('.').slice(-2).join('.').toLowerCase();
  }
}
