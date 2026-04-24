import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImapToConnectedAccount1234567890000 implements MigrationInterface {
  name = 'AddImapToConnectedAccount1234567890000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加IMAP特定字段到connected_account表
    await queryRunner.addColumn(
      'connected_account',
      new TableColumn({
        name: 'imapHost',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'connected_account',
      new TableColumn({
        name: 'imapPort',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'connected_account',
      new TableColumn({
        name: 'imapSecure',
        type: 'boolean',
        default: true,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('connected_account', 'imapHost');
    await queryRunner.dropColumn('connected_account', 'imapPort');
    await queryRunner.dropColumn('connected_account', 'imapSecure');
  }
}
