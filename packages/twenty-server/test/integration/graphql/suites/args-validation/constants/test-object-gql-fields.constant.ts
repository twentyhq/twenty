export const TEST_OBJECT_GQL_FIELDS = `
    id
    manyToOneRelationField {
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
`;
