import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateOneRabbitSignSignatureInput } from 'src/modules/rabbitsign/dtos/create-one-rabbit-sign-signature.input';
import { CreateOneRabbitSignSignatureOutput } from 'src/modules/rabbitsign/dtos/create-one-rabbit-sign-signature.output';
import { RabbitSignSignatureService } from './rabbitsignsignature.service';

@Resolver()
@UseGuards(WorkspaceAuthGuard)
export class RabbitSignResolver {
  constructor(
    private readonly rabbitSignSignatureService: RabbitSignSignatureService,
    private readonly fileService: FileService,
  ) {}

  @Mutation(() => CreateOneRabbitSignSignatureOutput, {
    name: 'createRabbitSignSignatureWithExternalCall',
  })
  async createRabbitSignSignatureWithExternalCall(
    @Args('input') input: CreateOneRabbitSignSignatureInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<CreateOneRabbitSignSignatureOutput> {
    // Extract workspaceId from the context
    const workspaceId = workspace.id;
    
    // Parse the signatures data
    const signatures = input.signaturesData ? JSON.parse(input.signaturesData) : [];
    
    // Convert signatures to signers format for RabbitSign
    const signers = signatures.map((signature: any) => ({
      email: signature.email,
      name: signature.name,
      signaturePosition: {
        x: signature.x,
        y: signature.y,
        width: signature.width,
        height: signature.height,
        pageIndex: signature.pageIndex,
      },
    }));

    // Fetch PDF data from the file URL
    let pdfBuffer: Buffer | undefined;
    if (input.filename) {
      try {
        const response = await fetch(input.filename);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        pdfBuffer = Buffer.from(await response.arrayBuffer());
      } catch (error) {
        console.error('Failed to fetch PDF data:', error);
        throw new Error(`Failed to fetch PDF data from URL: ${error.message}`);
      }
    }

    const signature = await this.rabbitSignSignatureService.createSignatureWithExternalCall({
      title: input.title,
      workspaceMemberId: input.workspaceMemberId,
      workspaceId,
      attachmentId: input.attachmentId,
      pdfBuffer,
      signers,
    });

    return {
      id: signature.id,
    };
  }
}
