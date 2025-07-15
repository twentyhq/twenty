export interface Gate {
  featureFlag: string;
  excludeFromDatabase?: boolean;
  excludeFromGraphQL?: boolean;
}
