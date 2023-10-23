import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDelete1697474804403 implements MigrationInterface {
  name = 'AddSoftDelete1697474804403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "deleted_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "deleted_at"`,
    );
  }
}
