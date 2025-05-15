export const RAW = `src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type.ts:34:23 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof FieldActorSource'.
  No index signature with a parameter of type 'string' was found on type 'typeof FieldActorSource'.

34             label: 'S{FieldActorSource[key].toLowerCase()}',
                         ~~~~~~~~~~~~~~~~~~~~~

scripts/utils.ts:5:34 - error TS7006: Parameter 'str' implicitly has an 'any' type.

5 export const camelToSnakeCase = (str) =>
                                   ~~~

scripts/utils.ts:6:26 - error TS7006: Parameter 'letter' implicitly has an 'any' type.

6   str.replace(/[A-Z]/g, (letter) => '_S{letter.toLowerCase()}');
                           ~~~~~~

scripts/truncate-db.ts:29:20 - error TS7006: Parameter 'schema' implicitly has an 'any' type.

29         batch.map((schema) =>
                      ~~~~~~

src/engine/api/graphql/services/scalars-explorer.service.ts:13:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

13       acc[scalar.name] = scalar;
         ~~~~~~~~~~~~~~~~

src/engine/core-modules/file-storage/drivers/s3.driver.ts:70:34 - error TS7006: Parameter 'folderPath' implicitly has an 'any' type.

70   private async emptyS3Directory(folderPath) {
                                    ~~~~~~~~~~

src/engine/core-modules/serverless/drivers/utils/intercept-console.ts:19:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Console'.
  No index signature with a parameter of type 'string' was found on type 'Console'.

19       console[method] = (...args: any[]) => {
         ~~~~~~~~~~~~~~~

src/engine/core-modules/serverless/drivers/utils/intercept-console.ts:28:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Console'.
  No index signature with a parameter of type 'string' was found on type 'Console'.

28       console[method] = (...args: any[]) => {
         ~~~~~~~~~~~~~~~

src/engine/core-modules/serverless/drivers/utils/intercept-console.ts:29:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ log: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }; error: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }; warn: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }; info: { ...; }; debug: { ...; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ log: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }; error: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }; warn: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }; info: { ...; }; debug: { ...; }; }'.

29         this.originalConsole[method](...args);
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/serverless/drivers/utils/create-zip-file.ts:4:22 - error TS7016: Could not find a declaration file for module 'archiver'. '/Users/paulrastoin/ws/twenty/node_modules/archiver/index.js' implicitly has an 'any' type.
  Try 'npm i --save-dev @types/archiver' if it exists or add a new declaration (.d.ts) file containing 'declare module 'archiver';'

4 import archiver from 'archiver';
                       ~~~~~~~~~~

src/engine/core-modules/twenty-config/decorators/cast-to-positive-number.decorator.ts:7:7 - error TS7023: 'toNumber' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.

7 const toNumber = (value: any) => {
        ~~~~~~~~

src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory.ts:62:28 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | FieldMetadataDefaultValueAddress | FieldMetadataDefaultValueLinks | FieldMetadataDefaultValueEmails | FieldMetadataDefaultValuePhones'.
  No index signature with a parameter of type 'string' was found on type 'FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | FieldMetadataDefaultValueAddress | FieldMetadataDefaultValueLinks | FieldMetadataDefaultValueEmails | FieldMetadataDefaultValuePhones'.

62       const defaultValue = fieldMetadata.defaultValue?.[property.name];
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory.ts:142:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | FieldMetadataDefaultValueAddress | FieldMetadataDefaultValueLinks | FieldMetadataDefaultValueEmails | FieldMetadataDefaultValuePhones'.
  No index signature with a parameter of type 'string' was found on type 'FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | FieldMetadataDefaultValueAddress | FieldMetadataDefaultValueLinks | FieldMetadataDefaultValueEmails | FieldMetadataDefaultValuePhones'.

142         alteredFieldMetadata.defaultValue?.[alteredProperty.name];
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory.ts:176:13 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | FieldMetadataDefaultValueAddress | FieldMetadataDefaultValueLinks | FieldMetadataDefaultValueEmails | FieldMetadataDefaultValuePhones'.
  No index signature with a parameter of type 'string' was found on type 'FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | FieldMetadataDefaultValueAddress | FieldMetadataDefaultValueLinks | FieldMetadataDefaultValueEmails | FieldMetadataDefaultValuePhones'.

176             currentFieldMetadata.defaultValue?.[currentProperty.name],
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:66:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

66         newData[key] = formatResult(
           ~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:72:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

72         newData[key] = formatFieldMetadataValue(
           ~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:77:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

77         newData[key] = value;
           ~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:99:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

99       newData[key] = formatResult(
         ~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:112:10 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

112     if (!newData[parentField]) {
             ~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:113:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

113       newData[parentField] = {};
          ~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:116:5 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

116     newData[parentField][compositeProperty.name] = value;
        ~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:138:28 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

138     const rawUpdatedDate = newData[dateFieldMetadata.name] as
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:155:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

155         newData[dateFieldMetadata.name] = shiftedDate;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:158:36 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

158       const currentDate = new Date(newData[dateFieldMetadata.name]);
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/utils/format-result.util.ts:165:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

165       newData[dateFieldMetadata.name] = shiftedDate;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/utils/build-duplicate-conditions.utils.ts:50:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

50           condition[compositeFieldMetadata.parentField] = {
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/utils/build-duplicate-conditions.utils.ts:51:16 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

51             ...condition[compositeFieldMetadata.parentField],
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/utils/build-duplicate-conditions.utils.ts:55:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

55           condition[columnName] = { eq: record[columnName] };
             ~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service.ts:55:24 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

55         const before = mappedExistingRecords[record.id];
                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/feature-flag/validates/feature-flag.validate.ts:10:17 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof FeatureFlagKey'.
  No index signature with a parameter of type 'string' was found on type 'typeof FeatureFlagKey'.

10   if (isDefined(FeatureFlagKey[featureFlagKey])) return;
                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/feature-flag/services/feature-flag.service.ts:102:43 - error TS2551: Property 'IS_AIRTABLE_INTEGRATION_ENABLED' does not exist on type 'typeof FeatureFlagKey'. Did you mean 'IsAirtableIntegrationEnabled'?

102     const featureFlagKey = FeatureFlagKey[featureFlag];
                                              ~~~~~~~~~~~

src/engine/api/graphql/workspace-schema-builder/utils/generate-fields.utils.ts:107:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

107       fields[joinColumnName] = {
          ~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-schema-builder/utils/generate-fields.utils.ts:113:5 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

113     fields[fieldMetadata.name] = {
        ~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory.ts:40:11 - error TS7022: 'inputType' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.

40     const inputType = new GraphQLInputObjectType({
             ~~~~~~~~~

src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory.ts:49:19 - error TS7022: 'andOrType' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.

49             const andOrType = this.typeMapperService.mapToGqlType(inputType, {
                     ~~~~~~~~~

src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory.ts:263:11 - error TS7053: Element implicitly has an 'any' type because expression of type '"and" | "or"' can't be used to index type '{}'.
  Property 'and' does not exist on type '{}'.

263           acc[key] = value.map((nestedFilter: ObjectRecordFilter) =>
              ~~~~~~~~

src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory.ts:267:11 - error TS7053: Element implicitly has an 'any' type because expression of type '"not"' can't be used to index type '{}'.
  Property 'not' does not exist on type '{}'.

267           acc[key] = overrideFilter(value);
              ~~~~~~~~

src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory.ts:269:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

269           acc[key] = this.transformFilterValueByType(
              ~~~~~~~~

src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer.ts:113:14 - error TS7053: Element implicitly has an 'any' type because expression of type '"execute"' can't be used to index type '{}'.
  Property 'execute' does not exist on type '{}'.

113       return contextInstance[methodName].call(
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer.ts:118:14 - error TS7053: Element implicitly has an 'any' type because expression of type '"execute"' can't be used to index type '{}'.
  Property 'execute' does not exist on type '{}'.

118       return instance[methodName].call(instance, ...executeParams);
                 ~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer.ts:176:14 - error TS7053: Element implicitly has an 'any' type because expression of type '"execute"' can't be used to index type '{}'.
  Property 'execute' does not exist on type '{}'.

176       return contextInstance[methodName].call(
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.explorer.ts:183:14 - error TS7053: Element implicitly has an 'any' type because expression of type '"execute"' can't be used to index type '{}'.
  Property 'execute' does not exist on type '{}'.

183       return instance[methodName].call(
                 ~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service.ts:227:12 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'CacheResult<undefined, UserWorkspaceRoleMap>'.
  No index signature with a parameter of type 'string' was found on type 'CacheResult<undefined, UserWorkspaceRoleMap>'.

227     return userWorkspaceRoleMap[userWorkspaceId];
               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/factories/entity-schema-column.factory.ts:125:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'string | number | boolean | object | string[] | Date | FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | ... 4 more ... | FieldMetadataDefaultValuePhones'.
  No index signature with a parameter of type 'string' was found on type 'string | number | boolean | object | string[] | Date | FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | ... 4 more ... | FieldMetadataDefaultValuePhones'.

125         fieldMetadata.defaultValue?.[compositeProperty.name],
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service.ts:120:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof ResolverArgsType'.
  No index signature with a parameter of type 'string' was found on type 'typeof ResolverArgsType'.

120         ResolverArgsType[capitalize(operationName)],
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service.ts:198:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ readonly apiKey: SettingPermissionType.API_KEYS_AND_WEBHOOKS; readonly webhook: SettingPermissionType.API_KEYS_AND_WEBHOOKS; }'.
  No index signature with a parameter of type 'string' was found on type '{ readonly apiKey: SettingPermissionType.API_KEYS_AND_WEBHOOKS; readonly webhook: SettingPermissionType.API_KEYS_AND_WEBHOOKS; }'.

198         SYSTEM_OBJECTS_PERMISSIONS_REQUIREMENTS[
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
199           objectMetadataItemWithFieldMaps.nameSingular
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
200         ];
    ~~~~~~~~~

src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service.ts:212:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

212         whereConditions[field.column] = In(fieldValues);
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/object-metadata-repository/object-metadata-repository.module.ts:13:21 - error TS7006: Parameter 'objectMetadatas' implicitly has an 'any' type.

13   static forFeature(objectMetadatas): DynamicModule {
                       ~~~~~~~~~~~~~~~

src/engine/object-metadata-repository/object-metadata-repository.module.ts:14:56 - error TS7006: Parameter 'objectMetadata' implicitly has an 'any' type.

14     const providers: Provider[] = objectMetadatas.map((objectMetadata) => {
                                                          ~~~~~~~~~~~~~~

src/engine/object-metadata-repository/object-metadata-repository.module.ts:15:31 - error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ BlocklistWorkspaceEntity: typeof BlocklistRepository; TimelineActivityWorkspaceEntity: typeof TimelineActivityRepository; WorkspaceMemberWorkspaceEntity: typeof WorkspaceMemberRepository; }'.

15       const repositoryClass = metadataToRepositoryMapping[objectMetadata.name];
                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/factories/scoped-workspace-context.factory.ts:19:7 - error TS7053: Element implicitly has an 'any' type because expression of type '"req"' can't be used to index type 'Request'.
  Property 'req' does not exist on type 'Request'.

19       this.request?.['req']?.['workspaceId'] ||
         ~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/factories/scoped-workspace-context.factory.ts:20:7 - error TS7053: Element implicitly has an 'any' type because expression of type '"params"' can't be used to index type 'Request'.
  Property 'params' does not exist on type 'Request'.

20       this.request?.['params']?.['workspaceId'];
         ~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/factories/scoped-workspace-context.factory.ts:22:7 - error TS7053: Element implicitly has an 'any' type because expression of type '"req"' can't be used to index type 'Request'.
  Property 'req' does not exist on type 'Request'.

22       this.request?.['req']?.['workspaceMetadataVersion'];
         ~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/factories/scoped-workspace-context.factory.ts:27:24 - error TS7053: Element implicitly has an 'any' type because expression of type '"req"' can't be used to index type 'Request'.
  Property 'req' does not exist on type 'Request'.

27       userWorkspaceId: this.request?.['req']?.['userWorkspaceId'] ?? null,
                          ~~~~~~~~~~~~~~~~~~~~~

src/engine/twenty-orm/factories/scoped-workspace-context.factory.ts:28:29 - error TS7053: Element implicitly has an 'any' type because expression of type '"req"' can't be used to index type 'Request'.
  Property 'req' does not exist on type 'Request'.

28       isExecutedByApiKey: !!this.request?.['req']?.['apiKey'],
                               ~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/field-metadata/utils/validate-default-value-for-type.util.ts:77:22 - error TS7053: Element implicitly has an 'any' type because expression of type 'FieldMetadataType' can't be used to index type '{ UUID: (typeof FieldMetadataDefaultValueString)[]; TEXT: (typeof FieldMetadataDefaultValueString)[]; DATE_TIME: (typeof FieldMetadataDefaultValueDateTime | typeof FieldMetadataDefaultValueNowFunction)[]; ... 16 more ...; PHONES: (typeof FieldMetadataDefaultValuePhones)[]; }'.
  Property '[FieldMetadataType.RELATION]' does not exist on type '{ UUID: (typeof FieldMetadataDefaultValueString)[]; TEXT: (typeof FieldMetadataDefaultValueString)[]; DATE_TIME: (typeof FieldMetadataDefaultValueDateTime | typeof FieldMetadataDefaultValueNowFunction)[]; ... 16 more ...; PHONES: (typeof FieldMetadataDefaultValuePhones)[]; }'.

77   const validators = defaultValueValidatorsMap[type] as any[];
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/field-metadata/validators/is-field-metadata-default-value.validator.ts:34:42 - error TS7053: Element implicitly has an 'any' type because expression of type '"type"' can't be used to index type '{}'.
  Property 'type' does not exist on type '{}'.

34     let type: FieldMetadataType | null = args.object['type'];
                                            ~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/field-metadata/validators/is-field-metadata-default-value.validator.ts:38:38 - error TS7053: Element implicitly has an 'any' type because expression of type '"id"' can't be used to index type '{}'.
  Property 'id' does not exist on type '{}'.

38       const id: string | undefined = args.instance?.['id'];
                                        ~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/field-metadata/validators/is-field-metadata-options.validator.ts:28:42 - error TS7053: Element implicitly has an 'any' type because expression of type '"type"' can't be used to index type '{}'.
  Property 'type' does not exist on type '{}'.

28     let type: FieldMetadataType | null = args.object['type'];
                                            ~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/field-metadata/validators/is-field-metadata-options.validator.ts:32:38 - error TS7053: Element implicitly has an 'any' type because expression of type '"id"' can't be used to index type '{}'.
  Property 'id' does not exist on type '{}'.

32       const id: string | undefined = args.instance?.['id'];
                                        ~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/object-metadata/services/object-metadata-field-relation.service.ts:163:13 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ activityTarget: { activity: string; person: string; company: string; opportunity: string; custom: string; }; activity: { title: string; body: string; type: string; reminderAt: string; dueAt: string; ... 5 more ...; assignee: string; }; ... 36 more ...; workspaceMember: { ...; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ activityTarget: { activity: string; person: string; company: string; opportunity: string; custom: string; }; activity: { title: string; body: string; type: string; reminderAt: string; dueAt: string; ... 5 more ...; assignee: string; }; ... 36 more ...; workspaceMember: { ...; }; }'.

163             STANDARD_OBJECT_FIELD_IDS[targetObjectMetadata.nameSingular].custom,
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/object-metadata/services/object-metadata-field-relation.service.ts:195:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ name: string; position: string; createdBy: string; activityTargets: string; noteTargets: string; taskTargets: string; favorites: string; attachments: string; timelineActivities: string; searchVector: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ name: string; position: string; createdBy: string; activityTargets: string; noteTargets: string; taskTargets: string; favorites: string; attachments: string; timelineActivities: string; searchVector: string; }'.

195           CUSTOM_OBJECT_STANDARD_FIELD_IDS[targetObjectMetadata.namePlural],
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/object-metadata/services/object-metadata-field-relation.service.ts:242:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ name: string; position: string; createdBy: string; activityTargets: string; noteTargets: string; taskTargets: string; favorites: string; attachments: string; timelineActivities: string; searchVector: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ name: string; position: string; createdBy: string; activityTargets: string; noteTargets: string; taskTargets: string; favorites: string; attachments: string; timelineActivities: string; searchVector: string; }'.

242         CUSTOM_OBJECT_STANDARD_FIELD_IDS[relationObjectMetadataNamePlural],
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/object-metadata/services/object-metadata-field-relation.service.ts:253:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ activityTarget: string; activity: string; apiKey: string; attachment: string; blocklist: string; behavioralEvent: string; calendarChannelEventAssociation: string; calendarChannel: string; ... 32 more ...; workspaceMember: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ activityTarget: string; activity: string; apiKey: string; attachment: string; blocklist: string; behavioralEvent: string; calendarChannelEventAssociation: string; calendarChannel: string; ... 32 more ...; workspaceMember: string; }'.

253         STANDARD_OBJECT_ICONS[targetObjectMetadata.nameSingular] ||
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/object-metadata/services/object-metadata-field-relation.service.ts:283:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ activityTarget: { activity: string; person: string; company: string; opportunity: string; custom: string; }; activity: { title: string; body: string; type: string; reminderAt: string; dueAt: string; ... 5 more ...; assignee: string; }; ... 36 more ...; workspaceMember: { ...; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ activityTarget: { activity: string; person: string; company: string; opportunity: string; custom: string; }; activity: { title: string; body: string; type: string; reminderAt: string; dueAt: string; ... 5 more ...; assignee: string; }; ... 36 more ...; workspaceMember: { ...; }; }'.

283       STANDARD_OBJECT_FIELD_IDS[targetObjectMetadata.nameSingular].custom;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/object-metadata/services/object-metadata-field-relation.service.ts:321:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ activityTarget: { activity: string; person: string; company: string; opportunity: string; custom: string; }; activity: { title: string; body: string; type: string; reminderAt: string; dueAt: string; ... 5 more ...; assignee: string; }; ... 36 more ...; workspaceMember: { ...; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ activityTarget: { activity: string; person: string; company: string; opportunity: string; custom: string; }; activity: { title: string; body: string; type: string; reminderAt: string; dueAt: string; ... 5 more ...; assignee: string; }; ... 36 more ...; workspaceMember: { ...; }; }'.

321       STANDARD_OBJECT_FIELD_IDS[targetObjectMetadata.nameSingular].custom;
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/field-metadata/utils/unserialize-default-value.ts:32:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

32         acc[key] = unserializeDefaultValue(value);
           ~~~~~~~~

src/engine/metadata-modules/object-metadata/object-metadata.service.ts:477:13 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

477             acc[field.standardId ?? ''] = field.id;
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/object-metadata/object-metadata.service.ts:611:7 - error TS7053: Element implicitly has an 'any' type because expression of type '"description" | "labelSingular" | "labelPlural" | "icon"' can't be used to index type '{ labelSingular?: string | null | undefined; labelPlural?: string | null | undefined; description?: string | null | undefined; }'.
  Property 'icon' does not exist on type '{ labelSingular?: string | null | undefined; labelPlural?: string | null | undefined; description?: string | null | undefined; }'.

611       objectMetadata.standardOverrides?.translations?.[locale]?.[labelKey];
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/modules/view/services/view.service.ts:38:36 - error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.

38       const position = positions?.[viewId];
                                      ~~~~~~

src/engine/metadata-modules/field-metadata/field-metadata-validation.service.ts:127:47 - error TS2339: Property 'to' does not exist on type 'string'.

127           enumOptions.some((option) => option.to === formattedDefaultValue))
                                                  ~~

src/engine/metadata-modules/field-metadata/field-metadata.service.ts:702:7 - error TS7053: Element implicitly has an 'any' type because expression of type '"description" | "label" | "icon"' can't be used to index type '{ label?: string | null | undefined; description?: string | null | undefined; }'.
  Property 'icon' does not exist on type '{ label?: string | null | undefined; description?: string | null | undefined; }'.

702       fieldMetadata.standardOverrides?.translations?.[locale]?.[labelKey];
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface.ts:17:3 - error TS7010: 'work', which lacks return-type annotation, implicitly has an 'any' return type.

 17   work<T extends MessageQueueJobData>(
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 18     queueName: MessageQueue,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
 20     options?: MessageQueueWorkerOptions,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 21   );
    ~~~~

src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface.ts:22:3 - error TS7010: 'addCron', which lacks return-type annotation, implicitly has an 'any' return type.

 22   addCron<T extends MessageQueueJobData | undefined>({
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 23     queueName,
    ~~~~~~~~~~~~~~
...
 33     jobId?: string;
    ~~~~~~~~~~~~~~~~~~~
 34   });
    ~~~~~

src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface.ts:35:3 - error TS7010: 'removeCron', which lacks return-type annotation, implicitly has an 'any' return type.

 35   removeCron({
      ~~~~~~~~~~~~
 36     queueName,
    ~~~~~~~~~~~~~~
...
 42     jobId?: string;
    ~~~~~~~~~~~~~~~~~~~
 43   });
    ~~~~~

src/engine/core-modules/key-value-pair/key-value-pair.service.ts:78:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ userId: string | null | undefined; workspaceId: string | null | undefined; key: Extract<K, string>; value: KeyValueTypesMap[K]; type: KeyValuePairType; }'.
  No index signature with a parameter of type 'string' was found on type '{ userId: string | null | undefined; workspaceId: string | null | undefined; key: Extract<K, string>; value: KeyValueTypesMap[K]; type: KeyValuePairType; }'.

78         upsertData[key] !== undefined,
           ~~~~~~~~~~~~~~~

src/modules/contact-creation-manager/utils/get-company-name-from-domain-name.util.ts:1:17 - error TS7016: Could not find a declaration file for module 'psl'. '/Users/paulrastoin/ws/twenty/node_modules/psl/index.js' implicitly has an 'any' type.
  Try 'npm i --save-dev @types/psl' if it exists or add a new declaration (.d.ts) file containing 'declare module 'psl';'

1                   ~~~~~

src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util.ts:1:17 - error TS7016: Could not find a declaration file for module 'psl'. '/Users/paulrastoin/ws/twenty/node_modules/psl/index.js' implicitly has an 'any' type.
  Try 'npm i --save-dev @types/psl' if it exists or add a new declaration (.d.ts) file containing 'declare module 'psl';'

1                   ~~~~~

src/modules/contact-creation-manager/utils/filter-out-contacts-from-company-or-workspace.util.ts:25:7 - error TS7052: Element implicitly has an 'any' type because type 'Map<string, boolean>' has no index signature. Did you mean to call 'map.set'?

25       map[workspaceMember.userEmail.toLowerCase()] = true;
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/modules/contact-creation-manager/utils/filter-out-contacts-from-company-or-workspace.util.ts:39:8 - error TS7052: Element implicitly has an 'any' type because type 'Map<string, boolean>' has no index signature. Did you mean to call 'workspaceMembersMap.get'?

39       !workspaceMembersMap[contact.handle.toLowerCase()] &&
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-message-list.service.ts:80:31 - error TS2345: Argument of type 'string | null | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.

80       messageExternalIds.push(...messages.map((message) => message.id));
                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/billing/webhooks/utils/transform-stripe-subscription-event-to-database-subscription.util.ts:27:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof BillingSubscriptionCollectionMethod'.
  No index signature with a parameter of type 'string' was found on type 'typeof BillingSubscriptionCollectionMethod'.

27       BillingSubscriptionCollectionMethod[
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
28         data.object.collection_method.toUpperCase()
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
29       ],
   ~~~~~~~

src/engine/metadata-modules/role/role.service.ts:269:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'CreateRoleInput | UpdateRolePayload'.
  No index signature with a parameter of type 'string' was found on type 'CreateRoleInput | UpdateRolePayload'.

269           value: input[key],
                     ~~~~~~~~~~

src/engine/seeder/seeder.service.ts:115:15 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

115               objectRecordSeedsAsSQLFlattenedSeeds[
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
116                 subFieldNameAsSQLColumnName
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
117               ] = subFieldValueAsSQLValue;
    ~~~~~~~~~~~~~~~

src/engine/seeder/seeder.service.ts:127:13 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

127             objectRecordSeedsAsSQLFlattenedSeeds[field.name] =
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/utils/should-seed-workspace-favorite.ts:4:3 - error TS7006: Parameter 'objectMetadataId' implicitly has an 'any' type.

4   objectMetadataId,
    ~~~~~~~~~~~~~~~~

src/engine/utils/should-seed-workspace-favorite.ts:5:3 - error TS7006: Parameter 'objectMetadataMap' implicitly has an 'any' type.

5   objectMetadataMap,
    ~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/demo-objects-prefill-data/seed-opportunity-with-demo-data.ts:19:32 - error TS7006: Parameter 'companies' implicitly has an 'any' type.

19 const generateOpportunities = (companies) => {
                                  ~~~~~~~~~

src/engine/workspace-manager/demo-objects-prefill-data/seed-opportunity-with-demo-data.ts:20:25 - error TS7006: Parameter 'company' implicitly has an 'any' type.

20   return companies.map((company) => ({
                           ~~~~~~~

src/engine/workspace-manager/demo-objects-prefill-data/seed-opportunity-with-demo-data.ts:69:26 - error TS7006: Parameter 'opportunity' implicitly has an 'any' type.

69       opportunities.map((opportunity, index) => ({
                            ~~~~~~~~~~~

src/engine/workspace-manager/demo-objects-prefill-data/seed-opportunity-with-demo-data.ts:69:39 - error TS7006: Parameter 'index' implicitly has an 'any' type.

69       opportunities.map((opportunity, index) => ({
                                         ~~~~~

src/engine/workspace-manager/demo-objects-prefill-data/seed-workspace-with-demo-data.ts:19:5 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

19     acc[object.standardId ?? ''] = {
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/demo-objects-prefill-data/seed-workspace-with-demo-data.ts:22:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

22         acc[field.standardId ?? ''] = field.id;
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/standard-objects-prefill-data/standard-objects-prefill-data.ts:21:5 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

21     acc[object.standardId] = {
       ~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/standard-objects-prefill-data/standard-objects-prefill-data.ts:28:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

28         acc[field.standardId] = field.id;
           ~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util.ts:54:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'TransformToString<T, Keys>'.
  No index signature with a parameter of type 'string' was found on type 'TransformToString<T, Keys>'.

54         transformedField[property as string] = JSON.stringify(
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util.ts:58:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'TransformToString<T, Keys>'.
  No index signature with a parameter of type 'string' was found on type 'TransformToString<T, Keys>'.

58         transformedField[property as string] = datum[property];
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field-relation.comparator.ts:186:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Partial<FieldMetadataEntity<FieldMetadataType.RELATION>>'.
  No index signature with a parameter of type 'string' was found on type 'Partial<FieldMetadataEntity<FieldMetadataType.RELATION>>'.

186           propertiesMap[fieldId][property] = newValue;
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field-relation.comparator.ts:188:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Partial<FieldMetadataEntity<FieldMetadataType.RELATION>>'.
  No index signature with a parameter of type 'string' was found on type 'Partial<FieldMetadataEntity<FieldMetadataType.RELATION>>'.

188           propertiesMap[fieldId][property] = difference.value;
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field.comparator.ts:194:13 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Partial<ComputedPartialFieldMetadata>'.
  No index signature with a parameter of type 'string' was found on type 'Partial<ComputedPartialFieldMetadata>'.

194             fieldPropertiesToUpdateMap[id][property] = this.parseJSONOrString(
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field.comparator.ts:198:13 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Partial<ComputedPartialFieldMetadata>'.
  No index signature with a parameter of type 'string' was found on type 'Partial<ComputedPartialFieldMetadata>'.

198             fieldPropertiesToUpdateMap[id][property] = difference.value;
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-object.comparator.ts:77:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string | number' can't be used to index type 'Partial<ComputedPartialWorkspaceEntity>'.
  No index signature with a parameter of type 'string' was found on type 'Partial<ComputedPartialWorkspaceEntity>'.

77         objectPropertiesToUpdate[property] = standardObjectMetadata[property];
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-object.comparator.ts:77:46 - error TS7053: Element implicitly has an 'any' type because expression of type 'string | number' can't be used to index type 'Omit<ComputedPartialWorkspaceEntity, "fields" | "indexMetadatas">'.
  No index signature with a parameter of type 'string' was found on type 'Omit<ComputedPartialWorkspaceEntity, "fields" | "indexMetadatas">'.

77         objectPropertiesToUpdate[property] = standardObjectMetadata[property];
                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/auth/strategies/jwt.auth.strategy.ts:36:48 - error TS7006: Parameter '_request' implicitly has an 'any' type.

36     const secretOrKeyProviderFunction = async (_request, rawJwtToken, done) => {
                                                  ~~~~~~~~

src/engine/core-modules/auth/strategies/jwt.auth.strategy.ts:36:58 - error TS7006: Parameter 'rawJwtToken' implicitly has an 'any' type.

36     const secretOrKeyProviderFunction = async (_request, rawJwtToken, done) => {
                                                            ~~~~~~~~~~~

src/engine/core-modules/auth/strategies/jwt.auth.strategy.ts:36:71 - error TS7006: Parameter 'done' implicitly has an 'any' type.

36     const secretOrKeyProviderFunction = async (_request, rawJwtToken, done) => {
                                                                         ~~~~

src/database/commands/logger.ts:11:24 - error TS2551: Property 'setVerbose' does not exist on type 'Logger | CommandLogger'. Did you mean 'verbose'?

11   return typeof logger['setVerbose'] === 'function';
                          ~~~~~~~~~~~~

src/engine/core-modules/domain-manager/guards/cloudflare-secret.guard.ts:24:19 - error TS7052: Element implicitly has an 'any' type because type 'Headers' has no index signature. Did you mean to call 'request.headers.get'?

24           (typeof request.headers['cf-webhook-auth'] === 'string' ||
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/domain-manager/guards/cloudflare-secret.guard.ts:26:27 - error TS7052: Element implicitly has an 'any' type because type 'Headers' has no index signature. Did you mean to call 'request.headers.get'?

26               Buffer.from(request.headers['cf-webhook-auth']),
                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/utils/global-exception-handler.util.ts:107:21 - error TS7053: Element implicitly has an 'any' type because expression of type '"message"' can't be used to index type 'string | object'.
  Property 'message' does not exist on type 'string | object'.

107     const message = exception.getResponse()['message'] ?? exception.message;
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/utils/global-exception-handler.util.ts:109:17 - error TS7053: Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{ 400: typeof ValidationError; 401: typeof AuthenticationError; 403: typeof ForbiddenError; 404: typeof NotFoundError; 405: typeof MethodNotAllowedError; 408: typeof TimeoutError; 409: typeof ConflictError; }'.
  No index signature with a parameter of type 'number' was found on type '{ 400: typeof ValidationError; 401: typeof AuthenticationError; 403: typeof ForbiddenError; 404: typeof NotFoundError; 405: typeof MethodNotAllowedError; 408: typeof TimeoutError; 409: typeof ConflictError; }'.

109     error = new graphQLPredefinedExceptions[exception.getStatus()](message);
                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/message-queue/message-queue.explorer.ts:151:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

151           instance[processMethodName],
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/message-queue/message-queue.explorer.ts:206:15 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

206         await instance[processMethodName].call(instance, job.data);
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/file/file.utils.ts:29:6 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ "profile-picture"?: ShortCropSize[] | undefined; "workspace-logo"?: ShortCropSize[] | undefined; attachment?: ShortCropSize[] | undefined; "person-picture"?: ShortCropSize[] | undefined; "serverless-function"?: ShortCropSize[] | undefined; }'.
  No index signature with a parameter of type 'string' was found on type '{ "profile-picture"?: ShortCropSize[] | undefined; "workspace-logo"?: ShortCropSize[] | undefined; attachment?: ShortCropSize[] | undefined; "person-picture"?: ShortCropSize[] | undefined; "serverless-function"?: ShortCropSize[] | undefined; }'.

29     !settings.storage.imageCropSizes[folder]?.includes(size)
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/file/controllers/file.controller.ts:43:43 - error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.

43     const filename = checkFilename(params['filename']);
                                             ~~~~~~~~~~

src/engine/core-modules/user/user.resolver.ts:132:27 - error TS7053: Element implicitly has an 'any' type because expression of type 'SettingPermissionType' can't be used to index type '{}'.
  Property '[SettingPermissionType.API_KEYS_AND_WEBHOOKS]' does not exist on type '{}'.

132     ).filter((feature) => settingsPermissions[feature] === true);
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/user/user.resolver.ts:136:30 - error TS7053: Element implicitly has an 'any' type because expression of type 'PermissionsOnAllObjectRecords' can't be used to index type '{}'.
  Property '[PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS]' does not exist on type '{}'.

136     ).filter((permission) => objectRecordsPermissions[permission] === true);
                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-health/services/database-structure.service.ts:306:15 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'object | string[] | Date | FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | ... 5 more ... | { ...; }'.
  No index signature with a parameter of type 'string' was found on type 'object | string[] | Date | FieldMetadataDefaultValueCurrency | FieldMetadataDefaultValueFullName | ... 5 more ... | { ...; }'.

306             ? initialDefaultValue?.[compositeProperty.name]
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/workspace-manager/workspace-health/fixer/workspace-default-value.fixer.ts:137:25 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'string | number | true | object'.
  No index signature with a parameter of type 'string' was found on type 'string | number | true | object'.

137           const value = currentDefaultValue[key];
                            ~~~~~~~~~~~~~~~~~~~~~~~~

src/modules/timeline/services/timeline-activity.service.ts:179:13 - error TS7006: Parameter 'activityTarget' implicitly has an 'any' type.

179       .map((activityTarget) => {
                ~~~~~~~~~~~~~~

src/modules/timeline/services/timeline-activity.service.ts:205:16 - error TS7006: Parameter 'event' implicitly has an 'any' type.

205       .filter((event): event is TimelineActivity => event !== undefined);
                   ~~~~~

src/engine/api/graphql/workspace-resolver-builder/workspace-resolver.factory.ts:100:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'IUnionTypeResolver | IScalarTypeResolver | IEnumTypeResolver | IInputObjectTypeResolver | ISchemaLevelResolver<...> | IObjectTypeResolver<...> | IInterfaceTypeResolver<...>'.
  No index signature with a parameter of type 'string' was found on type 'IUnionTypeResolver | IScalarTypeResolver | IEnumTypeResolver | IInputObjectTypeResolver | ISchemaLevelResolver<...> | IObjectTypeResolver<...> | IInterfaceTypeResolver<...>'.

100           resolvers.Query[resolverName] = resolverFactory.create({
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-resolver-builder/workspace-resolver.factory.ts:123:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'IUnionTypeResolver | IScalarTypeResolver | IEnumTypeResolver | IInputObjectTypeResolver | ISchemaLevelResolver<...> | IObjectTypeResolver<...> | IInterfaceTypeResolver<...>'.
  No index signature with a parameter of type 'string' was found on type 'IUnionTypeResolver | IScalarTypeResolver | IEnumTypeResolver | IInputObjectTypeResolver | ISchemaLevelResolver<...> | IObjectTypeResolver<...> | IInterfaceTypeResolver<...>'.

123         resolvers.Mutation[resolverName] = resolverFactory.create({
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-schema-builder/type-definitions.generator.ts:175:9 - error TS2345: Argument of type 'CompositeType | ObjectMetadataInterface' is not assignable to parameter of type 'ObjectMetadataInterface'.
  Type 'CompositeType' is missing the following properties from type 'ObjectMetadataInterface': id, workspaceId, nameSingular, namePlural, and 13 more.

175         objectMetadata,
            ~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service.ts:99:14 - error TS7006: Parameter 'acc' implicitly has an 'any' type.

99             (acc, { table_name, column_name, data_type, udt_name }) => {
                ~~~

src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service.ts:99:21 - error TS7031: Binding element 'table_name' implicitly has an 'any' type.

99             (acc, { table_name, column_name, data_type, udt_name }) => {
                       ~~~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service.ts:99:33 - error TS7031: Binding element 'column_name' implicitly has an 'any' type.

99             (acc, { table_name, column_name, data_type, udt_name }) => {
                                   ~~~~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service.ts:99:46 - error TS7031: Binding element 'data_type' implicitly has an 'any' type.

99             (acc, { table_name, column_name, data_type, udt_name }) => {
                                                ~~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/distant-table/distant-table.service.ts:99:57 - error TS7031: Binding element 'udt_name' implicitly has an 'any' type.

99             (acc, { table_name, column_name, data_type, udt_name }) => {
                                                           ~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/foreign-table/foreign-table.service.ts:48:12 - error TS7006: Parameter 'foreignTable' implicitly has an 'any' type.

48     ).map((foreignTable) => foreignTable.foreign_table_name);
              ~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/utils/fetch-table-columns.util.ts:19:19 - error TS7006: Parameter 'column' implicitly has an 'any' type.

19   return res.map((column) => ({
                     ~~~~~~

src/engine/metadata-modules/remote-server/remote-table/remote-table-schema-update/remote-table-schema-update.service.ts:65:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

65         updates[tableName] = [DistantTableUpdate.TABLE_DELETED];
           ~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/remote-table-schema-update/remote-table-schema-update.service.ts:81:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

81         updates[tableName] = [
           ~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/remote-table-schema-update/remote-table-schema-update.service.ts:82:15 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

82           ...(updates[tableName] || []),
                 ~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/remote-table-schema-update/remote-table-schema-update.service.ts:87:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

87         updates[tableName] = [
           ~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/remote-table/remote-table-schema-update/remote-table-schema-update.service.ts:88:15 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

88           ...(updates[tableName] || []),
                 ~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/utils/build-update-remote-server-raw-query.utils.ts:47:33 - error TS7053: Element implicitly has an 'any' type because expression of type '"schema"' can't be used to index type '{}'.
  Property 'schema' does not exist on type '{}'.

47     options.push('"schema" = SS{parametersPositions['schema']}');
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/utils/build-update-remote-server-raw-query.utils.ts:51:32 - error TS7053: Element implicitly has an 'any' type because expression of type '"label"' can't be used to index type '{}'.
  Property 'label' does not exist on type '{}'.

51     options.push('"label" = SS{parametersPositions['label']}');
                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/utils/build-update-remote-server-raw-query.utils.ts:81:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

81         parametersPositions[key] = parameters.length;
           ~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/utils/build-update-remote-server-raw-query.utils.ts:90:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

90         parametersPositions[key] = parameters.length;
           ~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/utils/build-update-remote-server-raw-query.utils.ts:97:5 - error TS7053: Element implicitly has an 'any' type because expression of type '"schema"' can't be used to index type '{}'.
  Property 'schema' does not exist on type '{}'.

97     parametersPositions['schema'] = parameters.length;
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/utils/build-update-remote-server-raw-query.utils.ts:102:5 - error TS7053: Element implicitly has an 'any' type because expression of type '"label"' can't be used to index type '{}'.
  Property 'label' does not exist on type '{}'.

102     parametersPositions['label'] = parameters.length;
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/utils/build-update-remote-server-raw-query.utils.ts:122:74 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

122     let query = 'jsonb_set("S{objectName}", '{S{firstKey}}', to_jsonb(SS{parametersPositions[firstKey]}::text))';
                                                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/remote-server/utils/build-update-remote-server-raw-query.utils.ts:125:60 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

125       query = 'jsonb_set(S{query}, '{S{key}}', to_jsonb(SS{parametersPositions[key]}::text))';
                                                               ~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/serverless-function/serverless-function.service.ts:54:37 - error TS7006: Parameter 'where' implicitly has an 'any' type.

54   async findManyServerlessFunctions(where) {
                                       ~~~~~

src/engine/metadata-modules/serverless-function/serverless-function.service.ts:279:15 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'JSON'.
  No index signature with a parameter of type 'string' was found on type 'JSON'.

279         file: serverlessFunctionInput.code[key],
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/metadata-modules/serverless-function/serverless-function.service.ts:309:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

309       if (packageJson.dependencies[packageName]) {
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/admin-panel/admin-panel-health.service.ts:130:54 - error TS7006: Parameter 'queue' implicitly has an 'any' type.

130         queues: (indicatorStatus?.queues ?? []).map((queue) => ({
                                                         ~~~~~

src/engine/core-modules/admin-panel/admin-panel.service.ts:204:18 - error TS7006: Parameter 'tag' implicitly has an 'any' type.

204         .filter((tag) => tag && tag.name !== 'latest')
                     ~~~

src/engine/core-modules/admin-panel/admin-panel.service.ts:205:15 - error TS7006: Parameter 'tag' implicitly has an 'any' type.

205         .map((tag) => semver.coerce(tag.name)?.version)
                  ~~~

src/engine/core-modules/admin-panel/admin-panel.service.ts:206:18 - error TS7006: Parameter 'version' implicitly has an 'any' type.

206         .filter((version) => version !== undefined);
                     ~~~~~~~

src/engine/core-modules/admin-panel/admin-panel.service.ts:212:22 - error TS7006: Parameter 'a' implicitly has an 'any' type.

212       versions.sort((a, b) => semver.compare(b, a));
                         ~

src/engine/core-modules/admin-panel/admin-panel.service.ts:212:25 - error TS7006: Parameter 'b' implicitly has an 'any' type.

212       versions.sort((a, b) => semver.compare(b, a));
                            ~

src/engine/core-modules/messaging/services/timeline-messaging.service.ts:159:14 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

159         if (!threadParticipantsAcc[threadParticipant.message.messageThreadId])
                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/messaging/services/timeline-messaging.service.ts:160:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

160           threadParticipantsAcc[threadParticipant.message.messageThreadId] = [];
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/messaging/services/timeline-messaging.service.ts:162:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

162         threadParticipantsAcc[threadParticipant.message.messageThreadId].push(
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/messaging/services/timeline-messaging.service.ts:251:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

251       threadVisibilityAcc[messageThreadId] =
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter.utils.ts:45:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'Conjunctions.not' can't be used to index type '{}'.
  Property '[Conjunctions.not]' does not exist on type '{}'.

45       result[conjunction] = subResult[0];
         ~~~~~~~~~~~~~~~~~~~

src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter.utils.ts:47:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

47       result[conjunction] = subResult;
         ~~~~~~~~~~~~~~~~~~~

src/engine/api/rest/input-factories/order-by-input.factory.ts:72:13 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

72             fieldResult[field] = itemDirection;
               ~~~~~~~~~~~~~~~~~~

src/engine/api/rest/input-factories/order-by-input.factory.ts:77:16 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

77         [key]: fieldResult[key],
                  ~~~~~~~~~~~~~~~~

src/engine/core-modules/search/services/search.service.ts:261:10 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ person: number; company: number; opportunity: number; note: number; task: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ person: number; company: number; opportunity: number; note: number; task: number; }'.

261         (STANDARD_OBJECTS_BY_PRIORITY_RANK[b.objectNameSingular] || 0) -
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/search/services/search.service.ts:262:10 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ person: number; company: number; opportunity: number; note: number; task: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ person: number; company: number; opportunity: number; note: number; task: number; }'.

262         (STANDARD_OBJECTS_BY_PRIORITY_RANK[a.objectNameSingular] || 0)
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/modules/workflow/workflow-executor/utils/variable-resolver.util.ts:52:5 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

52     resolvedObject[key] = resolveInput(value, context);
       ~~~~~~~~~~~~~~~~~~~

src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field.ts:36:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

36         acc[property.name] = {
           ~~~~~~~~~~~~~~~~~~

src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service.ts:575:24 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

575         if (!isDefined(response[key])) {
                           ~~~~~~~~~~~~~

src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service.ts:576:32 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

576           return { key, value: response[key] };
                                   ~~~~~~~~~~~~~

src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service.ts:584:21 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

584           isDefined(response[key].id) &&
                        ~~~~~~~~~~~~~

src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service.ts:585:23 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

585           isValidUuid(response[key].id)
                          ~~~~~~~~~~~~~

src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service.ts:592:26 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

592             where: { id: response[key].id },
                             ~~~~~~~~~~~~~

src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service.ts:597:32 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

597           return { key, value: response[key] };
                                   ~~~~~~~~~~~~~

src/modules/workflow/workflow-builder/workflow-step/workflow-version-step.workspace-service.ts:603:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

603       acc[key] = value;
          ~~~~~~~~

src/modules/connected-account/email-alias-manager/drivers/microsoft/microsoft-email-alias-manager.service.ts:29:19 - error TS7006: Parameter 'address' implicitly has an 'any' type.

29         ?.filter((address) => {
                     ~~~~~~~

src/modules/connected-account/email-alias-manager/drivers/microsoft/microsoft-email-alias-manager.service.ts:32:15 - error TS7006: Parameter 'address' implicitly has an 'any' type.

32         .map((address) => {
                 ~~~~~~~

src/modules/connected-account/email-alias-manager/drivers/microsoft/microsoft-email-alias-manager.service.ts:35:18 - error TS7006: Parameter 'address' implicitly has an 'any' type.

35         .filter((address) => {
                    ~~~~~~~

src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-and-format-gmail-message.util.ts:2:20 - error TS7016: Could not find a declaration file for module 'planer'. '/Users/paulrastoin/ws/twenty/node_modules/planer/lib/planer.js' implicitly has an 'any' type.
  Try 'npm i --save-dev @types/planer' if it exists or add a new declaration (.d.ts) file containing 'declare module 'planer';'

2 import planer from 'planer';
                     ~~~~~~~~

src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service.ts:94:40 - error TS7006: Parameter 'recipient' implicitly has an 'any' type.

94           response?.toRecipients?.map((recipient) => recipient.emailAddress),
                                          ~~~~~~~~~

src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service.ts:98:40 - error TS7006: Parameter 'recipient' implicitly has an 'any' type.

98           response?.ccRecipients?.map((recipient) => recipient.emailAddress),
                                          ~~~~~~~~~

src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-get-messages.service.ts:102:41 - error TS7006: Parameter 'recipient' implicitly has an 'any' type.

102           response?.bccRecipients?.map((recipient) => recipient.emailAddress),
                                            ~~~~~~~~~

src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util.ts:16:25 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Partial<BaseWorkspaceEntity | ObjectRecord>'.
  No index signature with a parameter of type 'string' was found on type 'Partial<BaseWorkspaceEntity | ObjectRecord>'.

16     (key) => !deepEqual(oldRecord[key], newRecord[key]),
                           ~~~~~~~~~~~~~~

src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util.ts:16:41 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Partial<BaseWorkspaceEntity | ObjectRecord>'.
  No index signature with a parameter of type 'string' was found on type 'Partial<BaseWorkspaceEntity | ObjectRecord>'.

16     (key) => !deepEqual(oldRecord[key], newRecord[key]),
                                           ~~~~~~~~~~~~~~

src/engine/core-modules/exception-handler/hooks/use-sentry-tracing.ts:18:10 - error TS7006: Parameter 'o' implicitly has an 'any' type.

18         (o) => o.kind === Kind.OPERATION_DEFINITION,
            ~

src/engine/core-modules/graphql/hooks/use-graphql-error-handler.hook.ts:57:10 - error TS7006: Parameter 'o' implicitly has an 'any' type.

57         (o) => o.kind === Kind.OPERATION_DEFINITION,
            ~

src/engine/api/rest/metadata/query-builder/factories/find-many-metadata-query.factory.ts:9:10 - error TS7006: Parameter 'objectNamePlural' implicitly has an 'any' type.

9   create(objectNamePlural): string {
           ~~~~~~~~~~~~~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:19:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

19           cleanedObj[key] = obj[key].edges.map((edge) =>
             ~~~~~~~~~~~~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:19:49 - error TS7006: Parameter 'edge' implicitly has an 'any' type.

19           cleanedObj[key] = obj[key].edges.map((edge) =>
                                                   ~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:24:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

24           cleanedObj[key] = cleanObject(obj[key]);
             ~~~~~~~~~~~~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:28:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

28         cleanedObj[key] = obj[key];
           ~~~~~~~~~~~~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:38:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

38       output.data[key] = input[key].edges.map((edge) => cleanObject(edge.node));
         ~~~~~~~~~~~~~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:38:48 - error TS7006: Parameter 'edge' implicitly has an 'any' type.

38       output.data[key] = input[key].edges.map((edge) => cleanObject(edge.node));
                                                  ~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:41:9 - error TS7053: Element implicitly has an 'any' type because expression of type '"pageInfo"' can't be used to index type '{ data: {}; }'.
  Property 'pageInfo' does not exist on type '{ data: {}; }'.

41         output['pageInfo'] = input[key].pageInfo;
           ~~~~~~~~~~~~~~~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:44:9 - error TS7053: Element implicitly has an 'any' type because expression of type '"totalCount"' can't be used to index type '{ data: {}; }'.
  Property 'totalCount' does not exist on type '{ data: {}; }'.

44         output['totalCount'] = input[key].totalCount;
           ~~~~~~~~~~~~~~~~~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:48:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

48       output.data[key] = cleanObject(input[key]);
         ~~~~~~~~~~~~~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:50:49 - error TS7006: Parameter 'item' implicitly has an 'any' type.

50       const itemsWithEdges = input[key].filter((item) => item.edges);
                                                   ~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:51:53 - error TS7031: Binding element 'edges' implicitly has an 'any' type.

51       const cleanedObjArray = itemsWithEdges.map(({ edges, ...item }) => {
                                                       ~~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:54:29 - error TS7006: Parameter 'edge' implicitly has an 'any' type.

54           [key]: edges.map((edge) => cleanObject(edge.node)),
                               ~~~~

src/engine/api/rest/utils/clean-graphql-response.utils.ts:61:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

61       output.data[key] = input[key];
         ~~~~~~~~~~~~~~~~

src/database/commands/upgrade-version-command/0-43/0-43-add-tasks-assigned-to-me-view.command.ts:67:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

67       acc[object.standardId ?? ''] = {
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/database/commands/upgrade-version-command/0-43/0-43-add-tasks-assigned-to-me-view.command.ts:70:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

70           acc[field.standardId ?? ''] = field.id;
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/database/commands/upgrade-version-command/0-53/0-53-copy-typeorm-migrations.command.ts:62:37 - error TS7006: Parameter 'migration' implicitly has an 'any' type.

62         existingCoreMigrations.map((migration) => migration.name),
                                       ~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:190:11 - error TS7034: Variable 'passedParams' implicitly has type 'any[]' in some locations where its type cannot be determined.

190     const passedParams = [];
              ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:193:36 - error TS7005: Variable 'passedParams' implicitly has an 'any[]' type.

193     await upgradeCommandRunner.run(passedParams, options);
                                       ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:242:11 - error TS7034: Variable 'passedParams' implicitly has type 'any[]' in some locations where its type cannot be determined.

242     const passedParams = [];
              ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:245:36 - error TS7005: Variable 'passedParams' implicitly has an 'any[]' type.

245     await upgradeCommandRunner.run(passedParams, options);
                                       ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:290:11 - error TS7034: Variable 'passedParams' implicitly has type 'any[]' in some locations where its type cannot be determined.

290     const passedParams = [];
              ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:293:36 - error TS7005: Variable 'passedParams' implicitly has an 'any[]' type.

293     await upgradeCommandRunner.run(passedParams, options);
                                       ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:313:11 - error TS7034: Variable 'passedParams' implicitly has type 'any[]' in some locations where its type cannot be determined.

313     const passedParams = [];
              ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:316:36 - error TS7005: Variable 'passedParams' implicitly has an 'any[]' type.

316     await upgradeCommandRunner.run(passedParams, options);
                                       ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:383:15 - error TS7034: Variable 'passedParams' implicitly has type 'any[]' in some locations where its type cannot be determined.

383         const passedParams = [];
                  ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:386:40 - error TS7005: Variable 'passedParams' implicitly has an 'any[]' type.

386         await upgradeCommandRunner.run(passedParams, options);
                                           ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:464:13 - error TS7034: Variable 'passedParams' implicitly has type 'any[]' in some locations where its type cannot be determined.

464       const passedParams = [];
                ~~~~~~~~~~~~

src/database/commands/command-runners/__tests__/upgrade.command-runner.spec.ts:467:38 - error TS7005: Variable 'passedParams' implicitly has an 'any[]' type.

467       await upgradeCommandRunner.run(passedParams, options);
                                         ~~~~~~~~~~~~

src/engine/api/__mocks__/object-metadata-item.mock.ts:303:5 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

303     acc[field.id] = field;
        ~~~~~~~~~~~~~

src/engine/api/__mocks__/object-metadata-item.mock.ts:308:5 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

308     acc[field.name] = field;
        ~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-query-builder/utils/get-field-arguments-by-key.util.ts:47:7 - error TS7023: 'parseValueNode' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.

47 const parseValueNode = (
         ~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-query-builder/utils/get-field-arguments-by-key.util.ts:65:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

65         obj[field.name.value] = parseValueNode(field.value, variables);
           ~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/compute-pg-graphql-error.util.ts:38:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ insertInto: string; update: string; deleteFrom: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ insertInto: string; update: string; deleteFrom: string; }'.

38         pgGraphQLCommandMapping[command] ?? command
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/compute-pg-graphql-error.util.ts:45:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ insertInto: string; update: string; deleteFrom: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ insertInto: string; update: string; deleteFrom: string; }'.

45         pgGraphQLCommandMapping[command] ?? command
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/__tests__/parse-result.spec.ts:8:7 - error TS7034: Variable 'result' implicitly has type 'any' in some locations where its type cannot be determined.

8   let result;
        ~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/__tests__/parse-result.spec.ts:16:7 - error TS7005: Variable 'result' implicitly has an 'any' type.

16       result,
         ~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/__tests__/parse-result.spec.ts:20:12 - error TS7005: Variable 'result' implicitly has an 'any' type.

20     expect(result).toEqual({
              ~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/__tests__/parse-result.spec.ts:29:7 - error TS7005: Variable 'result' implicitly has an 'any' type.

29       result,
         ~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/__tests__/parse-result.spec.ts:34:7 - error TS7005: Variable 'result' implicitly has an 'any' type.

34       result,
         ~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/__tests__/parse-result.spec.ts:38:12 - error TS7005: Variable 'result' implicitly has an 'any' type.

38     expect(result).toEqual({
              ~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/__tests__/parse-result.spec.ts:47:24 - error TS7005: Variable 'result' implicitly has an 'any' type.

47     handleCompositeKey(result, 'COMPOSITE___complexField', 'value1');
                          ~~~~~~

src/engine/api/graphql/workspace-query-runner/utils/__tests__/parse-result.spec.ts:48:12 - error TS7005: Variable 'result' implicitly has an 'any' type.

48     expect(result).toEqual({});
              ~~~~~~

src/engine/core-modules/domain-manager/services/domain-manager.service.spec.ts:21:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ FRONTEND_URL: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ FRONTEND_URL: string; }'.

21           return env[key];
                    ~~~~~~~~

src/engine/core-modules/domain-manager/services/domain-manager.service.spec.ts:45:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ FRONTEND_URL: string; IS_MULTIWORKSPACE_ENABLED: boolean; }'.
  No index signature with a parameter of type 'string' was found on type '{ FRONTEND_URL: string; IS_MULTIWORKSPACE_ENABLED: boolean; }'.

45           return env[key];
                    ~~~~~~~~

src/engine/core-modules/domain-manager/services/domain-manager.service.spec.ts:94:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ FRONTEND_URL: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ FRONTEND_URL: string; }'.

94           return env[key];
                    ~~~~~~~~

src/engine/core-modules/domain-manager/services/domain-manager.service.spec.ts:112:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ FRONTEND_URL: string; IS_MULTIWORKSPACE_ENABLED: boolean; DEFAULT_SUBDOMAIN: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ FRONTEND_URL: string; IS_MULTIWORKSPACE_ENABLED: boolean; DEFAULT_SUBDOMAIN: string; }'.

112           return env[key];
                     ~~~~~~~~

src/engine/core-modules/domain-manager/services/domain-manager.service.spec.ts:132:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ FRONTEND_URL: string; IS_MULTIWORKSPACE_ENABLED: boolean; DEFAULT_SUBDOMAIN: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ FRONTEND_URL: string; IS_MULTIWORKSPACE_ENABLED: boolean; DEFAULT_SUBDOMAIN: string; }'.

132           return env[key];
                     ~~~~~~~~

src/engine/core-modules/domain-manager/services/domain-manager.service.spec.ts:154:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ FRONTEND_URL: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ FRONTEND_URL: string; }'.

154           return env[key];
                     ~~~~~~~~

src/engine/core-modules/domain-manager/services/domain-manager.service.spec.ts:177:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ FRONTEND_URL: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ FRONTEND_URL: string; }'.

177           return env[key];
                     ~~~~~~~~

src/engine/core-modules/feature-flag/services/__tests__/feature-flag.service.spec.ts:215:29 - error TS2551: Property 'IS_WORKFLOW_ENABLED' does not exist on type 'typeof FeatureFlagKey'. Did you mean 'IsWorkflowEnabled'?

215         key: FeatureFlagKey[featureFlag],
                                ~~~~~~~~~~~

src/engine/core-modules/twenty-config/twenty-config.service.spec.ts:385:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ TEST_VAR: string; ENV_ONLY_VAR: string; SENSITIVE_VAR: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ TEST_VAR: string; ENV_ONLY_VAR: string; SENSITIVE_VAR: string; }'.

385           return values[keyStr] || undefined;
                     ~~~~~~~~~~~~~~

src/engine/core-modules/twenty-config/twenty-config.service.spec.ts:393:15 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ TEST_VAR: { group: ConfigVariablesGroup; description: string; isEnvOnly: boolean; }; ENV_ONLY_VAR: { group: ConfigVariablesGroup; description: string; isEnvOnly: boolean; }; SENSITIVE_VAR: { ...; }; }'.
  No index signature with a parameter of type 'string' was found on type '{ TEST_VAR: { group: ConfigVariablesGroup; description: string; isEnvOnly: boolean; }; ENV_ONLY_VAR: { group: ConfigVariablesGroup; description: string; isEnvOnly: boolean; }; SENSITIVE_VAR: { ...; }; }'.

393           if (mockConfigVarMetadata[keyStr]?.isEnvOnly) {
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/engine/core-modules/twenty-config/twenty-config.service.spec.ts:401:18 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ TEST_VAR: string; SENSITIVE_VAR: string; }'.
  No index signature with a parameter of type 'string' was found on type '{ TEST_VAR: string; SENSITIVE_VAR: string; }'.

401           return values[keyStr] || undefined;
                     ~~~~~~~~~~~~~~

src/engine/core-modules/twenty-config/utils/__tests__/apply-basic-validators.util.spec.ts:67:23 - error TS2722: Cannot invoke an object which is possibly 'undefined'.

67       const result1 = transformFn(mockTransformParams);
                         ~~~~~~~~~~~

src/engine/core-modules/twenty-config/utils/__tests__/apply-basic-validators.util.spec.ts:67:23 - error TS18048: 'transformFn' is possibly 'undefined'.

67       const result1 = transformFn(mockTransformParams);
                         ~~~~~~~~~~~

src/engine/core-modules/twenty-config/utils/__tests__/apply-basic-validators.util.spec.ts:73:23 - error TS2722: Cannot invoke an object which is possibly 'undefined'.

73       const result2 = transformFn(mockTransformParams);
                         ~~~~~~~~~~~

src/engine/core-modules/twenty-config/utils/__tests__/apply-basic-validators.util.spec.ts:73:23 - error TS18048: 'transformFn' is possibly 'undefined'.

73       const result2 = transformFn(mockTransformParams);
                         ~~~~~~~~~~~

src/engine/core-modules/twenty-config/utils/__tests__/apply-basic-validators.util.spec.ts:102:23 - error TS2722: Cannot invoke an object which is possibly 'undefined'.

102       const result1 = transformFn(mockTransformParams);
                          ~~~~~~~~~~~

src/engine/core-modules/twenty-config/utils/__tests__/apply-basic-validators.util.spec.ts:102:23 - error TS18048: 'transformFn' is possibly 'undefined'.

102       const result1 = transformFn(mockTransformParams);
                          ~~~~~~~~~~~

src/engine/core-modules/twenty-config/utils/__tests__/apply-basic-validators.util.spec.ts:108:23 - error TS2722: Cannot invoke an object which is possibly 'undefined'.

108       const result2 = transformFn(mockTransformParams);
                          ~~~~~~~~~~~

src/engine/core-modules/twenty-config/utils/__tests__/apply-basic-validators.util.spec.ts:108:23 - error TS18048: 'transformFn' is possibly 'undefined'.

108       const result2 = transformFn(mockTransformParams);
                          ~~~~~~~~~~~

src/engine/core-modules/user/user-vars/utils/__tests__/merge-user-vars.spec.ts:38:11 - error TS7034: Variable 'userVars' implicitly has type 'any[]' in some locations where its type cannot be determined.

38     const userVars = [];
             ~~~~~~~~

src/engine/core-modules/user/user-vars/utils/__tests__/merge-user-vars.spec.ts:40:42 - error TS7005: Variable 'userVars' implicitly has an 'any[]' type.

40     const mergedUserVars = mergeUserVars(userVars);
                                            ~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/__tests__/workspace-relation.comparator.spec.ts:21:11 - error TS7034: Variable 'original' implicitly has type 'any[]' in some locations where its type cannot be determined.

21     const original = [];
             ~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/__tests__/workspace-relation.comparator.spec.ts:24:39 - error TS7005: Variable 'original' implicitly has an 'any[]' type.

24     const result = comparator.compare(original, standard);
                                         ~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/__tests__/workspace-relation.comparator.spec.ts:39:11 - error TS7034: Variable 'standard' implicitly has type 'any[]' in some locations where its type cannot be determined.

39     const standard = [];
             ~~~~~~~~

src/engine/workspace-manager/workspace-sync-metadata/comparators/__tests__/workspace-relation.comparator.spec.ts:41:49 - error TS7005: Variable 'standard' implicitly has an 'any[]' type.

41     const result = comparator.compare(original, standard);
                                                   ~~~~~~~~

src/modules/connected-account/email-alias-manager/services/email-alias-manager.service.spec.ts:24:44 - error TS7006: Parameter 'arg' implicitly has an 'any' type.

24       update: jest.fn().mockResolvedValue((arg) => arg),
                                              ~~~

src/modules/workflow/workflow-builder/workflow-schema/utils/__tests__/generate-fake-form-response.spec.ts:12:7 - error TS7034: Variable 'objectMetadataRepository' implicitly has type 'any' in some locations where its type cannot be determined.

12   let objectMetadataRepository;
         ~~~~~~~~~~~~~~~~~~~~~~~~

src/modules/workflow/workflow-builder/workflow-schema/utils/__tests__/generate-fake-form-response.spec.ts:55:7 - error TS7005: Variable 'objectMetadataRepository' implicitly has an 'any' type.

55       objectMetadataRepository,
         ~~~~~~~~~~~~~~~~~~~~~~~~

test/integration/utils/delete-all-records.ts:5:18 - error TS7017: Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.

5     await global.testDataSource.query(
                   ~~~~~~~~~~~~~~

test/integration/graphql/suites/all-people-resolvers.integration-spec.ts:49:46 - error TS7006: Parameter 'person' implicitly has an 'any' type.

49     response.body.data.createPeople.forEach((person) => {
                                                ~~~~~~

test/integration/graphql/suites/all-people-resolvers.integration-spec.ts:171:28 - error TS7006: Parameter 'person' implicitly has an 'any' type.

171     updatedPeople.forEach((person) => {
                               ~~~~~~

test/integration/graphql/suites/all-people-resolvers.integration-spec.ts:244:27 - error TS7006: Parameter 'person' implicitly has an 'any' type.

244     deletePeople.forEach((person) => {
                              ~~~~~~

test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util.ts:28:48 - error TS7006: Parameter 'edge' implicitly has an 'any' type.

28   return response.body.data.objects.edges.map((edge) => edge.node);
                                                  ~~~~

test/integration/graphql/suites/search/search-resolver.integration-spec.ts:59:10 - error TS7006: Parameter 'object' implicitly has an 'any' type.

59         (object) => object.nameSingular === LISTING_NAME_SINGULAR,
            ~~~~~~

test/integration/graphql/suites/settings-permissions/roles.integration-spec.ts:66:8 - error TS7006: Parameter 'role' implicitly has an 'any' type.

66       (role) => role.label === 'Admin',
          ~~~~

test/integration/graphql/suites/settings-permissions/roles.integration-spec.ts:70:8 - error TS7006: Parameter 'role' implicitly has an 'any' type.

70       (role) => role.label === 'Guest',
          ~~~~

test/integration/graphql/suites/settings-permissions/roles.integration-spec.ts:234:10 - error TS7006: Parameter 'role' implicitly has an 'any' type.

234         (role) => role.label === 'Member',
             ~~~~

test/integration/graphql/suites/settings-permissions/roles.integration-spec.ts:238:10 - error TS7006: Parameter 'role' implicitly has an 'any' type.

238         (role) => role.label === 'Guest',
             ~~~~

test/integration/graphql/suites/settings-permissions/security.integration-spec.ts:13:7 - error TS7034: Variable 'originalWorkspaceState' implicitly has type 'any' in some locations where its type cannot be determined.

13   let originalWorkspaceState;
         ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/security.integration-spec.ts:50:29 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

50             displayName: "S{originalWorkspaceState.displayName}",
                               ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/security.integration-spec.ts:51:27 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

51             subdomain: "S{originalWorkspaceState.subdomain}",
                             ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/security.integration-spec.ts:52:22 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

52             logo: "S{originalWorkspaceState.logo}",
                        ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/security.integration-spec.ts:53:36 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

53             isGoogleAuthEnabled: S{originalWorkspaceState.isGoogleAuthEnabled},
                                      ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/security.integration-spec.ts:54:39 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

54             isMicrosoftAuthEnabled: S{originalWorkspaceState.isMicrosoftAuthEnabled},
                                         ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/security.integration-spec.ts:55:38 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

55             isPasswordAuthEnabled: S{originalWorkspaceState.isPasswordAuthEnabled}
                                        ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/security.integration-spec.ts:56:42 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

56             isPublicInviteLinkEnabled: S{originalWorkspaceState.isPublicInviteLinkEnabled}
                                            ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/workspace.integration-spec.ts:14:7 - error TS7034: Variable 'originalWorkspaceState' implicitly has type 'any' in some locations where its type cannot be determined.

14   let originalWorkspaceState;
         ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/workspace.integration-spec.ts:51:27 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

51           displayName: "S{originalWorkspaceState.displayName}",
                             ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/workspace.integration-spec.ts:52:25 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

52           subdomain: "S{originalWorkspaceState.subdomain}",
                           ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/workspace.integration-spec.ts:53:20 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

53           logo: "S{originalWorkspaceState.logo}",
                      ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/workspace.integration-spec.ts:54:34 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

54           isGoogleAuthEnabled: S{originalWorkspaceState.isGoogleAuthEnabled},
                                    ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/workspace.integration-spec.ts:55:37 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

55           isMicrosoftAuthEnabled: S{originalWorkspaceState.isMicrosoftAuthEnabled},
                                       ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/workspace.integration-spec.ts:56:36 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

56           isPasswordAuthEnabled: S{originalWorkspaceState.isPasswordAuthEnabled}
                                      ~~~~~~~~~~~~~~~~~~~~~~

test/integration/graphql/suites/settings-permissions/workspace.integration-spec.ts:57:40 - error TS7005: Variable 'originalWorkspaceState' implicitly has an 'any' type.

57           isPublicInviteLinkEnabled: S{originalWorkspaceState.isPublicInviteLinkEnabled}
                                          ~~~~~~~~~~~~~~~~~~~~~~

test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util.ts:28:47 - error TS7006: Parameter 'edge' implicitly has an 'any' type.

28   return response.body.data.fields.edges.map((edge) => edge.node);
                                                 ~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:66:59 - error TS7006: Parameter 'standardObjects' implicitly has an 'any' type.

66   const fillStandardObjectRelationsMapObjectMetadataId = (standardObjects) => {
                                                             ~~~~~~~~~~~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:68:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

68       standardObjectRelationsMap[relation].objectMetadataId =
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:70:12 - error TS7006: Parameter 'object' implicitly has an 'any' type.

70           (object) => object.node.nameSingular === relation,
              ~~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:111:10 - error TS7006: Parameter 'field' implicitly has an 'any' type.

111         (field) =>
             ~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:115:13 - error TS7006: Parameter 'field' implicitly has an 'any' type.

115       .map((field) => field.node);
                ~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:120:10 - error TS7006: Parameter 'field' implicitly has an 'any' type.

120         (field) =>
             ~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:122:11 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

122           standardObjectRelationsMap[relation].objectMetadataId,
              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:127:7 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

127       standardObjectRelationsMap[relation].relationFieldMetadataId =
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:141:8 - error TS7006: Parameter 'object' implicitly has an 'any' type.

141       (object) => object.node.nameSingular === 'person',
           ~~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:211:8 - error TS7006: Parameter 'field' implicitly has an 'any' type.

211       (field) => field.node,
           ~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:218:9 - error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
  No index signature with a parameter of type 'string' was found on type '{}'.

218         standardObjectRelationsMap[relation].relationFieldMetadataId;
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:221:10 - error TS7006: Parameter 'field' implicitly has an 'any' type.

221         (field) => field.id === relationFieldMetadataId,
             ~~~~~

test/integration/metadata/suites/object-metadata/rename-custom-object.integration-spec.ts:230:8 - error TS7006: Parameter 'field' implicitly has an 'any' type.

230       (field) => field.id === relationFieldMetadataOnPersonId,
           ~~~~~

test/integration/rest/suites/rest-api-core-create-many.integration-spec.ts:131:12 - error TS7006: Parameter 'p' implicitly has an 'any' type.

131           (p) => p.id === createdPerson1.id,
               ~

test/integration/rest/suites/rest-api-core-create-many.integration-spec.ts:134:12 - error TS7006: Parameter 'p' implicitly has an 'any' type.

134           (p) => p.id === createdPerson2.id,
               ~

test/integration/rest/suites/rest-api-core-create-one.integration-spec.ts:111:12 - error TS7006: Parameter 'p' implicitly has an 'any' type.

111           (p) => p.id === createdPerson.id,
               ~

test/integration/rest/suites/rest-api-core-find-duplicates.integration-spec.ts:271:8 - error TS7006: Parameter 'p' implicitly has an 'any' type.

271       (p) => p.id === personDuplicated1.id,
           ~

test/integration/rest/suites/rest-api-core-find-duplicates.integration-spec.ts:274:8 - error TS7006: Parameter 'p' implicitly has an 'any' type.

274       (p) => p.id === personDuplicated2.id,
           ~

test/integration/rest/suites/rest-api-core-find-many.integration-spec.ts:73:35 - error TS7006: Parameter 'p' implicitly has an 'any' type.

73       const person = people.find((p) => p.id === personId);
                                     ~

test/integration/rest/suites/rest-api-core-find-many.integration-spec.ts:311:54 - error TS7006: Parameter 'p' implicitly has an 'any' type.

311     const depth2Person = person.company.people.find((p) => p.id === person.id);
                                                         ~

test/integration/rest/suites/rest-api-core-find-one.integration-spec.ts:113:12 - error TS7006: Parameter 'p' implicitly has an 'any' type.

113           (p) => p.id === person.id,
               ~

test/integration/rest/suites/rest-api-core-update.integration-spec.ts:118:12 - error TS7006: Parameter 'p' implicitly has an 'any' type.

118           (p) => p.id === updatedPerson.id,
               ~

test/integration/twenty-config/twenty-config.integration-spec.ts:345:10 - error TS7006: Parameter 'group' implicitly has an 'any' type.

345         (group) => group.variables,
             ~~~~~

test/integration/twenty-config/twenty-config.integration-spec.ts:348:10 - error TS7006: Parameter 'variable' implicitly has an 'any' type.

348         (variable) => variable.name === testKey,
             ~~~~~~~~

test/integration/utils/setup-test.ts:8:23 - error TS7006: Parameter '_' implicitly has an 'any' type.

8 export default async (_, projectConfig: JestConfigWithTsJest) => {
                        ~

test/integration/utils/setup-test.ts:19:10 - error TS7017: Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.

19   global.app = app;
            ~~~

test/integration/utils/setup-test.ts:20:10 - error TS7017: Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.

20   global.testDataSource = rawDataSource;
            ~~~~~~~~~~~~~~

test/integration/utils/teardown-test.ts:4:10 - error TS7017: Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.

4   global.testDataSource.destroy();
           ~~~~~~~~~~~~~~

test/integration/utils/teardown-test.ts:5:10 - error TS7017: Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.

5   global.app.close();
           ~~~


Found 310 errors.`;
