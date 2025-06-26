import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { CreateOneRabbitSignSignatureInput } from './dtos/create-one-rabbit-sign-signature.input';
import { CreateOneRabbitSignSignatureOutput } from './dtos/create-one-rabbit-sign-signature.output';
import { UpdateRabbitSignSignatureWebhookInput } from './dtos/update-rabbit-sign-signature-webhook.input';
import { RabbitSignWebhookController } from './rabbitsign-webhook.controller';
import { RabbitSignResolver } from './rabbitsign.resolver';
import { RabbitSignKeyService } from './rabbitsignkey.service';
import { RabbitSignSignatureService } from './rabbitsignsignature.service';
import { RabbitSignSignerService } from './rabbitsignsigner.service';

@Module({
  imports: [
    DomainManagerModule,
  ],
  controllers: [RabbitSignWebhookController],
  providers: [
    JwtService,
    JwtWrapperService,
    FileService,
    CreateOneRabbitSignSignatureInput,
    CreateOneRabbitSignSignatureOutput,
    UpdateRabbitSignSignatureWebhookInput,
    RabbitSignKeyService,
    RabbitSignSignatureService,
    RabbitSignSignerService,
    RabbitSignResolver,
    WorkspaceRepository,
  ],
  exports: [
    CreateOneRabbitSignSignatureInput,
    CreateOneRabbitSignSignatureOutput,
    UpdateRabbitSignSignatureWebhookInput,
  ],
})

export class RabbitSignModule {}
