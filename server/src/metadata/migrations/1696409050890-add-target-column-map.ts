import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTargetColumnMap1696409050890 implements MigrationInterface {
  name = 'AddTargetColumnMap1696409050890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "icon" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "placeholder" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "target_column_map" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "is_active" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "display_name_singular" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "display_name_plural" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "icon" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD "is_active" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "icon"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "display_name_plural"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP COLUMN "display_name_singular"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "target_column_map"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "placeholder"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "icon"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "description"`,
    );
  }
}
