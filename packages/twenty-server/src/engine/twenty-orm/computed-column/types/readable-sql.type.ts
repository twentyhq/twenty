import { type SqlWithParameters } from 'src/engine/metadata-modules/computed-field/types/sql-with-parameters.type';

// `undefined`: the value reads something its reader cannot read, so the computed column is null
export type ReadableSql<TSql extends SqlWithParameters> = TSql | undefined;
