export type DateScalarMode = 'isoDate' | 'timestamp';
export type NumberScalarMode = 'float' | 'integer';

export interface BuildSchemaOptions {
  /**
   * Data source id
   */
  dataSourceId: string;

  /**
   * Date scalar mode
   * @default 'isoDate'
   */
  dateScalarMode?: DateScalarMode;

  /**
   * Number scalar mode
   * @default 'float'
   */
  numberScalarMode?: NumberScalarMode;
}
