import gql from 'graphql-tag';

const companyProperties = `
    id
    name
    employees
    idealCustomerProfile
    position
    createdAt
    updatedAt
    deletedAt
    accountOwnerId
    tagline
    workPolicy
    visaSponsorship
`;

export const findCompanyQuery = gql`
  query Company($filter: CompanyFilterInput) {
    company(filter: $filter) {
        ${companyProperties}
    }
  }
`;

export const findCompaniesWithFilterQuery = gql`
  query Companies($filter: CompanyFilterInput) {
    companies(filter: $filter) {
      edges {
        node {
          ${companyProperties}
        }
      }
    }
  }
`;

export const createCompaniesMutation = gql`
  mutation CreateCompanies($data: [CompanyCreateInput!]!) {
    createCompanies(data: $data) {
      ${companyProperties}
    }
  }
`;

export const createCompanyMutation = gql`
  mutation CreateCompany($data: CompanyCreateInput) {
    createCompany(data: $data) {
      ${companyProperties}
    }
  }
`;

export const deleteCompaniesMutation = gql`
  mutation DeleteCompanies($filter: CompanyFilterInput) {
    deleteCompanies(filter: $filter) {
      deletedAt
    }
  }
`;

export const deleteCompanyMutation = gql`
  mutation DeleteCompany($companyId: ID!) {
    deleteCompany(id: $companyId) {
      deletedAt
    }
  }
`;

export const destroyCompaniesMutation = gql`
  mutation DestroyCompanies($filter: CompanyFilterInput) {
    destroyCompanies(filter: $filter) {
      deletedAt
    }
  }
`;
export const destroyCompanyMutation = gql`
  mutation DestroyCompany($companyId: ID!) {
    destroyCompany(id: $companyId) {
      deletedAt
    }
  }
`;
export const updatePersonMutation = gql`
  mutation UpdatePerson($personId: ID!, $data: PersonUpdateInput!) {
    updatePerson(id: $personId, data: $data) {
      id
    }
  }
`;

export const findCompanyWithPeopleRelationQuery = gql`
  query Company($filter: CompanyFilterInput) {
    company(filter: $filter) {
      people {
        edges {
          node {
            id
            name {
              firstName
            }
            companyId
          }
        }
      }
    }
  }
`;

export const findPersonWithCompanyRelationQuery = gql`
  query Person($filter: PersonFilterInput) {
    person(filter: $filter) {
      company {
        id
        name
      }
    }
  }
`;

export const updateCompaniesMutation = gql`
  mutation UpdateCompanies(
    $data: CompanyUpdateInput
    $filter: CompanyFilterInput
  ) {
    updateCompanies(data: $data, filter: $filter) {
      id
      name
    }
  }
`;

export const findAllCompaniesQuery = gql`
  query Companies {
    companies {
      edges {
        node {
          ${companyProperties}
        }
      }
    }
  }
`;

export const updateCompanyMutation = gql`
  mutation UpdateCompany($companyId: ID, $data: CompanyUpdateInput) {
    updateCompany(id: $companyId, data: $data) {
      name
    }
  }
`;

export const findCompanyWithFilterQuery = gql`
  query Company($filter: CompanyFilterInput) {
    company(filter: $filter) {
        ${companyProperties}
    }
  }
`;
