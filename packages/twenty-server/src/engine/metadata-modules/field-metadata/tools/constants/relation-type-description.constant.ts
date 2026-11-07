export const RELATION_TYPE_DESCRIPTION =
  'Relation direction from the perspective of the object the field is created on. ' +
  "MANY_TO_ONE: the field points to a single target record; this object owns the foreign key and gets a writable '<fieldName>Id' on its create/update inputs. Use it for 'belongs to one' fields. " +
  "ONE_TO_MANY: the field is a read-only collection of target records; records are linked by writing the inverse '<fieldName>Id' on the target object.";
