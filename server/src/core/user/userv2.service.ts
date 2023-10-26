import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserV2 } from './userv2.entity';

@Injectable()
export class UserV2Service {
  constructor(
    @InjectRepository(UserV2)
    private usersRepository: Repository<UserV2>,
  ) {}

  async findAll() {
    return this.usersRepository.find();
  }
}
