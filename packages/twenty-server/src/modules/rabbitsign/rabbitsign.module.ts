import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { CreateOneRabbitSignSignatureInput } from './dtos/create-one-rabbit-sign-signature.input';
import { CreateOneRabbitSignSignatureOutput } from './dtos/create-one-rabbit-sign-signature.output';
import { RabbitSignResolver } from './rabbitsign.resolver';
import { RabbitSignKeyService } from './rabbitsignkey.service';
import { RabbitSignSignatureService } from './rabbitsignsignature.service';

@Module({
  providers: [
    JwtService,
    JwtWrapperService,
    FileService,
    CreateOneRabbitSignSignatureInput,
    CreateOneRabbitSignSignatureOutput,
    RabbitSignKeyService,
    RabbitSignSignatureService,
    RabbitSignResolver,
  ],
  exports: [
    CreateOneRabbitSignSignatureInput,
    CreateOneRabbitSignSignatureOutput,
  ],
})

export class RabbitSignModule {}
