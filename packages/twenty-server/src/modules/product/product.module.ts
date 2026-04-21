import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductService } from 'src/modules/product/services/product.service';
import { ProductVariantWorkspaceEntity } from 'src/modules/product/standard-objects/product-variant.workspace-entity';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductWorkspaceEntity,
      ProductVariantWorkspaceEntity,
    ]),
  ],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
