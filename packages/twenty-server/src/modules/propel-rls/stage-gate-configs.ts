import { type LaneGateConfig } from 'src/modules/propel-rls/stage-gate.util';

// AUTO-DERIVED from the propel-crm §8.3 stage-entry emitters' NEXT_TASK_BY_STAGE
// maps (titles MUST match for the gate to find the current stage's task). If you
// change an emitter title, regenerate this. Keyed by object metadata name.
export const STAGE_GATE_CONFIGS: Record<string, { stageField: string; cfg: LaneGateConfig }> = {
  "secondaryOpportunity": {
    "stageField": "stage",
    "cfg": {
      "orderedStages": [
        "QUALIFY",
        "MATCH_VIEW",
        "OFFER",
        "AGREED"
      ],
      "terminalStages": [
        "PARKED",
        "LOST"
      ],
      "taskTargetField": "targetSecondaryOpportunityId",
      "stageTaskTitleByStage": {
        "QUALIFY": "Qualify the lead — pin budget, intent, timeline",
        "MATCH_VIEW": "Shortlist 3–5 permitted units and book viewings",
        "OFFER": "Submit a comp-backed offer and manage counters",
        "AGREED": "Verify funds/KYC and sign MOU — then convert to Deal",
        "PARKED": "Schedule the next nurture touch"
      }
    }
  },
  "sellOpportunity": {
    "stageField": "stage",
    "cfg": {
      "orderedStages": [
        "QUALIFY",
        "PITCH_PRICE",
        "MANDATE",
        "MARKET_LIVE",
        "OFFER_DECISION"
      ],
      "terminalStages": [
        "PARKED",
        "LOST"
      ],
      "taskTargetField": "targetSellOpportunityId",
      "stageTaskTitleByStage": {
        "QUALIFY": "Confirm owner is real, motivated, sellable — set timeline",
        "PITCH_PRICE": "Prepare and present the CMA; win the right to list",
        "MANDATE": "Capture a signed compliant mandate; get T3 approval",
        "MARKET_LIVE": "Create the listing and get the asset in front of buyers",
        "OFFER_DECISION": "Walk the owner to yes on price + terms",
        "PARKED": "Schedule the next owner nurture touch"
      }
    }
  },
  "offPlanOpportunity": {
    "stageField": "stage",
    "cfg": {
      "orderedStages": [
        "QUALIFY",
        "EOI",
        "BOOKING",
        "SPA_DOWNPAYMENT",
        "OQOOD",
        "PAYMENT_PLAN",
        "HANDOVER"
      ],
      "terminalStages": [
        "LOST"
      ],
      "taskTargetField": "targetOffPlanOpportunityId",
      "stageTaskTitleByStage": {
        "QUALIFY": "Qualify end-use vs invest + payment-plan appetite; match a project",
        "EOI": "Collect EOI + refundable deposit; register in developer queue",
        "BOOKING": "Win the unit at launch; convert EOI to a signed booking",
        "SPA_DOWNPAYMENT": "Get SPA executed and confirm funds hit RERA escrow",
        "OQOOD": "Register the sale on Oqood; raise the developer commission claim",
        "PAYMENT_PLAN": "Set up milestone reminders and relay construction updates",
        "HANDOVER": "Coordinate snagging and final transfer to title deed"
      }
    }
  },
  "institutionalOpportunity": {
    "stageField": "stage",
    "cfg": {
      "orderedStages": [
        "QUALIFY_MANDATE",
        "THESIS_SOURCE",
        "LOI",
        "DUE_DILIGENCE",
        "IC_APPROVAL",
        "STRUCTURING_SPA",
        "CLOSE_TRANSFER"
      ],
      "terminalStages": [
        "PASSED"
      ],
      "taskTargetField": "targetInstitutionalOpportunityId",
      "stageTaskTitleByStage": {
        "QUALIFY_MANDATE": "Qualify ticket + mandate + decision structure; get NDA signed",
        "THESIS_SOURCE": "Translate the mandate into a data-backed shortlist; deliver teaser/IM",
        "LOI": "Secure a defensible LOI with exclusivity",
        "DUE_DILIGENCE": "Run a clean sequenced DD; keep the deal alive through findings",
        "IC_APPROVAL": "Package the IC memo and shepherd approval",
        "STRUCTURING_SPA": "Lock binding terms + the right ownership vehicle; sign SPA",
        "CLOSE_TRANSFER": "Drive to DLD transfer/registration"
      }
    }
  },
  "rcbiOpportunity": {
    "stageField": "stage",
    "cfg": {
      "orderedStages": [
        "NEW_LEAD",
        "CONTACTED",
        "QUALIFIED",
        "PARTNER_ENGAGEMENT",
        "CONVERSION_REVENUE"
      ],
      "terminalStages": [
        "ON_HOLD",
        "LOST"
      ],
      "taskTargetField": "targetRcbiOpportunityId",
      "stageTaskTitleByStage": {
        "NEW_LEAD": "Start first outreach to the RCBI lead",
        "CONTACTED": "Run the qualification call (budget, nationality, family, objective)",
        "QUALIFIED": "Select the partner company for this profile",
        "PARTNER_ENGAGEMENT": "Run the partner intro + joint call; coordinate the programme",
        "CONVERSION_REVENUE": "Track engagement, revenue and payout fields as the case progresses",
        "ON_HOLD": "Review this on-hold RCBI case at the set review date"
      }
    }
  },
  "listing": {
    "stageField": "status",
    "cfg": {
      "orderedStages": [
        "DRAFT",
        "AWAITING_PUBLISH",
        "LIVE",
        "UNDER_OFFER"
      ],
      "terminalStages": [
        "CLOSED"
      ],
      "taskTargetField": "targetListingId",
      "stageTaskTitleByStage": {
        "DRAFT": "Compose copy/price/photos (>=6) and submit for QA",
        "AWAITING_PUBLISH": "Submit to DET and capture the Trakheesi permit",
        "LIVE": "Serve on portals; watch permit expiry and sync health",
        "UNDER_OFFER": "Freeze + take down from portals; hold the record",
        "CLOSED": "Issue per-portal deletes and clear externalRef"
      }
    }
  },
  "deal": {
    "stageField": "stage",
    "cfg": {
      "orderedStages": [
        "AGREED",
        "SECURED",
        "CLEARANCE",
        "TRANSFER",
        "REGISTERED",
        "COMMISSION_SETTLED",
        "CLOSED"
      ],
      "terminalStages": [
        "COLLAPSED"
      ],
      "taskTargetField": "targetDealId",
      "stageTaskTitleByStage": {
        "AGREED": "Capture price/commission/parties; seed split rows; freeze listing",
        "SECURED": "Collect deposit; confirm Form F signed; KYC both sides",
        "CLEARANCE": "Drive NOCs + finance clearance; confirm funds",
        "TRANSFER": "Book the Trustee appointment; assemble the pack; compute DLD 4%",
        "REGISTERED": "Upload the DLD receipt/title deed; release commission rows",
        "COMMISSION_SETTLED": "Reconcile the invoice; track inbound; settle A2A",
        "CLOSED": "Fire the Post-Build handover packet; archive the deal file"
      }
    }
  }
};
