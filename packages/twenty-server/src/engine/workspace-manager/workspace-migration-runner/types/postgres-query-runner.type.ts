import { type QueryRunner } from 'typeorm';

export type PostgresQueryRunner = QueryRunner & {
  connection: QueryRunner['connection'] & {
    driver: QueryRunner['connection']['driver'] & {
      uuidGenerator: () => string;
    };
  };
};
