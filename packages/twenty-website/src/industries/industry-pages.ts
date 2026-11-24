import { type IndustryPageDefinition } from './industry-page-types';
import { AGRIBUSINESS_INDUSTRY_PAGE } from './pages/agribusiness.industry-page';
import { COMMERCIAL_REAL_ESTATE_INDUSTRY_PAGE } from './pages/commercial-real-estate.industry-page';
import { CONSULTING_INDUSTRY_PAGE } from './pages/consulting.industry-page';
import { DEFENSE_SUPPLIERS_INDUSTRY_PAGE } from './pages/defense-suppliers.industry-page';
import { EDTECH_INDUSTRY_PAGE } from './pages/edtech.industry-page';
import { EDUCATION_INDUSTRY_PAGE } from './pages/education.industry-page';
import { FINANCIAL_SERVICES_INDUSTRY_PAGE } from './pages/financial-services.industry-page';
import { FOUNDATIONS_GRANTMAKERS_INDUSTRY_PAGE } from './pages/foundations-grantmakers.industry-page';
import { HEALTHCARE_LIFE_SCIENCES_INDUSTRY_PAGE } from './pages/healthcare-life-sciences.industry-page';
import { MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE } from './pages/manufacturing-distribution.industry-page';
import { MEDTECH_SALES_INDUSTRY_PAGE } from './pages/medtech-sales.industry-page';
import { NONPROFIT_INDUSTRY_PAGE } from './pages/nonprofit.industry-page';
import { PRIVATE_EQUITY_VENTURE_CAPITAL_INDUSTRY_PAGE } from './pages/private-equity-venture-capital.industry-page';
import { PROFESSIONAL_SERVICES_INDUSTRY_PAGE } from './pages/professional-services.industry-page';
import { PUBLIC_SECTOR_DEFENSE_INDUSTRY_PAGE } from './pages/public-sector-defense.industry-page';
import { REAL_ESTATE_INDUSTRY_PAGE } from './pages/real-estate.industry-page';

export const INDUSTRY_PAGES: readonly IndustryPageDefinition[] = [
  REAL_ESTATE_INDUSTRY_PAGE,
  COMMERCIAL_REAL_ESTATE_INDUSTRY_PAGE,
  FINANCIAL_SERVICES_INDUSTRY_PAGE,
  PRIVATE_EQUITY_VENTURE_CAPITAL_INDUSTRY_PAGE,
  PROFESSIONAL_SERVICES_INDUSTRY_PAGE,
  CONSULTING_INDUSTRY_PAGE,
  NONPROFIT_INDUSTRY_PAGE,
  FOUNDATIONS_GRANTMAKERS_INDUSTRY_PAGE,
  EDUCATION_INDUSTRY_PAGE,
  EDTECH_INDUSTRY_PAGE,
  HEALTHCARE_LIFE_SCIENCES_INDUSTRY_PAGE,
  MEDTECH_SALES_INDUSTRY_PAGE,
  MANUFACTURING_DISTRIBUTION_INDUSTRY_PAGE,
  AGRIBUSINESS_INDUSTRY_PAGE,
  PUBLIC_SECTOR_DEFENSE_INDUSTRY_PAGE,
  DEFENSE_SUPPLIERS_INDUSTRY_PAGE,
];
