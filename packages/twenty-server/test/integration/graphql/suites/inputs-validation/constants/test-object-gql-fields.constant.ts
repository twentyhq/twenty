import { joinColumnNameForManyToOneMorphRelationField1 } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';

export const TEST_OBJECT_GQL_FIELDS = `
    id
    position
    manyToOneRelationFieldId
    manyToOneRelationField {
        id
    }
    ${joinColumnNameForManyToOneMorphRelationField1}
    ${joinColumnNameForManyToOneMorphRelationField1.replace('Id', '')}{
        id
    }
    uuidField
    textField
    phonesField {
        primaryPhoneNumber
        primaryPhoneCallingCode
        primaryPhoneCountryCode
        additionalPhones
    }
    emailsField {
        primaryEmail
        additionalEmails
    }
    dateTimeField
    dateField
    booleanField
    numberField
    linksField {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
    }
    currencyField {
        amountMicros
        currencyCode
    }
    fullNameField {
        firstName
        lastName
    }
    ratingField
    selectField
    multiSelectField
    addressField {
        addressStreet1
        addressStreet2
        addressCity
        addressState
        addressCountry
        addressPostcode
    }
    rawJsonField
    arrayField
    richTextField
    richTextV2Field {
        blocknote
        markdown
    }
`;
