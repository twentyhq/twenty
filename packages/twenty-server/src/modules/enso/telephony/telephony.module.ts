import { Module } from '@nestjs/common';

import { EnsoInboundRawEventService } from 'src/modules/enso/inbound-raw-event/services/enso-inbound-raw-event.service';
import { TelephonyController } from 'src/modules/enso/telephony/controllers/telephony.controller';
import { CallIdentityService } from 'src/modules/enso/telephony/services/call-identity.service';
import { PbxNumberService } from 'src/modules/enso/telephony/services/pbx-number.service';
import { TelephonyContactService } from 'src/modules/enso/telephony/services/telephony-contact.service';

// SERVER side of telephony intake: the public webhook receivers for the Moldcell
// PBX and Roistat. Imported by modules.module.ts only. The controller
// validates the shared secret, writes the raw payload down, normalizes and
// enqueues.
//
// The `contact` branch is the exception and must stay that way: it answers the
// PBX with a routing decision while the phone is ringing, so its raw-log write
// is deliberately NOT awaited. Everything else is a fire-and-forget ack from
// the PBX's side, so those are logged synchronously. The worker side
// (the ingest job) lives in TelephonyJobsModule, loaded by JobsModule; the
// worker boots QueueWorkerModule and does not import this graph.
@Module({
  controllers: [TelephonyController],
  // The contact responder runs on the server, not the worker: it answers the PBX
  // inline while the phone rings. GlobalWorkspaceOrmManager comes from a @Global
  // module, so no import is needed for ORM access.
  //
  // Click-to-call is NOT here — a GraphQL resolver in this graph never reaches
  // the metadata schema. See TelephonyOutboundModule.
  providers: [
    TelephonyContactService,
    CallIdentityService,
    PbxNumberService,
    EnsoInboundRawEventService,
  ],
})
export class TelephonyModule {}
