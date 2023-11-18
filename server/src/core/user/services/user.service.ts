import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { assert } from 'src/utils/assert';
import { User } from 'src/core/user/user.entity';

export class UserService extends TypeOrmQueryService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async deleteUser({
    workspaceId: _workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }) {
    const user = await this.userRepository.findBy({ id: userId });
    assert(user, 'User not found');

    return user;
  }
}
