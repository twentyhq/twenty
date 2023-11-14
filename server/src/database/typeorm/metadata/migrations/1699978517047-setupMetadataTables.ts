import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupMetadataTables1699978517047 implements MigrationInterface {
  name = 'SetupMetadataTables1699978517047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" ADD "isSystem" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" DROP COLUMN "isSystem"`,
    );
  }
}
