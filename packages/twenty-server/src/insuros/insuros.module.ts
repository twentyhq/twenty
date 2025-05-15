import { Module } from '@nestjs/common';

@Module({
  imports: [
    // Add any required modules here
    // For example, if you need database access:
    // TypeOrmModule.forFeature([YourEntity], 'core'),
  ],
  controllers: [
    // Add your controllers here
  ],
  providers: [
    // Add your services here
  ],
  exports: [
    // Add any services you want to expose to other modules
  ],
})
export class InsurosModule {} 