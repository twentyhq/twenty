import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveFieldMetadataPlaceholder1697471445015
  implements MigrationInterface
{
  name = 'RemoveFieldMetadataPlaceholder1697471445015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP COLUMN "placeholder"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD "placeholder" character varying`,
    );
  }
}
