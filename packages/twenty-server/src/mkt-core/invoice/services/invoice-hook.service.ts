import { Injectable } from '@nestjs/common';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { MktInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/mkt-invoice.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order-item/mkt-order-item.workspace-entity';

@Injectable()
export class InvoiceHookService {
	constructor(
		private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
		private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
		private readonly jwtWrapperService: JwtWrapperService,
	) {}

	async afterInvoiceCreated(invoiceId: string) {
		try {
			await this.updateInvoiceNameFromOrderItem(invoiceId);
		} catch (error: any) {
			console.error(`❌ InvoiceHookService: Error updating invoice ${invoiceId} name:`, error);
		}
	}

	// method to be called directly from GraphQLRequestCustomService
	async updateInvoiceNameFromOrderItemDirectly(mktOrderId: string, authorizationHeader?: string): Promise<string | null> {
		try {
			const orderItemNames = await this.getAllOrderItemNames(mktOrderId, authorizationHeader);
			return orderItemNames;
		} catch (error) {
			console.error(`❌ InvoiceHookService: Error getting orderItem names:`, error);
			return null;
		}
	}

	// get orderItem.name from database and update invoice name
	private async updateInvoiceNameFromOrderItem(invoiceId: string) {
		const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

		if (!workspaceId) {
			throw new Error('No workspace id found');
		}

		const invoiceRepository =
			await this.twentyORMGlobalManager.getRepositoryForWorkspace(
				workspaceId,
				MktInvoiceWorkspaceEntity,
				{ shouldBypassPermissionChecks: true },
			);

		// get invoice to get mktOrderId
		const invoice = await invoiceRepository.findOne({
			where: { id: invoiceId, deletedAt: null as any },
		});

		if (!invoice || !invoice.mktOrderId) {
			console.log(`Invoice ${invoiceId} not found or no mktOrderId`);
			return;
		}

		// get orderItem.name from database
		const orderItemName = await this.getOrderItemName(invoice.mktOrderId);
		
		if (orderItemName) {
			// update invoice name with orderItem.name
			await invoiceRepository.update(
				{ id: invoiceId },
				{ 
					name: orderItemName,
					updatedAt: new Date().toISOString()
				}
			);
		} else {
			console.log(`No orderItem found for order ${invoice.mktOrderId}`);
		}
	}

	// get orderItem.name from database
	private async getOrderItemName(mktOrderId: string): Promise<string | null> {
		try {
			const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

			if (!workspaceId) {
				throw new Error('No workspace id found');
			}

			// get repository for MktOrderItemWorkspaceEntity
			const orderItemRepository =
				await this.twentyORMGlobalManager.getRepositoryForWorkspace(
					workspaceId,
					MktOrderItemWorkspaceEntity,
					{ shouldBypassPermissionChecks: true },
				);

			// query to get orderItem.name from mktOrderId
			const orderItem = await orderItemRepository.findOne({
				where: { 
					mktOrderId: mktOrderId,
					deletedAt: null as any 
				},
				select: ['name'] // only get field name
			});
			return orderItem?.name || null;
		} catch (error) {
			console.error('Error getting orderItem name:', error);
			return null;
		}
	}	

	// get all orderItem names from database
	private async getAllOrderItemNames(mktOrderId: string, authorizationHeader?: string): Promise<string | null> {
		try {
			// get workspace ID from JWT token
			let workspaceId: string | null = null;
			
			if (authorizationHeader) {
				try {
					const token = authorizationHeader.replace('Bearer ', '');
					const decoded = this.jwtWrapperService.decode(token) as any;
					workspaceId = decoded?.workspaceId;
				} catch (error) {
					console.error('[DEBUG] Error decoding JWT:', error);
				}
			}
			
			// fallback to ScopedWorkspaceContextFactory if not get from JWT
			if (!workspaceId) {
				try {
					workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;
				} catch (error) {
					console.error('[DEBUG] Error getting workspaceId from ScopedWorkspaceContextFactory:', error);
				}
			}

			if (!workspaceId) {
				throw new Error('No workspace id found from JWT or ScopedWorkspaceContextFactory');
			}

			// get repository for MktOrderItemWorkspaceEntity
			const orderItemRepository =
				await this.twentyORMGlobalManager.getRepositoryForWorkspace(
					workspaceId,
					MktOrderItemWorkspaceEntity,
					{ shouldBypassPermissionChecks: true },
				);
			// query to get all orderItem names from mktOrderId
			const orderItems = await orderItemRepository.find({
				where: { 
					mktOrderId: mktOrderId,
					deletedAt: null as any 
				},
				select: ['name'] // only get field name
			});

			if (!orderItems || orderItems.length === 0) {
				console.log(`No orderItems found for order ${mktOrderId}`);
				return null;
			}

			// get order item names and remove duplicates
			const orderItemNames = orderItems
				.filter((item: any) => item.name)
				.map((item: any) => item.name)
				.filter((name: string, index: number, arr: string[]) => arr.indexOf(name) === index); // Remove duplicates

			if (orderItemNames.length === 0) {
				console.log(`No valid orderItem names found for order ${mktOrderId}`);
				return null;
			}

			// merge order item names
			const result = orderItemNames.join(' ');
			return result;
		} catch (error) {
			console.error('Error getting orderItem names:', error);
			return null;
		}
	}
}
