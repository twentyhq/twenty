import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintsOnFieldObjectMetadata1697630766924
  implements MigrationInterface
{
  name = 'AddUniqueConstraintsOnFieldObjectMetadata1697630766924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP CONSTRAINT "UQ_8b063d2a685474dbae56cd685d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP CONSTRAINT "UQ_a2387e1b21120110b7e3db83da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" ADD CONSTRAINT "IndexOnNameObjectIdAndWorkspaceIdUnique" UNIQUE ("name", "object_id", "workspace_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD CONSTRAINT "IndexOnNamePluralAndWorkspaceIdUnique" UNIQUE ("name_plural", "workspace_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD CONSTRAINT "IndexOnNameSingularAndWorkspaceIdUnique" UNIQUE ("name_singular", "workspace_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP CONSTRAINT "IndexOnNameSingularAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" DROP CONSTRAINT "IndexOnNamePluralAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."field_metadata" DROP CONSTRAINT "IndexOnNameAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD CONSTRAINT "UQ_a2387e1b21120110b7e3db83da1" UNIQUE ("name_plural")`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."object_metadata" ADD CONSTRAINT "UQ_8b063d2a685474dbae56cd685d2" UNIQUE ("name_singular")`,
    );
  }
}
