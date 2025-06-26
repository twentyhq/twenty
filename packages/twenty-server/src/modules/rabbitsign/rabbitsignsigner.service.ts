import { Injectable } from '@nestjs/common';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { RabbitSignSignerWorkspaceEntity } from './standard-objects/rabbitsignsigner.workplace-entity';

interface SignerData {
  personId: string;
  status: string;
  signingOrder: number;
}

@Injectable()
export class RabbitSignSignerService extends TypeOrmQueryService<RabbitSignSignerWorkspaceEntity> {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(null as any);
  }

  async createSigners(
    workspaceId: string,
    signatureId: string,
    signersData: SignerData[],
  ): Promise<RabbitSignSignerWorkspaceEntity[]> {
    const rabbitSignSignerRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignerWorkspaceEntity>(
        workspaceId,
        'rabbitSignSigner',
      );

    const signers = signersData.map(signerData => ({
      ...signerData,
      signatureId,
    }));

    return await rabbitSignSignerRepository.save(signers);
  }

  async updateSignerStatus(
    workspaceId: string,
    signerId: string,
    status: string,
  ): Promise<RabbitSignSignerWorkspaceEntity | null> {
    const rabbitSignSignerRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignerWorkspaceEntity>(
        workspaceId,
        'rabbitSignSigner',
      );

    await rabbitSignSignerRepository.update(
      { id: signerId },
      { status }
    );

    return await rabbitSignSignerRepository.findOne({
      where: { id: signerId },
    });
  }

  async getSignersBySignatureId(
    workspaceId: string,
    signatureId: string,
  ): Promise<RabbitSignSignerWorkspaceEntity[]> {
    const rabbitSignSignerRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignerWorkspaceEntity>(
        workspaceId,
        'rabbitSignSigner',
      );

    return await rabbitSignSignerRepository.find({
      where: { signatureId },
      order: { signingOrder: 'ASC' },
      relations: ['person'],
    });
  }

  async updateSignersFromRabbitSignData(
    workspaceId: string,
    signatureId: string,
    rabbitSignData: {
      signers: Array<{
        email: string;
        name: string;
        status: string;
        signingOrder: number;
      }>;
    },
  ): Promise<void> {
    const rabbitSignSignerRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignerWorkspaceEntity>(
        workspaceId,
        'rabbitSignSigner',
      );

    // Get existing signers with their person relations to access primary email
    const existingSigners = await rabbitSignSignerRepository.find({
      where: { signatureId },
      relations: ['person'],
      order: { signingOrder: 'ASC' },
    });

    // Create a map of primary email to existing signer for efficient lookup
    const emailToSignerMap = new Map<string, RabbitSignSignerWorkspaceEntity>();
    
    for (const existingSigner of existingSigners) {
      if (existingSigner.person?.emails?.primaryEmail) {
        emailToSignerMap.set(existingSigner.person.emails.primaryEmail.toLowerCase(), existingSigner);
      }
    }

    // Update signers by matching email addresses
    for (const rabbitSigner of rabbitSignData.signers) {
      const existingSigner = emailToSignerMap.get(rabbitSigner.email.toLowerCase());
      
      if (existingSigner) {
        await rabbitSignSignerRepository.update(
          { id: existingSigner.id },
          { 
            status: rabbitSigner.status,
            signingOrder: rabbitSigner.signingOrder,
          }
        );
      } else {
        console.warn(`No signer found for email: ${rabbitSigner.email} in signature ${signatureId}`);
      }
    }

    // Log summary of updates
    const updatedCount = rabbitSignData.signers.filter(signer => 
      emailToSignerMap.has(signer.email.toLowerCase())
    ).length;
    
    console.log(`Updated ${updatedCount} out of ${rabbitSignData.signers.length} signers for signature ${signatureId}`);
  }
} 