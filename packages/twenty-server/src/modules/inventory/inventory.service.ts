import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  ProductStockEntity,
  StockMovementEntity,
  WarehouseEntity,
  SupplierEntity,
  StockMovementType,
} from './inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ProductStockEntity)
    private readonly stockRepo: Repository<ProductStockEntity>,
    @InjectRepository(StockMovementEntity)
    private readonly movementRepo: Repository<StockMovementEntity>,
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepo: Repository<WarehouseEntity>,
    @InjectRepository(SupplierEntity)
    private readonly supplierRepo: Repository<SupplierEntity>,
  ) {}

  async createWarehouse(workspaceId: string, name: string, address?: string): Promise<WarehouseEntity> {
    return this.warehouseRepo.save(this.warehouseRepo.create({ workspaceId, name, address }));
  }

  async addStock(
    workspaceId: string,
    productId: string,
    warehouseId: string,
    quantity: number,
    unitCost?: number,
  ): Promise<ProductStockEntity> {
    let stock = await this.stockRepo.findOne({ where: { workspaceId, productId, warehouseId } });
    if (!stock) {
      stock = this.stockRepo.create({ workspaceId, productId, warehouseId, quantityOnHand: 0, quantityAvailable: 0 });
    }
    stock.quantityOnHand += quantity;
    stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
    if (unitCost !== undefined) stock.unitCost = unitCost;
    await this.recordMovement(workspaceId, productId, StockMovementType.INBOUND, quantity, { toWarehouseId: warehouseId, unitCost });
    return this.stockRepo.save(stock);
  }

  async reserveStock(workspaceId: string, productId: string, warehouseId: string, quantity: number, dealId?: string): Promise<ProductStockEntity> {
    const stock = await this.getStockOrFail(workspaceId, productId, warehouseId);
    if (stock.quantityAvailable < quantity) {
      throw new BadRequestException(`Insufficient stock: available ${stock.quantityAvailable}, requested ${quantity}`);
    }
    stock.quantityReserved += quantity;
    stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
    await this.recordMovement(workspaceId, productId, StockMovementType.RESERVE, quantity, { toWarehouseId: warehouseId, referenceId: dealId, referenceType: 'deal' });
    return this.stockRepo.save(stock);
  }

  async releaseStock(workspaceId: string, productId: string, warehouseId: string, quantity: number): Promise<ProductStockEntity> {
    const stock = await this.getStockOrFail(workspaceId, productId, warehouseId);
    stock.quantityOnHand -= quantity;
    stock.quantityReserved = Math.max(0, stock.quantityReserved - quantity);
    stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
    await this.recordMovement(workspaceId, productId, StockMovementType.OUTBOUND, quantity, { fromWarehouseId: warehouseId });
    return this.stockRepo.save(stock);
  }

  async transferStock(
    workspaceId: string,
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
  ): Promise<void> {
    await this.releaseStock(workspaceId, productId, fromWarehouseId, quantity);
    await this.addStock(workspaceId, productId, toWarehouseId, quantity);
    await this.recordMovement(workspaceId, productId, StockMovementType.TRANSFER, quantity, { fromWarehouseId, toWarehouseId });
  }

  async processReturn(workspaceId: string, productId: string, warehouseId: string, quantity: number, reason: string): Promise<ProductStockEntity> {
    const stock = await this.getStockOrFail(workspaceId, productId, warehouseId);
    stock.quantityOnHand += quantity;
    stock.quantityAvailable = stock.quantityOnHand - stock.quantityReserved;
    await this.recordMovement(workspaceId, productId, StockMovementType.RETURN, quantity, { toWarehouseId: warehouseId, reason });
    return this.stockRepo.save(stock);
  }

  async getLowStockAlerts(workspaceId: string): Promise<ProductStockEntity[]> {
    return this.stockRepo
      .createQueryBuilder('s')
      .where('s.workspaceId = :workspaceId', { workspaceId })
      .andWhere('s.quantityAvailable <= s.reorderPoint')
      .andWhere('s.reorderPoint > 0')
      .getMany();
  }

  async getStockValuation(workspaceId: string): Promise<{ totalValue: number; items: Array<{ productId: string; quantity: number; value: number }> }> {
    const stocks = await this.stockRepo.find({ where: { workspaceId } });
    const items = stocks.map((s) => ({
      productId: s.productId,
      quantity: s.quantityOnHand,
      value: s.quantityOnHand * Number(s.unitCost),
    }));
    return { totalValue: items.reduce((sum, i) => sum + i.value, 0), items };
  }

  async createSupplier(workspaceId: string, data: { name: string; contactEmail?: string; contactPhone?: string }): Promise<SupplierEntity> {
    return this.supplierRepo.save(this.supplierRepo.create({ workspaceId, ...data }));
  }

  async getSupplierPerformance(supplierId: string): Promise<{ onTimeRate: number; qualityRating: number }> {
    const supplier = await this.supplierRepo.findOne({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException(`Supplier ${supplierId} not found`);
    const onTimeRate = supplier.totalOrders ? ((supplier.totalOrders - supplier.lateDeliveries) / supplier.totalOrders) * 100 : 100;
    return { onTimeRate: Math.round(onTimeRate), qualityRating: supplier.qualityRating };
  }

  // Cycle count: verify physical stock against system records and auto-adjust
  async performCycleCount(
    workspaceId: string,
    warehouseId: string,
    counts: Array<{ productId: string; physicalCount: number }>,
  ): Promise<Array<{ productId: string; systemCount: number; physicalCount: number; variance: number; adjusted: boolean }>> {
    const results: Array<{ productId: string; systemCount: number; physicalCount: number; variance: number; adjusted: boolean }> = [];

    for (const count of counts) {
      const stock = await this.stockRepo.findOne({
        where: { workspaceId, productId: count.productId, warehouseId },
      });

      const systemCount = stock?.quantityOnHand ?? 0;
      const variance = count.physicalCount - systemCount;

      if (variance !== 0 && stock) {
        stock.quantityOnHand = count.physicalCount;
        stock.quantityAvailable = count.physicalCount - stock.quantityReserved;

        await this.stockRepo.save(stock);
        await this.recordMovement(
          workspaceId,
          count.productId,
          StockMovementType.ADJUSTMENT,
          Math.abs(variance),
          {
            toWarehouseId: warehouseId,
            reason: `Cycle count adjustment: system=${systemCount}, physical=${count.physicalCount}, variance=${variance}`,
          },
        );
      }

      results.push({
        productId: count.productId,
        systemCount,
        physicalCount: count.physicalCount,
        variance,
        adjusted: variance !== 0,
      });
    }

    return results;
  }

  // Check all products against reorder points and return items needing purchase
  async checkReorderTriggers(
    workspaceId: string,
  ): Promise<Array<{
    productId: string;
    warehouseId: string;
    quantityAvailable: number;
    reorderPoint: number;
    suggestedOrderQuantity: number;
    preferredSupplierId: string | null;
  }>> {
    const lowStockItems = await this.getLowStockAlerts(workspaceId);

    const reorderList = await Promise.all(
      lowStockItems.map(async (stock) => {
        // Order enough to reach 2x the reorder point (economic order heuristic)
        const suggestedOrderQuantity = Math.max(
          stock.reorderPoint * 2 - stock.quantityAvailable,
          stock.reorderPoint,
        );

        // Find the best supplier based on quality rating and delivery speed
        const bestSupplier = await this.supplierRepo
          .createQueryBuilder('s')
          .where('s.workspaceId = :workspaceId', { workspaceId })
          .orderBy('s.qualityRating', 'DESC')
          .addOrderBy('s.avgLeadTimeDays', 'ASC')
          .getOne();

        return {
          productId: stock.productId,
          warehouseId: stock.warehouseId,
          quantityAvailable: stock.quantityAvailable,
          reorderPoint: stock.reorderPoint,
          suggestedOrderQuantity,
          preferredSupplierId: bestSupplier?.id ?? null,
        };
      }),
    );

    return reorderList;
  }

  // Returns analytics: breakdown of returns by reason, rate, and value impact
  async getReturnsAnalytics(
    workspaceId: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<{
    totalReturns: number;
    totalReturnedQuantity: number;
    returnRate: number;
    returnsByReason: Array<{ reason: string; count: number; quantity: number }>;
    returnValueImpact: number;
  }> {
    const queryBuilder = this.movementRepo
      .createQueryBuilder('m')
      .where('m.workspaceId = :workspaceId', { workspaceId })
      .andWhere('m.type = :type', { type: StockMovementType.RETURN });

    if (dateFrom) {
      queryBuilder.andWhere('m.createdAt >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      queryBuilder.andWhere('m.createdAt <= :dateTo', { dateTo });
    }

    const returnMovements = await queryBuilder.getMany();

    const totalOutbound = await this.movementRepo.count({
      where: { workspaceId, type: StockMovementType.OUTBOUND },
    });

    const totalReturns = returnMovements.length;
    const totalReturnedQuantity = returnMovements.reduce(
      (sum, movement) => sum + movement.quantity,
      0,
    );

    const returnRate = totalOutbound > 0
      ? (totalReturns / totalOutbound) * 100
      : 0;

    // Group by reason
    const reasonMap = new Map<string, { count: number; quantity: number }>();
    for (const movement of returnMovements) {
      const reason = movement.reason || 'Unspecified';
      const existing = reasonMap.get(reason) || { count: 0, quantity: 0 };
      existing.count += 1;
      existing.quantity += movement.quantity;
      reasonMap.set(reason, existing);
    }

    const returnsByReason = Array.from(reasonMap.entries())
      .map(([reason, data]) => ({ reason, count: data.count, quantity: data.quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    const returnValueImpact = returnMovements.reduce(
      (sum, movement) => sum + movement.quantity * Number(movement.unitCost || 0),
      0,
    );

    return {
      totalReturns,
      totalReturnedQuantity,
      returnRate: Math.round(returnRate * 100) / 100,
      returnsByReason,
      returnValueImpact,
    };
  }

  private async recordMovement(
    workspaceId: string,
    productId: string,
    type: StockMovementType,
    quantity: number,
    extra: Partial<StockMovementEntity> = {},
  ): Promise<StockMovementEntity> {
    return this.movementRepo.save(this.movementRepo.create({ workspaceId, productId, type, quantity, ...extra }));
  }

  private async getStockOrFail(workspaceId: string, productId: string, warehouseId: string): Promise<ProductStockEntity> {
    const stock = await this.stockRepo.findOne({ where: { workspaceId, productId, warehouseId } });
    if (!stock) throw new NotFoundException(`Stock not found for product ${productId} in warehouse ${warehouseId}`);
    return stock;
  }
}
