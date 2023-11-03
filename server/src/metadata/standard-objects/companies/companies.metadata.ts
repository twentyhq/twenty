const companiesMetadata = {
  nameSingular: 'companyV2',
  namePlural: 'companiesV2',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  targetTableName: 'company',
  description: 'A company',
  icon: 'IconBuildingSkyscraper',
  fields: [
    {
      type: 'TEXT',
      name: 'name',
      label: 'Name',
      targetColumnMap: {
        value: 'name',
      },
      description: 'Name of the company',
      icon: 'IconBuildingSkyscraper',
      isNullable: false,
    },
    {
      type: 'TEXT',
      name: 'domainName',
      label: 'Domain Name',
      targetColumnMap: {
        value: 'domainName',
      },
      description: 'Domain name of the company',
      icon: 'IconLink',
      isNullable: true,
    },
    {
      type: 'TEXT',
      name: 'address',
      label: 'Address',
      targetColumnMap: {
        value: 'address',
      },
      description: 'Address of the company',
      icon: 'IconMap',
      isNullable: true,
    },
    {
      type: 'NUMBER',
      name: 'employees',
      label: 'Employees',
      targetColumnMap: {
        value: 'employees',
      },
      description: 'Number of employees',
      icon: 'IconUsers',
      isNullable: true,
    },
  ],
};

export default companiesMetadata;
