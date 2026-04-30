# Inventory Management

Multi-warehouse inventory with stock tracking, movement history (inbound/outbound/transfer/adjustment), costing methods (FIFO/LIFO/weighted average), and barcode/SKU support.

## Entities
- `WarehouseEntity` — name, address, isActive
- `ProductStockEntity` — productId, warehouseId, sku, barcode, quantity levels, costing data
- Stock movement entities for inbound, outbound, transfer, adjustment, return, reserve operations

## Service Methods
- `InventoryService` — manages warehouses, tracks stock levels per product per warehouse, records stock movements with costing, handles reservations for orders, calculates inventory valuation by costing method

## Feature Flag
`IS_MODULE_INVENTORY_ENABLED`

## Dependencies
- None
