import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveSingularPluralFromFieldLabelAndName1697534910933
  implements MigrationInterface
{
  name = 'RemoveSingularPluralFromFieldLabelAndName1697534910933';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "name_singular"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "name_plural"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "label_singular"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "label_plural"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "label" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "label"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "label_plural" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "label_singular" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "name_plural" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "name_singular" character varying NOT NULL`,
    );
  }
}
