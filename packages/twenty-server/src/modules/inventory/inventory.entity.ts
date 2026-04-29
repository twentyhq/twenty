import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum CostingMethod {
  FIFO = 'fifo',
  LIFO = 'lifo',
  WEIGHTED_AVERAGE = 'weighted_average',
}

export enum StockMovementType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  RESERVE = 'reserve',
}

@Entity('warehouse')
@Index(['workspaceId'])
export class WarehouseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('product_stock')
@Index(['workspaceId', 'productId', 'warehouseId'], { unique: true })
export class ProductStockEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  productId: string;

  @Column({ nullable: false })
  warehouseId: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode: string;

  @Column({ type: 'int', default: 0 })
  quantityOnHand: number;

  @Column({ type: 'int', default: 0 })
  quantityReserved: number;

  @Column({ type: 'int', default: 0 })
  quantityAvailable: number;

  @Column({ type: 'int', default: 0 })
  reorderPoint: number;

  @Column({ type: 'int', default: 0 })
  safetyStock: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  unitCost: number;

  @Column({ type: 'enum', enum: CostingMethod, default: CostingMethod.WEIGHTED_AVERAGE })
  costingMethod: CostingMethod;

  @Column({ type: 'varchar', length: 50, nullable: true })
  batchNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  serialNumber: string;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('stock_movement')
@Index(['workspaceId', 'productId'])
@Index(['workspaceId', 'createdAt'])
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  productId: string;

  @Column({ type: 'enum', enum: StockMovementType })
  type: StockMovementType;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ nullable: true })
  fromWarehouseId: string;

  @Column({ nullable: true })
  toWarehouseId: string;

  @Column({ nullable: true })
  referenceId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  referenceType: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  unitCost: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('supplier')
@Index(['workspaceId'])
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone: string;

  @Column({ type: 'int', default: 0 })
  avgLeadTimeDays: number;

  @Column({ type: 'float', default: 100 })
  qualityRating: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'int', default: 0 })
  lateDeliveries: number;

  @Column({ type: 'int', default: 0 })
  defectReturns: number;

  @CreateDateColumn()
  createdAt: Date;
}
