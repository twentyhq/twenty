import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';

export interface InventoryAlert {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
}

export interface PricingRule {
  minQuantity: number;
  maxQuantity: number | null;
  discountPercent: number;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(ProductWorkspaceEntity, 'core')
    private readonly productRepository: Repository<ProductWorkspaceEntity>,
  ) {}

  async checkLowStock(): Promise<InventoryAlert[]> {
    const products = await this.productRepository.find({
      where: { isInventoryEnabled: true },
    });

    const alerts: InventoryAlert[] = [];

    for (const product of products) {
      if (product.stockQuantity === null || product.stockQuantity === undefined) continue;
      
      if (product.stockQuantity <= 0) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.stockQuantity,
          reorderPoint: product.reorderPoint || 0,
          alertType: 'OUT_OF_STOCK',
        });
      } else if (product.reorderPoint && product.stockQuantity <= product.reorderPoint) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.stockQuantity,
          reorderPoint: product.reorderPoint,
          alertType: 'LOW_STOCK',
        });
      }
    }

    return alerts;
  }

  async updateStock(
    productId: string,
    quantity: number,
    operation: 'ADD' | 'SUBTRACT' | 'SET',
  ): Promise<number> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    let newStock = product.stockQuantity || 0;

    switch (operation) {
      case 'ADD':
        newStock += quantity;
        break;
      case 'SUBTRACT':
        newStock = Math.max(0, newStock - quantity);
        break;
      case 'SET':
        newStock = quantity;
        break;
    }

    await this.productRepository.update(productId, { stockQuantity: newStock });

    if (product.reorderPoint && newStock <= product.reorderPoint) {
      this.logger.warn(`Low stock alert: ${product.name} (${newStock} units)`);
    }

    return newStock;
  }

  calculateVolumeDiscount(
    basePrice: number,
    quantity: number,
    rules: PricingRule[],
  ): { unitPrice: number; totalPrice: number; discountPercent: number } {
    const sortedRules = rules.sort((a, b) => b.minQuantity - a.minQuantity);
    
    const applicableRule = sortedRules.find(
      (rule) => quantity >= rule.minQuantity && (rule.maxQuantity === null || quantity <= rule.maxQuantity),
    );

    if (!applicableRule) {
      return {
        unitPrice: basePrice,
        totalPrice: basePrice * quantity,
        discountPercent: 0,
      };
    }

    const discountAmount = basePrice * (applicableRule.discountPercent / 100);
    const unitPrice = basePrice - discountAmount;

    return {
      unitPrice,
      totalPrice: unitPrice * quantity,
      discountPercent: applicableRule.discountPercent,
    };
  }

  async getInventoryValue(): Promise<number> {
    const products = await this.productRepository.find({
      where: { isInventoryEnabled: true },
    });

    return products.reduce((total, product) => {
      const stock = product.stockQuantity || 0;
      const cost = product.cost || 0;
      return total + (stock * cost);
    }, 0);
  }

  async getInventoryReport(): Promise<{
    totalProducts: number;
    totalValue: number;
    lowStock: number;
    outOfStock: number;
    categories: Record<string, { count: number; value: number }>;
  }> {
    const products = await this.productRepository.find();

    let totalValue = 0;
    let lowStock = 0;
    let outOfStock = 0;
    const categories: Record<string, { count: number; value: number }> = {};

    for (const product of products) {
      const stock = product.stockQuantity || 0;
      const cost = product.cost || 0;
      const value = stock * cost;
      
      totalValue += value;

      if (stock === 0) {
        outOfStock++;
      } else if (product.reorderPoint && stock <= product.reorderPoint) {
        lowStock++;
      }

      const category = product.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = { count: 0, value: 0 };
      }
      categories[category].count++;
      categories[category].value += value;
    }

    return {
      totalProducts: products.length,
      totalValue,
      lowStock,
      outOfStock,
      categories,
    };
  }
}
