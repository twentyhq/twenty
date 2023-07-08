import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { FileModule } from '../file/file.module';

@Module({
  imports: [FileModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
