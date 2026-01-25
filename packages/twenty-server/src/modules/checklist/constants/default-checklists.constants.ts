/**
 * Default Checklist Templates for Different Business Types
 * These are auto-populated when creating a new transaction
 */

// ==================== REAL ESTATE CHECKLISTS ====================

/**
 * Texas Buyer Transaction Checklist
 * Standard items from contract to close
 */
export const TEXAS_BUYER_CHECKLIST = {
  name: 'Texas Buyer Transaction Checklist',
  checklistType: 'buyer',
  businessType: 'real_estate',
  sections: [
    {
      name: 'Pre-Contract',
      phase: 'pre-contract',
      items: [
        {
          title: 'Buyer Representation Agreement Signed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'agreement',
        },
        {
          title: 'Pre-Approval Letter Obtained',
          isRequired: true,
          requiresDocument: true,
          documentType: 'financing',
        },
        {
          title: 'Property Search Criteria Defined',
          isRequired: false,
          requiresDocument: false,
        },
      ],
    },
    {
      name: 'Contract Phase',
      phase: 'under-contract',
      items: [
        {
          title: 'Contract Executed (TREC 1-4)',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'contract',
        },
        {
          title: "Seller's Disclosure Received",
          isRequired: true,
          requiresDocument: true,
          documentType: 'disclosure',
        },
        {
          title: 'HOA Addendum (if applicable)',
          isRequired: false,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'addendum',
        },
        {
          title: 'Third Party Financing Addendum',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'addendum',
        },
        {
          title: 'Earnest Money Deposited',
          isRequired: true,
          requiresDocument: true,
          documentType: 'receipt',
          daysFromContract: 3,
        },
        {
          title: 'Option Fee Paid',
          isRequired: true,
          requiresDocument: true,
          documentType: 'receipt',
          daysFromContract: 1,
        },
      ],
    },
    {
      name: 'Option/Inspection Period',
      phase: 'under-contract',
      items: [
        {
          title: 'Home Inspection Scheduled',
          isRequired: true,
          requiresDocument: false,
          daysFromContract: 2,
        },
        {
          title: 'Home Inspection Completed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'inspection',
          daysFromContract: 5,
        },
        {
          title: 'WDI (Termite) Inspection',
          isRequired: false,
          requiresDocument: true,
          documentType: 'inspection',
        },
        {
          title: 'Pool/Spa Inspection (if applicable)',
          isRequired: false,
          requiresDocument: true,
          documentType: 'inspection',
        },
        {
          title: 'Septic Inspection (if applicable)',
          isRequired: false,
          requiresDocument: true,
          documentType: 'inspection',
        },
        {
          title: 'Amendment for Repairs (if any)',
          isRequired: false,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'addendum',
        },
        {
          title: 'Option Period Expires',
          isRequired: true,
          requiresDocument: false,
          daysFromContract: 7,
          isMilestone: true,
        },
      ],
    },
    {
      name: 'Financing',
      phase: 'under-contract',
      items: [
        {
          title: 'Loan Application Submitted',
          isRequired: true,
          requiresDocument: true,
          documentType: 'financing',
          daysFromContract: 3,
        },
        {
          title: 'Appraisal Ordered',
          isRequired: true,
          requiresDocument: false,
          daysFromContract: 5,
        },
        {
          title: 'Appraisal Completed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'appraisal',
          daysFromContract: 14,
        },
        {
          title: 'Loan Approval Received',
          isRequired: true,
          requiresDocument: true,
          documentType: 'financing',
          daysFromContract: 21,
          isMilestone: true,
        },
        {
          title: 'Final Loan Approval (Clear to Close)',
          isRequired: true,
          requiresDocument: true,
          documentType: 'financing',
          daysFromContract: 25,
          isMilestone: true,
        },
      ],
    },
    {
      name: 'Title & Survey',
      phase: 'under-contract',
      items: [
        {
          title: 'Title Commitment Received',
          isRequired: true,
          requiresDocument: true,
          documentType: 'title',
          daysFromContract: 10,
        },
        {
          title: 'Title Objections (if any)',
          isRequired: false,
          requiresDocument: true,
          documentType: 'title',
          daysFromContract: 15,
        },
        {
          title: 'Survey Ordered',
          isRequired: false,
          requiresDocument: false,
          daysFromContract: 5,
        },
        {
          title: 'Survey Received',
          isRequired: false,
          requiresDocument: true,
          documentType: 'survey',
          daysFromContract: 18,
        },
      ],
    },
    {
      name: 'Insurance',
      phase: 'under-contract',
      items: [
        {
          title: 'Homeowners Insurance Quote',
          isRequired: true,
          requiresDocument: true,
          documentType: 'insurance',
        },
        {
          title: 'Insurance Binder Obtained',
          isRequired: true,
          requiresDocument: true,
          documentType: 'insurance',
          daysFromContract: 25,
        },
        {
          title: 'Flood Insurance (if required)',
          isRequired: false,
          requiresDocument: true,
          documentType: 'insurance',
        },
      ],
    },
    {
      name: 'Closing',
      phase: 'closing',
      items: [
        {
          title: 'Closing Disclosure Received',
          isRequired: true,
          requiresDocument: true,
          documentType: 'closing',
          daysFromContract: 27,
        },
        {
          title: 'Final Walkthrough Completed',
          isRequired: true,
          requiresDocument: false,
          daysFromContract: 29,
        },
        {
          title: 'Wire Transfer Instructions Confirmed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'closing',
        },
        {
          title: 'Funds Wired',
          isRequired: true,
          requiresDocument: true,
          documentType: 'closing',
        },
        {
          title: 'Closing Documents Signed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'closing',
          daysFromContract: 30,
          isMilestone: true,
        },
      ],
    },
    {
      name: 'Post-Closing',
      phase: 'post-closing',
      items: [
        {
          title: 'Keys Received',
          isRequired: true,
          requiresDocument: false,
          daysFromContract: 30,
          isMilestone: true,
        },
        {
          title: 'Recording Confirmed',
          isRequired: true,
          requiresDocument: false,
          daysFromContract: 32,
        },
        {
          title: 'Utility Transfers Complete',
          isRequired: false,
          requiresDocument: false,
        },
        {
          title: 'Client Follow-up Completed',
          isRequired: false,
          requiresDocument: false,
        },
      ],
    },
  ],
};

/**
 * Texas Seller Transaction Checklist
 */
export const TEXAS_SELLER_CHECKLIST = {
  name: 'Texas Seller Transaction Checklist',
  checklistType: 'seller',
  businessType: 'real_estate',
  sections: [
    {
      name: 'Pre-Listing',
      phase: 'pre-contract',
      items: [
        {
          title: 'Listing Agreement Signed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'agreement',
        },
        {
          title: 'Property Disclosure Completed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'disclosure',
        },
        {
          title: 'Lead-Based Paint Disclosure (if pre-1978)',
          isRequired: false,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'disclosure',
        },
        {
          title: 'HOA Documents Obtained',
          isRequired: false,
          requiresDocument: true,
          documentType: 'hoa',
        },
        {
          title: 'Professional Photos Scheduled',
          isRequired: false,
          requiresDocument: false,
        },
        {
          title: 'Listing Live on MLS',
          isRequired: true,
          requiresDocument: false,
        },
      ],
    },
    {
      name: 'Contract Phase',
      phase: 'under-contract',
      items: [
        {
          title: 'Offer Received & Reviewed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'contract',
        },
        {
          title: 'Counter Offer (if applicable)',
          isRequired: false,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'contract',
        },
        {
          title: 'Contract Executed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'contract',
          isMilestone: true,
        },
        {
          title: 'Earnest Money Receipt Confirmed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'receipt',
          daysFromContract: 3,
        },
        {
          title: 'Option Fee Receipt Confirmed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'receipt',
        },
      ],
    },
    {
      name: 'Inspection & Repairs',
      phase: 'under-contract',
      items: [
        {
          title: 'Buyer Inspection Scheduled',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Inspection Completed',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Repair Request Received',
          isRequired: false,
          requiresDocument: true,
          documentType: 'addendum',
        },
        {
          title: 'Repair Response Sent',
          isRequired: false,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'addendum',
        },
        {
          title: 'Repairs Completed',
          isRequired: false,
          requiresDocument: true,
          documentType: 'receipt',
        },
        {
          title: 'Option Period Ends',
          isRequired: true,
          requiresDocument: false,
          isMilestone: true,
        },
      ],
    },
    {
      name: 'Title & Closing Prep',
      phase: 'under-contract',
      items: [
        {
          title: 'Title Company Information Provided',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Payoff Statement Ordered',
          isRequired: true,
          requiresDocument: true,
          documentType: 'title',
        },
        {
          title: 'Survey Provided (if available)',
          isRequired: false,
          requiresDocument: true,
          documentType: 'survey',
        },
        {
          title: 'HOA Transfer Docs Ordered',
          isRequired: false,
          requiresDocument: true,
          documentType: 'hoa',
        },
      ],
    },
    {
      name: 'Closing',
      phase: 'closing',
      items: [
        {
          title: 'Closing Statement Reviewed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'closing',
        },
        {
          title: 'Final Walkthrough Scheduled',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Property Ready for Walkthrough',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Closing Documents Signed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'closing',
          isMilestone: true,
        },
        {
          title: 'Keys/Remotes Ready for Handover',
          isRequired: true,
          requiresDocument: false,
        },
      ],
    },
    {
      name: 'Post-Closing',
      phase: 'post-closing',
      items: [
        {
          title: 'Funds Received',
          isRequired: true,
          requiresDocument: false,
          isMilestone: true,
        },
        {
          title: 'Commission Disbursed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'closing',
        },
        {
          title: 'Listing Marked as Sold',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Client Follow-up Completed',
          isRequired: false,
          requiresDocument: false,
        },
      ],
    },
  ],
};

// ==================== MORTGAGE CHECKLISTS ====================

/**
 * Mortgage Loan Processing Checklist
 */
export const MORTGAGE_LOAN_CHECKLIST = {
  name: 'Mortgage Loan Processing Checklist',
  checklistType: 'mortgage',
  businessType: 'mortgage',
  sections: [
    {
      name: 'Application',
      phase: 'application',
      items: [
        {
          title: 'Loan Application (1003) Completed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'application',
        },
        {
          title: 'Borrower Authorization Signed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'authorization',
        },
        {
          title: 'Loan Estimate Provided',
          isRequired: true,
          requiresDocument: true,
          documentType: 'disclosure',
          isComplianceItem: true,
        },
        {
          title: 'Intent to Proceed Received',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'disclosure',
        },
      ],
    },
    {
      name: 'Income Documentation',
      phase: 'processing',
      items: [
        {
          title: 'Pay Stubs (30 days)',
          isRequired: true,
          requiresDocument: true,
          documentType: 'income',
        },
        {
          title: 'W-2s (2 years)',
          isRequired: true,
          requiresDocument: true,
          documentType: 'income',
        },
        {
          title: 'Tax Returns (2 years)',
          isRequired: true,
          requiresDocument: true,
          documentType: 'income',
        },
        {
          title: 'Employment Verification',
          isRequired: true,
          requiresDocument: true,
          documentType: 'income',
        },
        {
          title: 'Self-Employment Docs (if applicable)',
          isRequired: false,
          requiresDocument: true,
          documentType: 'income',
        },
      ],
    },
    {
      name: 'Asset Documentation',
      phase: 'processing',
      items: [
        {
          title: 'Bank Statements (2 months)',
          isRequired: true,
          requiresDocument: true,
          documentType: 'asset',
        },
        {
          title: 'Retirement Account Statements',
          isRequired: false,
          requiresDocument: true,
          documentType: 'asset',
        },
        {
          title: 'Gift Letter (if applicable)',
          isRequired: false,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'asset',
        },
        {
          title: 'Source of Down Payment Verified',
          isRequired: true,
          requiresDocument: true,
          documentType: 'asset',
        },
      ],
    },
    {
      name: 'Credit & Liabilities',
      phase: 'processing',
      items: [
        {
          title: 'Credit Report Pulled',
          isRequired: true,
          requiresDocument: true,
          documentType: 'credit',
        },
        {
          title: 'Credit Explanation Letters',
          isRequired: false,
          requiresDocument: true,
          documentType: 'credit',
        },
        {
          title: 'Debt Payoff Letters',
          isRequired: false,
          requiresDocument: true,
          documentType: 'credit',
        },
      ],
    },
    {
      name: 'Property & Appraisal',
      phase: 'processing',
      items: [
        {
          title: 'Purchase Contract Received',
          isRequired: true,
          requiresDocument: true,
          documentType: 'contract',
        },
        {
          title: 'Appraisal Ordered',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Appraisal Completed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'appraisal',
          isMilestone: true,
        },
        {
          title: 'Appraisal Review Completed',
          isRequired: true,
          requiresDocument: false,
        },
      ],
    },
    {
      name: 'Title & Insurance',
      phase: 'processing',
      items: [
        {
          title: 'Title Commitment Received',
          isRequired: true,
          requiresDocument: true,
          documentType: 'title',
        },
        {
          title: 'Title Issues Cleared',
          isRequired: false,
          requiresDocument: false,
        },
        {
          title: 'Homeowners Insurance Binder',
          isRequired: true,
          requiresDocument: true,
          documentType: 'insurance',
        },
        {
          title: 'Flood Certification',
          isRequired: true,
          requiresDocument: true,
          documentType: 'insurance',
        },
      ],
    },
    {
      name: 'Underwriting',
      phase: 'underwriting',
      items: [
        {
          title: 'File Submitted to Underwriting',
          isRequired: true,
          requiresDocument: false,
          isMilestone: true,
        },
        {
          title: 'Initial Approval/Conditions',
          isRequired: true,
          requiresDocument: true,
          documentType: 'approval',
        },
        {
          title: 'All Conditions Cleared',
          isRequired: true,
          requiresDocument: false,
          isMilestone: true,
        },
        {
          title: 'Final Underwriting Approval',
          isRequired: true,
          requiresDocument: true,
          documentType: 'approval',
          isMilestone: true,
        },
      ],
    },
    {
      name: 'Closing',
      phase: 'closing',
      items: [
        {
          title: 'Clear to Close',
          isRequired: true,
          requiresDocument: true,
          documentType: 'approval',
          isMilestone: true,
        },
        {
          title: 'Closing Disclosure Sent',
          isRequired: true,
          requiresDocument: true,
          documentType: 'disclosure',
          isComplianceItem: true,
        },
        {
          title: 'Closing Scheduled',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Closing Docs to Title',
          isRequired: true,
          requiresDocument: true,
          documentType: 'closing',
        },
        {
          title: 'Loan Funded',
          isRequired: true,
          requiresDocument: true,
          documentType: 'closing',
          isMilestone: true,
        },
      ],
    },
  ],
};

// ==================== PROPERTY MANAGEMENT CHECKLISTS ====================

/**
 * Tenant Move-In Checklist
 */
export const TENANT_MOVE_IN_CHECKLIST = {
  name: 'Tenant Move-In Checklist',
  checklistType: 'move_in',
  businessType: 'property_management',
  sections: [
    {
      name: 'Application & Screening',
      phase: 'application',
      items: [
        {
          title: 'Rental Application Received',
          isRequired: true,
          requiresDocument: true,
          documentType: 'application',
        },
        {
          title: 'Application Fee Collected',
          isRequired: true,
          requiresDocument: true,
          documentType: 'receipt',
        },
        {
          title: 'Credit Check Completed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'credit',
        },
        {
          title: 'Background Check Completed',
          isRequired: true,
          requiresDocument: true,
          documentType: 'background',
        },
        {
          title: 'Income Verification (3x rent)',
          isRequired: true,
          requiresDocument: true,
          documentType: 'income',
        },
        {
          title: 'Landlord References Verified',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Application Approved',
          isRequired: true,
          requiresDocument: false,
          isMilestone: true,
        },
      ],
    },
    {
      name: 'Lease Execution',
      phase: 'lease',
      items: [
        {
          title: 'Lease Agreement Signed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'lease',
          isMilestone: true,
        },
        {
          title: 'Pet Addendum (if applicable)',
          isRequired: false,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'addendum',
        },
        {
          title: 'Lead-Based Paint Disclosure',
          isRequired: false,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'disclosure',
          isComplianceItem: true,
        },
        {
          title: 'Rules & Regulations Signed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'disclosure',
        },
      ],
    },
    {
      name: 'Deposits & Payments',
      phase: 'payment',
      items: [
        {
          title: 'Security Deposit Collected',
          isRequired: true,
          requiresDocument: true,
          documentType: 'receipt',
        },
        {
          title: 'First Month Rent Collected',
          isRequired: true,
          requiresDocument: true,
          documentType: 'receipt',
        },
        {
          title: 'Pet Deposit Collected (if applicable)',
          isRequired: false,
          requiresDocument: true,
          documentType: 'receipt',
        },
        {
          title: 'Payment Method Set Up',
          isRequired: true,
          requiresDocument: false,
        },
      ],
    },
    {
      name: 'Move-In Preparation',
      phase: 'move_in',
      items: [
        {
          title: 'Unit Cleaned & Ready',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Move-In Inspection Scheduled',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Move-In Inspection Completed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'inspection',
        },
        {
          title: 'Keys/Access Provided',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'receipt',
          isMilestone: true,
        },
        {
          title: 'Utility Transfer Instructions Given',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Welcome Packet Provided',
          isRequired: false,
          requiresDocument: false,
        },
      ],
    },
  ],
};

// ==================== INSURANCE CHECKLIST ====================

/**
 * Insurance Policy Application Checklist
 */
export const INSURANCE_POLICY_CHECKLIST = {
  name: 'Insurance Policy Checklist',
  checklistType: 'insurance',
  businessType: 'insurance',
  sections: [
    {
      name: 'Application',
      phase: 'application',
      items: [
        {
          title: 'Insurance Application Completed',
          isRequired: true,
          requiresDocument: true,
          requiresSignature: true,
          documentType: 'application',
        },
        {
          title: 'Property Information Gathered',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Prior Insurance History',
          isRequired: true,
          requiresDocument: true,
          documentType: 'disclosure',
        },
        {
          title: 'Claims History Reviewed',
          isRequired: true,
          requiresDocument: false,
        },
      ],
    },
    {
      name: 'Quotes & Approval',
      phase: 'processing',
      items: [
        {
          title: 'Coverage Options Presented',
          isRequired: true,
          requiresDocument: true,
          documentType: 'quote',
        },
        {
          title: 'Quote Approved by Client',
          isRequired: true,
          requiresDocument: false,
          isMilestone: true,
        },
        {
          title: 'Underwriting Submitted',
          isRequired: true,
          requiresDocument: false,
        },
        {
          title: 'Policy Approved',
          isRequired: true,
          requiresDocument: true,
          documentType: 'approval',
          isMilestone: true,
        },
      ],
    },
    {
      name: 'Policy Issuance',
      phase: 'closing',
      items: [
        {
          title: 'Premium Payment Collected',
          isRequired: true,
          requiresDocument: true,
          documentType: 'receipt',
        },
        {
          title: 'Policy Documents Issued',
          isRequired: true,
          requiresDocument: true,
          documentType: 'policy',
          isMilestone: true,
        },
        {
          title: 'Declarations Page Sent',
          isRequired: true,
          requiresDocument: true,
          documentType: 'policy',
        },
        {
          title: 'Binder Sent to Lender (if required)',
          isRequired: false,
          requiresDocument: true,
          documentType: 'binder',
        },
        {
          title: 'Client Welcome Package Sent',
          isRequired: false,
          requiresDocument: false,
        },
      ],
    },
  ],
};

/**
 * Export all checklists
 */
export const DEFAULT_CHECKLISTS = {
  real_estate: {
    buyer: TEXAS_BUYER_CHECKLIST,
    seller: TEXAS_SELLER_CHECKLIST,
  },
  mortgage: {
    loan: MORTGAGE_LOAN_CHECKLIST,
  },
  property_management: {
    move_in: TENANT_MOVE_IN_CHECKLIST,
  },
  insurance: {
    policy: INSURANCE_POLICY_CHECKLIST,
  },
};
