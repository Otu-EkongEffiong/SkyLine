// Travel data constants and helper functions for SkyPath
// Kept separate from AccessibilityMap.jsx so Vite Fast Refresh works correctly
// (React components and plain data exports must not share the same file)

export const VISA_REQUIREMENTS = {

  // ── TIER 1 — STRONGEST (Schengen + CANZUK + JP/KR/SG) ───────────────────
  'JP': ['CN','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT','CU'],
  'SG': ['CN','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','HT'],
  'KR': ['CN','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','HT','CU'],
  'DE': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'FR': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'GB': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','HT'],
  'US': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','CU'],
  'CA': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','CU'],
  'AU': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS'],
  'NZ': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS'],
  'IT': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'ES': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','HT'],
  'NL': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','HT'],
  'SE': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'NO': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'DK': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'FI': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'CH': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'AT': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'BE': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','ER','HT'],
  'PT': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','HT'],
  'IE': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','HT'],
  'LU': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','HT'],
  'IS': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','SO','HT'],

  // ── TIER 2 — STRONG ───────────────────────────────────────────────────────
  'CZ': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS'],
  'PL': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS'],
  'HU': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS'],
  'SK': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS'],
  'SI': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS'],
  'HR': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD','SS'],
  'GR': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'RO': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'BG': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'EE': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'LV': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'LT': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'CY': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'MT': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'AE': ['IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP','LY','SS','ER','SO'],
  'QA': ['IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP','LY','SS'],
  'SA': ['IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP','LY','SS','ER','CN','RU'],
  'KW': ['IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP','LY','SS'],
  'BH': ['IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP','LY','SS'],
  'OM': ['IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP','LY','SS'],
  'HK': ['CN','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'TW': ['CN','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP'],
  'MY': ['CN','RU','IN','PK','BD','NG','EG','IR','IQ','SY','AF','YE','KP','LY','SD'],
  'BN': ['CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP'],
  'IL': ['IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP','LY','SD','SS','ER','SO'],

  // ── CARIBBEAN ─────────────────────────────────────────────────────────────
  // Strong island passports (Antigua, Barbados, Bahamas, St Lucia, etc.)
  'AG': ['AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'BB': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'BS': ['AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'DM': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'GD': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'KN': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'LC': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'VC': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'TT': ['AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  // Medium
  'JM': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE','IE','AT','CZ','PL','HU','SK','SI','HR','GR','RO','BG','EE','LV','LT','CY','MT','TR','AE','QA','BR','MX','AR','CL','CO','PE','EC','PA','CR','VE','GD','AG','DM','KN','LC','VC','BS','TT','GY','SR','NZ','ZA','MA','TN','IL','KH','TH','ID'],
  'BZ': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'GY': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'SR': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  // Weak
  'DO': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'CU': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'HT': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE','ZA','AE','QA','SA','MY','TH','BR','MX'],

  // ── LATIN AMERICA ─────────────────────────────────────────────────────────
  'MX': ['CA','AU','CN','IN','RU','NG','PK','BD','IR','IQ','AF','YE','KP'],
  'BR': ['US','CA','AU','CN','IN','RU','NG','PK','BD','IR','IQ','AF','YE','KP'],
  'AR': ['US','CA','AU','CN','RU','NG','PK','BD','IR','IQ','AF','YE','KP'],
  'CL': ['CN','IN','RU','NG','PK','BD','IR','IQ','AF','YE','KP'],
  'UY': ['CN','IN','RU','NG','PK','BD','IR','IQ','AF','YE','KP'],
  'CO': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'PE': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'EC': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'BO': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'PY': ['US','CA','AU','GB','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'VE': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'GT': ['US','CA','AU','GB','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'HN': ['US','CA','AU','GB','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'SV': ['US','CA','AU','GB','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'NI': ['US','CA','AU','GB','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'CR': ['CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'PA': ['US','CA','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],

  // ── MEDIUM PASSPORTS ──────────────────────────────────────────────────────
  'RU': ['US','CA','AU','GB','JP','KR','SG','IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP'],
  'CN': ['US','CA','AU','GB','JP','KR','SG','IN','PK','BD','NG','IR','IQ','SY','AF','YE','KP'],
  'TR': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','IN','PK','NG','IR','IQ','SY','AF','YE'],
  'ZA': ['US','CA','AU','GB','JP','KR','SG','CN','RU','NG','PK','BD','IR','IQ','SY','AF','YE'],
  'UA': ['US','CA','AU','GB','JP','KR','SG','CN','NG','PK','BD','IR','IQ','SY','AF','YE'],
  'RS': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'AL': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'BY': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'GE': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'AM': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'AZ': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'TH': ['US','CA','AU','GB','DE','FR','JP','KR','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'ID': ['US','CA','AU','GB','DE','FR','JP','KR','CN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'PH': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'MU': ['IN','PK','BD','NG','IR','IQ','SY','AF','YE','CN','RU'],
  'SC': ['IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'CV': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'FJ': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'RW': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'BW': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'NA': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'TN': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'MA': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA'],
  'KZ': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'UZ': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'JO': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'LB': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'MN': ['US','CA','AU','GB','DE','FR','JP','KR','SG','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'TZ': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN'],
  'KE': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','MY','IN'],
  'GH': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','MY','TH','IN'],
  'SN': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN'],
  'CI': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],

  // ── WEAK PASSPORTS ────────────────────────────────────────────────────────
  'IN': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','SA','AE','QA','KW','BH','OM','BR','ZA','MY','TH','ID'],
  'VN': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','NZ','CN','RU','BR','ZA','SA','AE','QA'],
  'EG': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','SA','AE','QA'],
  'DZ': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'UG': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'ET': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'CM': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG','NG'],
  'ML': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'BF': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'NE': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'TD': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG','NG'],
  'GN': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'SL': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG','GH'],
  'LR': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG','GH'],
  'GM': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'TG': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'BJ': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'MR': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'GW': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'CD': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG','NG','ZM'],
  'CG': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'CF': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG','NG','CM'],
  'GA': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'GQ': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'AO': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'MZ': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN'],
  'MW': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN'],
  'ZM': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN'],
  'ZW': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','ZM'],
  'MG': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN'],
  'KM': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'BI': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'DJ': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','ZA','IN','EG'],
  'LS': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','IN'],
  'SZ': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','BR','IN'],
  'MV': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'ST': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'PG': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'KG': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'TJ': ['US','CA','AU','GB','JP','KR','SG','CN','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'TM': ['US','CA','AU','GB','JP','KR','SG','CN','RU','IN','PK','BD','NG','IR','IQ','SY','AF','YE'],
  'BT': ['US','CA','AU','GB','DE','FR','JP','KR','SG','CN','RU','SA','AE','QA','MY','TH','IN'],
  'PS': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','IL'],

  // ── VERY WEAK ─────────────────────────────────────────────────────────────
  'PK': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','KW','BH','OM','MY','TH','ID','IN','EG','TR','MA','JO','MX'],
  'BD': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','KW','BH','OM','MY','TH','ID','IN','EG','TR','MA'],
  'NG': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','KW','BH','OM','MY','TH','ID','IN','EG','TR','GH','MA'],
  'LK': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN'],
  'NP': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN'],
  'MM': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','IN'],
  'KH': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','IN'],
  'LA': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','IN'],

  // ── EXTREMELY WEAK ────────────────────────────────────────────────────────
  'AF': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','MX','MA','GH','KE','TZ','NG'],
  'IQ': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','MA','GH','KE','NG'],
  'SY': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','MX','MA','GH','KE','NG'],
  'IR': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','GH','KE','NG'],
  'YE': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','MA','GH','KE','NG'],
  'SS': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','KE','TZ','ET','UG','NG'],
  'SD': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','KE','ET','NG'],
  'SO': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','KE','ET','TZ','NG'],
  'ER': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','KE','ET','NG'],
  'LY': ['US','CA','AU','GB','DE','FR','IT','ES','NL','BE','CH','SE','NO','DK','FI','JP','KR','SG','NZ','CN','RU','BR','ZA','SA','AE','QA','MY','TH','ID','IN','PK','BD','EG','TR','NG'],
};

// ─────────────────────────────────────────────────────────────────────────────
// e-Visa countries (apply online, no embassy required)
// ─────────────────────────────────────────────────────────────────────────────
export const EVISA_COUNTRIES = [
  // Africa
  'KE','EG','TZ','UG','RW','ET','MG','MZ','ZM','ZW','AO','GH','CI','SN','TN','MA',
  'DZ','DJ','BI','GA','CM','CD','CG','ST','GQ','CF','TD','ML','BF','NE','GN','SL',
  'LR','GM','MR','TG','BJ','GW','LY','SD',
  // Middle East
  'SA','AE','BH','OM','JO','LB',
  // Asia
  'TR','IN','PK','BD','LK','NP','MM','KH','VN','ID','TH',
  // Other
  'MV',
];

// Visa on Arrival countries
export const VOA_COUNTRIES = [
  'TH','ID','KH','LK','NP','MM','JO','ET','TZ','KE','UG','MZ','RW','MG','ZM',
  'ZW','GH','SN','CI','MV','TL','FJ','VU','WS','TO','SB','CV','SC','MU','DJ',
  'GA','BJ','TG','BI','KM',
];

// ─────────────────────────────────────────────────────────────────────────────
// AIRPORT → COUNTRY MAP (comprehensive fallback for Amadeus API gaps)
// ─────────────────────────────────────────────────────────────────────────────
export const AIRPORT_COUNTRY_MAP = {
  // Middle East
  'DXB':'AE','AUH':'AE','SHJ':'AE','DOH':'QA','BAH':'BH','KWI':'KW','MCT':'OM',
  'RUH':'SA','JED':'SA','MED':'SA','AMM':'JO','BEY':'LB','BGW':'IQ','TLV':'IL',
  'CAI':'EG','SSH':'EG','HRG':'EG',
  // Africa — North
  'CMN':'MA','RAK':'MA','TUN':'TN','ALG':'DZ','TIP':'LY','KRT':'SD',
  // Africa — West
  'LOS':'NG','ABV':'NG','PHC':'NG','KAN':'NG',
  'ACC':'GH','KMS':'GH',
  'DKR':'SN','ZIG':'SN',
  'ABJ':'CI','BYK':'CI',
  'YAO':'CM','DLA':'CM','NSI':'CM',
  'OUA':'BF',
  'BKO':'ML',
  'NIM':'NE',
  'NDJ':'TD',
  'CKY':'GN',
  'ROB':'LR',
  'FNA':'SL',
  'BJL':'GM',
  'NKC':'MR',
  'OXB':'GW',
  'LFW':'TG',
  'COO':'BJ',
  // Africa — Central
  'FIH':'CD','FKI':'CD',
  'BZV':'CG',
  'BGF':'CF',
  'LBV':'GA',
  'SSG':'GQ',
  'TMS':'ST',
  // Africa — East
  'ADD':'ET','DIR':'ET',
  'NBO':'KE','MBA':'KE',
  'DAR':'TZ','ZNZ':'TZ','JRO':'TZ',
  'EBB':'UG','KLA':'UG',
  'KGL':'RW',
  'BJM':'BI',
  'MGQ':'SO',
  'JUB':'SS',
  'ASM':'ER',
  'JIB':'DJ',
  // Africa — South & Indian Ocean
  'JNB':'ZA','CPT':'ZA','DUR':'ZA','PLZ':'ZA',
  'LUN':'ZM','LVI':'ZM',
  'HRE':'ZW','BUQ':'ZW',
  'GBE':'BW','OKA':'BW',
  'WDH':'NA','KMP':'NA',
  'MPM':'MZ','BEW':'MZ',
  'BLZ':'MW',
  'LAD':'AO','VPE':'AO',
  'MSU':'LS',
  'MTS':'SZ',
  'TNR':'MG','DIE':'MG',
  'MRU':'MU',
  'SEZ':'SC','PRI':'SC',
  'HAH':'KM','AJN':'KM',
  // Caribbean
  'KIN':'JM','MBJ':'JM',
  'POS':'TT','TAB':'TT',
  'BGI':'BB',
  'NAS':'BS','FPO':'BS',
  'ANU':'AG',
  'UVF':'LC','SLU':'LC',
  'SVD':'VC',
  'GND':'GD',
  'DOM':'DM',
  'SKB':'KN','NEV':'KN',
  'PAP':'HT','CAP':'HT',
  'SDQ':'DO','STI':'DO','PUJ':'DO',
  'HAV':'CU','VRA':'CU',
  'BZE':'BZ',
  'GEO':'GY',
  'PBM':'SR',
  // Central America
  'GUA':'GT','FRS':'GT',
  'SAP':'HN','TGU':'HN',
  'SAL':'SV',
  'MGA':'NI',
  'SJO':'CR','LIR':'CR',
  'PTY':'PA','DAV':'PA',
  // South America
  'GRU':'BR','GIG':'BR','BSB':'BR','SSA':'BR','REC':'BR','FOR':'BR','MAO':'BR',
  'EZE':'AR','AEP':'AR','COR':'AR','MDZ':'AR',
  'SCL':'CL','PMC':'CL','IQQ':'CL',
  'BOG':'CO','MDE':'CO','CLO':'CO','CTG':'CO',
  'LIM':'PE','CUZ':'PE',
  'UIO':'EC','GYE':'EC',
  'VVI':'BO','LPB':'BO',
  'ASU':'PY',
  'MVD':'UY',
  'CCS':'VE',
  // Europe
  'LHR':'GB','LGW':'GB','MAN':'GB','STN':'GB','BHX':'GB','EDI':'GB','GLA':'GB',
  'CDG':'FR','ORY':'FR','NCE':'FR','LYS':'FR','MRS':'FR',
  'FRA':'DE','MUC':'DE','DUS':'DE','BER':'DE','HAM':'DE','STR':'DE','CGN':'DE',
  'AMS':'NL','EIN':'NL',
  'BRU':'BE','ANR':'BE',
  'ZUR':'CH','GVA':'CH','BSL':'CH',
  'FCO':'IT','MXP':'IT','VCE':'IT','NAP':'IT','PMO':'IT',
  'MAD':'ES','BCN':'ES','PMI':'ES','AGP':'ES','VLC':'ES','SVQ':'ES',
  'LIS':'PT','OPO':'PT','FAO':'PT',
  'ARN':'SE','GOT':'SE','MMX':'SE',
  'CPH':'DK','AAL':'DK',
  'HEL':'FI','TMP':'FI',
  'OSL':'NO','BGO':'NO','TRD':'NO',
  'VIE':'AT','SZG':'AT','INN':'AT',
  'PRG':'CZ','BRQ':'CZ',
  'BUD':'HU','DEB':'HU',
  'WAW':'PL','KRK':'PL','GDN':'PL','WRO':'PL',
  'OTP':'RO','CLJ':'RO',
  'SOF':'BG','VAR':'BG',
  'ATH':'GR','SKG':'GR','HER':'GR','RHO':'GR',
  'IST':'TR','SAW':'TR','AYT':'TR','ADB':'TR','ESB':'TR',
  'SVO':'RU','DME':'RU','LED':'RU','VKO':'RU',
  'KBP':'UA','LWO':'UA',
  'MSQ':'BY',
  'TBS':'GE','BUS':'GE',
  'EVN':'AM',
  'GYD':'AZ',
  'RIX':'LV','TLL':'EE','VNO':'LT',
  'BEG':'RS','PRN':'XK',
  'TIA':'AL',
  'SKP':'MK',
  'SJJ':'BA','TZL':'BA',
  'TGD':'ME',
  // Asia
  'SIN':'SG',
  'KUL':'MY','PEN':'MY','BKI':'MY',
  'BKK':'TH','DMK':'TH','HKT':'TH','CNX':'TH','USM':'TH',
  'CGK':'ID','DPS':'ID','SUB':'ID','UPG':'ID','KNO':'ID',
  'MNL':'PH','CEB':'PH','KLO':'PH',
  'SGN':'VN','HAN':'VN','DAD':'VN','CXR':'VN',
  'HKG':'HK',
  'PEK':'CN','PVG':'CN','CTU':'CN','CAN':'CN','WUH':'CN','XIY':'CN','KMG':'CN','HAK':'CN',
  'NRT':'JP','HND':'JP','KIX':'JP','CTS':'JP','FUK':'JP',
  'ICN':'KR','GMP':'KR','PUS':'KR',
  'DEL':'IN','BOM':'IN','MAA':'IN','BLR':'IN','HYD':'IN','CCU':'IN','COK':'IN','AMD':'IN','GOI':'IN',
  'CMB':'LK','HRI':'LK',
  'KTM':'NP','PKR':'NP',
  'DAC':'BD','ZYL':'BD','CGP':'BD',
  'KHI':'PK','LHE':'PK','ISB':'PK','KBL':'AF',
  'FRU':'KG','OSS':'KG',
  'TAS':'UZ','SKD':'UZ',
  'ASB':'TM',
  'ALA':'KZ','NQZ':'KZ','TSE':'KZ',
  'DYU':'TJ',
  'ULN':'MN',
  'RGN':'MM','MDL':'MM',
  'PNH':'KH','REP':'KH',
  'VTE':'LA','LPQ':'LA',
  'MLE':'MV','GAN':'MV',
  'DIL':'TL',
  'BWN':'BN',
  // Australasia / Pacific
  'SYD':'AU','MEL':'AU','BNE':'AU','PER':'AU','ADL':'AU','CBR':'AU','CNS':'AU',
  'AKL':'NZ','CHC':'NZ','WLG':'NZ','ZQN':'NZ',
  'SUV':'FJ','NAN':'FJ',
  'POM':'PG','LAE':'PG',
  'HIR':'SB',
  'VLI':'VU',
  'APW':'WS',
  'TBU':'TO',
  'PNI':'FM',
  'ROR':'PW',
  'MAJ':'MH',
  // North America
  'JFK':'US','EWR':'US','ORD':'US','ATL':'US','LAX':'US','MIA':'US','DFW':'US',
  'SFO':'US','IAD':'US','BOS':'US','SEA':'US','DEN':'US','LAS':'US','MCO':'US',
  'PHX':'US','DTW':'US','MSP':'US','CLT':'US','PHL':'US','IAH':'US',
  'YYZ':'CA','YVR':'CA','YUL':'CA','YYC':'CA','YEG':'CA','YOW':'CA',
  'MEX':'MX','GDL':'MX','CUN':'MX','MTY':'MX','TLC':'MX',
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE VISA STATUS FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export function getVisaStatus(passportCode, destinationCode, userVisas = []) {
  if (!passportCode || !destinationCode) return 'unknown';
  if (userVisas.some(v => v.country_code === destinationCode)) return 'has_visa';
  if (passportCode === destinationCode) return 'visa_free';

  const visaRequired = VISA_REQUIREMENTS[passportCode]?.includes(destinationCode);
  if (visaRequired) {
    if (EVISA_COUNTRIES.includes(destinationCode)) return 'evisa';
    if (VOA_COUNTRIES.includes(destinationCode))   return 'visa_on_arrival';
    return 'visa_required';
  }
  return 'visa_free';
}

// Connection difficulty score — lower is easier for weak passport holders
export function getConnectionDifficulty(passportCode, connectionCountryCode, userVisas = []) {
  const status = getVisaStatus(passportCode, connectionCountryCode, userVisas);
  switch (status) {
    case 'has_visa':        return 0;
    case 'visa_free':       return 0;
    case 'visa_on_arrival': return 1;
    case 'evisa':           return 1;
    case 'visa_required':   return 10;
    default:                return 2;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VISA UNLOCK MAP — countries that allow entry to holders of specific visas
// Key = visa country code, Value = array of countries that accept that visa for entry
// ─────────────────────────────────────────────────────────────────────────────
// Schengen member countries — a visa from any of these unlocks the same destinations
const SCHENGEN_UNLOCKS = ['AL','MK','RS','ME','BA','XK','TR','UA','GE','AM','AZ','MD','BY','MX','CO','PE','EC','CL','PA','CR','GT','HN','SV','NI','DO','JM','TT','BB','BS','CV','MA','TN','JO','MV'];
const SCHENGEN_COUNTRIES = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH'];

export const VISA_UNLOCK_MAP = {
  // US visa holders can enter many countries without separate visa
  'US': ['MX','CA','AL','MK','RS','ME','BA','XK','CO','PE','EC','PH','TH','ID','KH','VN','MY','TR','MA','TN','JO','GE','AM','AZ','KZ','UZ','KG','TJ','MN','MV','CV','MU','SC','FJ','WS','TO','VU','SB','BZ','GT','HN','SV','NI','CR','PA','DO','JM','TT','BB','BS','AG','GD','LC','VC','DM','KN'],
  // Schengen — any visa issued by a Schengen country unlocks the same list
  ...Object.fromEntries(SCHENGEN_COUNTRIES.map(c => [c, SCHENGEN_UNLOCKS])),
  'GB': ['AL','MK','RS','ME','BA','XK','TR','UA','GE','AM','AZ','MD','MX','CO','PE','EC','CL','PA','CR','GT','HN','SV','NI','DO','JM','TT','BB','BS','CV','MA','TN','JO','MV'],
  'AU': ['TR','MX','MV','CV','FJ','WS','TO','VU','SB','PG','ID','KH','VN','TH','MY','MN'],
  'CA': ['MX','AL','MK','RS','ME','BA','CO','PE','EC','TT','BB','BS','DO','JM','CV','MV','TH','KH','MY','ID','VN'],
  'JP': ['TR','TH','ID','PH','MY','VN','KH','MN','MV','CV','FJ','MU','SC'],
  'KR': ['TR','TH','ID','PH','MY','VN','KH','MN','MV','CV','FJ'],
  'AE': ['TH','ID','KH','VN','MY','MN','GE','AM','AZ','KZ','UZ','MA','TN','JO','MV','MU','SC'],
};

// ─────────────────────────────────────────────────────────────────────────────
// AccessibilityMap component
// ─────────────────────────────────────────────────────────────────────────────