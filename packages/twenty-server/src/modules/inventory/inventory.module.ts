import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductStockEntity, StockMovementEntity, WarehouseEntity, SupplierEntity } from './inventory.entity';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductStockEntity, StockMovementEntity, WarehouseEntity, SupplierEntity])],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
