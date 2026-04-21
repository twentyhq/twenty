import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { DocuSignService } from 'src/modules/electronic-signature/services/docusign.service';
import {
  SignatureRequestWorkspaceEntity,
  SignatureSignerWorkspaceEntity,
  SignatureEventWorkspaceEntity,
  SignatureRequestStatus,
  SignatureProvider
} from 'src/modules/electronic-signature/standard-objects/signature-request.workspace-entity';

export interface CreateSignatureRequestDto {
  name: string;
  description?: string;
  documentId: string;
  signers: Array<{
    email: string;
    name: string;
    role?: string;
    order: number;
  }>;
  message?: string;
  expirationDays?: number;
  reminderEnabled?: boolean;
  reminderInterval?: number;
  requireInPerson?: boolean;
  enableSigningOrder?: boolean;
  redirectUrl?: string;
  provider?: SignatureProvider;
}

export interface SignatureStatusResponse {
  requestId: string;
  status: SignatureRequestStatus;
  documentId: string;
  documentUrl: string | null;
  signedDocumentUrl: string | null;
  signedDocumentId: string | null;
  signers: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    signedAt: Date | null;
    declinedReason: string | null;
    signatureUrl: string | null;
  }>;
  createdAt: Date;
  expirationDate: Date | null;
  signedAt: Date | null;
}

export interface SignatureValidationResult {
  isValid: boolean;
  signatureId: string;
  signedAt: Date;
  signerInfo: {
    email: string;
    name: string;
    ipAddress: string | null;
    userAgent: string | null;
  };
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    description: string;
    ipAddress: string | null;
  }>;
}

@Injectable()
export class ElectronicSignatureService {
  private readonly logger = new Logger(ElectronicSignatureService.name);

  constructor(
    @InjectRepository(SignatureRequestWorkspaceEntity)
    private readonly signatureRequestRepository: Repository<SignatureRequestWorkspaceEntity>,
    @InjectRepository(SignatureSignerWorkspaceEntity)
    private readonly signatureSignerRepository: Repository<SignatureSignerWorkspaceEntity>,
    @InjectRepository(SignatureEventWorkspaceEntity)
    private readonly signatureEventRepository: Repository<SignatureEventWorkspaceEntity>,
    private readonly docuSignService: DocuSignService,
  ) {}

  async createSignatureRequest(createDto: CreateSignatureRequestDto, createdById: string): Promise<SignatureRequestWorkspaceEntity> {
    this.logger.log(`Creating signature request: ${createDto.name}`);

    const signatureRequest = this.signatureRequestRepository.create({
      name: createDto.name,
      description: createDto.description,
      status: SignatureRequestStatus.DRAFT,
      provider: createDto.provider || SignatureProvider.DOCUSIGN,
      documentId: createDto.documentId,
      message: createDto.message,
      expirationDate: createDto.expirationDays ?
        new Date(Date.now() + createDto.expirationDays * 24 * 60 * 60 * 1000) :
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      reminderEnabled: createDto.reminderEnabled ?? true,
      reminderInterval: createDto.reminderInterval || 24, // Default 24 hours
      maxReminders: 5,
      requireInPerson: createDto.requireInPerson ?? false,
      enableSigningOrder: createDto.enableSigningOrder ?? true,
      redirectUrl: createDto.redirectUrl,
      createdById,
    });

    const savedRequest = await this.signatureRequestRepository.save(signatureRequest);

    // Create signers
    const signers = await Promise.all(
      createDto.signers.map(async (signerDto, index) => {
        const signer = this.signatureSignerRepository.create({
          name: signerDto.name,
          email: signerDto.email,
          role: signerDto.role || 'Signer',
          order: signerDto.order,
          status: 'created',
          signatureRequestId: savedRequest.id,
        });
        return await this.signatureSignerRepository.save(signer);
      }),
    );

    // Log creation event
    await this.logEvent(savedRequest.id, 'request_created', 'Signature request created', null, null);

    // Send to provider if not draft
    if (savedRequest.status !== SignatureRequestStatus.DRAFT) {
      await this.sendToProvider(savedRequest.id);
    }

    return await this.getSignatureRequestById(savedRequest.id);
  }

  async sendToProvider(requestId: string): Promise<void> {
    this.logger.log(`Sending signature request to provider: ${requestId}`);

    const signatureRequest = await this.getSignatureRequestById(requestId);
    const signers = await this.signatureSignerRepository.find({
      where: { signatureRequestId: requestId },
      order: { order: 'ASC' },
    });

    try {
      // Prepare data for DocuSign
      const docuSignRequest = {
        recipients: signers.map(signer => ({
          email: signer.email,
          name: signer.name,
          role: signer.role || 'Signer',
          order: signer.order,
        })),
        subject: signatureRequest.name,
        message: signatureRequest.message || '',
        expirationDays: signatureRequest.expirationDate ?
          Math.ceil((signatureRequest.expirationDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) :
          30,
        reminderEnabled: signatureRequest.reminderEnabled,
        reminderInterval: signatureRequest.reminderInterval || 24,
      };

      // Send to DocuSign
      const response = await this.docuSignService.createEnvelope(docuSignRequest);

      // Update request with provider data
      await this.signatureRequestRepository.update(requestId, {
        status: SignatureRequestStatus.SENT,
        providerRequestId: response.envelopeId,
        providerEnvelopeId: response.envelopeId,
      });

      // Update signers with provider data
      for (let i = 0; i < response.recipients.length; i++) {
        const recipient = response.recipients[i];
        const signer = signers[i];

        await this.signatureSignerRepository.update(signer.id, {
          status: recipient.status,
          providerSignerId: recipient.recipientId,
          signatureUrl: recipient.signingUrl,
        });
      }

      // Log sent event
      await this.logEvent(requestId, 'sent_to_provider', 'Sent to DocuSign', null, null);

    } catch (error) {
      this.logger.error('Error sending to provider:', error);

      // Update status to indicate error
      await this.signatureRequestRepository.update(requestId, {
        status: SignatureRequestStatus.DRAFT, // Revert to draft on error
      });

      throw new BadRequestException('Failed to send signature request to provider');
    }
  }

  async getSignatureRequestById(id: string): Promise<SignatureRequestWorkspaceEntity> {
    const request = await this.signatureRequestRepository.findOne({
      where: { id },
      relations: ['createdBy', 'signers'],
    });

    if (!request) {
      throw new NotFoundException(`Signature request with ID ${id} not found`);
    }

    return request;
  }

  async getSignatureStatus(requestId: string): Promise<SignatureStatusResponse> {
    this.logger.log(`Getting signature status: ${requestId}`);

    const signatureRequest = await this.getSignatureRequestById(requestId);
    const signers = await this.signatureSignerRepository.find({
      where: { signatureRequestId: requestId },
      order: { order: 'ASC' },
    });

    let updatedSigners = signers;

    // If sent to provider, get live status
    if (signatureRequest.providerEnvelopeId) {
      try {
        const providerStatus = await this.docuSignService.getEnvelopeStatus(signatureRequest.providerEnvelopeId);

        // Update local status based on provider
        const newStatus = this.mapProviderStatus(providerStatus.status);
        if (newStatus !== signatureRequest.status) {
          await this.signatureRequestRepository.update(requestId, {
            status: newStatus,
          });
          signatureRequest.status = newStatus;
        }

        // Update signer statuses
        for (let i = 0; i < providerStatus.recipients.length; i++) {
          const providerRecipient = providerStatus.recipients[i];
          const localSigner = signers[i];

          if (localSigner && localSigner.status !== providerRecipient.status) {
            await this.signatureSignerRepository.update(localSigner.id, {
              status: providerRecipient.status,
              signedAt: providerRecipient.signedAt || null,
            });
          }
        }

        // Refresh signers after update
        updatedSigners = await this.signatureSignerRepository.find({
          where: { signatureRequestId: requestId },
          order: { order: 'ASC' },
        });

      } catch (error) {
        this.logger.warn('Error getting provider status:', error);
      }
    }

    return {
      requestId: signatureRequest.id,
      status: signatureRequest.status,
      documentId: signatureRequest.documentId,
      documentUrl: signatureRequest.documentUrl,
      signedDocumentUrl: signatureRequest.signedDocumentUrl,
      signedDocumentId: signatureRequest.signedDocumentId,
      signers: updatedSigners.map(signer => ({
        id: signer.id,
        email: signer.email,
        name: signer.name,
        role: signer.role || 'Signer',
        status: signer.status,
        signedAt: signer.signedAt,
        declinedReason: signer.declinedReason,
        signatureUrl: signer.signatureUrl,
      })),
      createdAt: signatureRequest.createdAt,
      expirationDate: signatureRequest.expirationDate,
      signedAt: null, // Will be set when all signers complete
    };
  }

  async sendReminder(requestId: string, signerEmail?: string): Promise<void> {
    this.logger.log(`Sending reminder for request: ${requestId}`);

    const signatureRequest = await this.getSignatureRequestById(requestId);

    if (!signatureRequest.providerEnvelopeId) {
      throw new BadRequestException('Cannot send reminder for request not sent to provider');
    }

    if (signerEmail) {
      await this.docuSignService.createReminder(signatureRequest.providerEnvelopeId, signerEmail);
    } else {
      // Send to all signers
      const signers = await this.signatureSignerRepository.find({
        where: { signatureRequestId: requestId },
      });

      for (const signer of signers) {
        await this.docuSignService.createReminder(signatureRequest.providerEnvelopeId, signer.email);
      }
    }

    await this.logEvent(requestId, 'reminder_sent', `Reminder sent to ${signerEmail || 'all signers'}`, null, null);
  }

  async cancelRequest(requestId: string, reason?: string): Promise<void> {
    this.logger.log(`Cancelling signature request: ${requestId}`);

    const signatureRequest = await this.getSignatureRequestById(requestId);

    // Cancel with provider if sent
    if (signatureRequest.providerEnvelopeId) {
      await this.docuSignService.voidEnvelope(signatureRequest.providerEnvelopeId);
    }

    // Update local status
    await this.signatureRequestRepository.update(requestId, {
      status: SignatureRequestStatus.CANCELLED,
    });

    await this.logEvent(requestId, 'cancelled', `Request cancelled: ${reason || 'No reason provided'}`, null, null);
  }

  async downloadSignedDocument(requestId: string): Promise<Buffer> {
    this.logger.log(`Downloading signed document: ${requestId}`);

    const signatureRequest = await this.getSignatureRequestById(requestId);

    if (signatureRequest.status !== SignatureRequestStatus.SIGNED) {
      throw new BadRequestException('Document is not fully signed yet');
    }

    if (signatureRequest.providerEnvelopeId) {
      try {
        const documentBuffer = await this.docuSignService.downloadSignedDocument(signatureRequest.providerEnvelopeId);

        // Update signed document URL (in real implementation, would upload to storage)
        await this.signatureRequestRepository.update(requestId, {
          signedDocumentUrl: `signed_documents/${requestId}.pdf`,
          signedDocumentId: `doc_${requestId}_signed`,
        });

        return documentBuffer;
      } catch (error) {
        this.logger.error('Error downloading from provider:', error);
        throw new BadRequestException('Failed to download signed document from provider');
      }
    }

    throw new BadRequestException('No signed document available');
  }

  async validateSignature(requestId: string): Promise<SignatureValidationResult> {
    this.logger.log(`Validating signature: ${requestId}`);

    const signatureRequest = await this.getSignatureRequestById(requestId);
    const events = await this.signatureEventRepository.find({
      where: { signatureRequestId: requestId },
      order: { eventTimestamp: 'ASC' },
    });

    if (signatureRequest.status !== SignatureRequestStatus.SIGNED) {
      return {
        isValid: false,
        signatureId: requestId,
        signedAt: new Date(),
        signerInfo: {
          email: '',
          name: '',
          ipAddress: null,
          userAgent: null,
        },
        auditTrail: [],
      };
    }

    // Get first signer as primary signer for validation
    const primarySigner = await this.signatureSignerRepository.findOne({
      where: { signatureRequestId: requestId },
      order: { order: 'ASC' },
    });

    return {
      isValid: true,
      signatureId: requestId,
      signedAt: primarySigner?.signedAt || new Date(),
      signerInfo: {
        email: primarySigner?.email || '',
        name: primarySigner?.name || '',
        ipAddress: primarySigner?.ipAddress || null,
        userAgent: null, // Would be stored in events
      },
      auditTrail: events.map(event => ({
        timestamp: event.eventTimestamp,
        action: event.eventType,
        description: event.description || '',
        ipAddress: event.ipAddress || null,
      })),
    };
  }

  async createEmbeddedSigningUrl(requestId: string, signerEmail: string, returnUrl?: string): Promise<string> {
    this.logger.log(`Creating embedded signing URL: ${requestId} for ${signerEmail}`);

    const signatureRequest = await this.getSignatureRequestById(requestId);

    if (!signatureRequest.providerEnvelopeId) {
      throw new BadRequestException('Request not sent to provider yet');
    }

    return await this.docuSignService.createEmbeddedSigningUrl(
      signatureRequest.providerEnvelopeId,
      signerEmail,
      returnUrl,
    );
  }

  async processWebhook(payload: any): Promise<void> {
    this.logger.log('Processing electronic signature webhook');

    try {
      const webhookData = await this.docuSignService.processWebhook(payload);

      if (!webhookData.envelopeId) {
        this.logger.warn('Invalid webhook payload - missing envelope ID');
        return;
      }

      // Find local request by provider envelope ID
      const signatureRequest = await this.signatureRequestRepository.findOne({
        where: { providerEnvelopeId: webhookData.envelopeId },
      });

      if (!signatureRequest) {
        this.logger.warn(`No local request found for envelope: ${webhookData.envelopeId}`);
        return;
      }

      // Update status based on webhook
      const newStatus = this.mapProviderStatus(webhookData.status);
      if (newStatus !== signatureRequest.status) {
        await this.signatureRequestRepository.update(signatureRequest.id, {
          status: newStatus,
        });
      }

      // Update signer if provided
      if (webhookData.recipient) {
        const signer = await this.signatureSignerRepository.findOne({
          where: {
            signatureRequestId: signatureRequest.id,
            email: webhookData.recipient.email,
          },
        });

        if (signer) {
          await this.signatureSignerRepository.update(signer.id, {
            status: webhookData.recipient.status,
            signedAt: webhookData.recipient.status === 'signed' ? new Date() : null,
          });
        }
      }

      // Log webhook event
      await this.logEvent(
        signatureRequest.id,
        'webhook_received',
        `Webhook: ${webhookData.status}`,
        null,
        null,
      );

    } catch (error) {
      this.logger.error('Error processing webhook:', error);
    }
  }

  private async logEvent(
    requestId: string,
    eventType: string,
    description: string,
    ipAddress: string | null,
    userAgent: string | null,
    signerId?: string,
  ): Promise<void> {
    const event = this.signatureEventRepository.create({
      eventType,
      eventTimestamp: new Date(),
      description,
      ipAddress,
      userAgent,
      signatureRequestId: requestId,
      signerId,
    });

    await this.signatureEventRepository.save(event);
  }

  private mapProviderStatus(providerStatus: string): SignatureRequestStatus {
    const statusMap: Record<string, SignatureRequestStatus> = {
      'created': SignatureRequestStatus.DRAFT,
      'sent': SignatureRequestStatus.SENT,
      'delivered': SignatureRequestStatus.DELIVERED,
      'signed': SignatureRequestStatus.SIGNED,
      'declined': SignatureRequestStatus.DECLINED,
      'expired': SignatureRequestStatus.EXPIRED,
      'voided': SignatureRequestStatus.CANCELLED,
    };

    return statusMap[providerStatus.toLowerCase()] || SignatureRequestStatus.DRAFT;
  }
}
