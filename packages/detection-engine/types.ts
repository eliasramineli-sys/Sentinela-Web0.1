export type Risk = 'low' | 'attention' | 'high';
export type Severity = 'info' | 'warning' | 'danger';
export interface Indicator { code: string; severity: Severity; title: string; explanation: string }
export interface Brand { id: string; name: string; domains: readonly string[]; tokens: readonly string[]; officialUrl: string }
export interface Analysis {
  version: '0.1.0'; status: Risk; supported: boolean; analyzedAt: string;
  hostname: string | null; unicodeHostname: string | null;
  registrableDomain: string | null; publicSuffix: string | null; subdomain: string | null;
  protocol: string | null; privateSuffix: boolean;
  indicators: Indicator[]; officialBrand: string | null;
  relatedBrands: { name: string; officialUrl: string }[];
  checks: string[]; limitations: string[];
}
