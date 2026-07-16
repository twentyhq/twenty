import { Module } from '@nestjs/common';

import { FirewallRegistryService } from 'src/modules/executive-search/firewall/firewall-registry.service';
import { AiContextFirewallService } from 'src/modules/executive-search/firewall/enforcement/ai-context-firewall.service';
import { AutomationFirewallService } from 'src/modules/executive-search/firewall/enforcement/automation-firewall.service';
import { ReportLeakageScannerService } from 'src/modules/executive-search/firewall/enforcement/report-leakage-scanner.service';
import { SearchContextFirewallService } from 'src/modules/executive-search/firewall/enforcement/search-context-firewall.service';

@Module({
  providers: [
    FirewallRegistryService,
    SearchContextFirewallService,
    AiContextFirewallService,
    ReportLeakageScannerService,
    AutomationFirewallService,
  ],
  exports: [
    FirewallRegistryService,
    SearchContextFirewallService,
    AiContextFirewallService,
    ReportLeakageScannerService,
    AutomationFirewallService,
  ],
})
export class FirewallModule {}
