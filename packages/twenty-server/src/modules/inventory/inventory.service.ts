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
