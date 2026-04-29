import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductStockEntity, StockMovementEntity, WarehouseEntity, SupplierEntity } from './inventory.entity';
import { InventoryService } from './inventory.service';
import { InventoryResolver } from './inventory.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ProductStockEntity, StockMovementEntity, WarehouseEntity, SupplierEntity])],
  providers: [InventoryService, InventoryResolver],
  exports: [InventoryService],
})
export class InventoryModule {}
