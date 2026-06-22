const RULES_KEY = 'skyline_visa_rules';

export function loadVisaRules() {
  try {
    return JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveVisaRules(rules) {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function upsertVisaRule(rule) {
  const rules = loadVisaRules();
  const idx = rules.findIndex(
    (r) => r.passport_country === rule.passport_country && r.destination_country === rule.destination_country
  );
  const next = { ...rule, id: rule.id || crypto.randomUUID() };
  if (idx >= 0) rules[idx] = next;
  else rules.push(next);
  saveVisaRules(rules);
  return next;
}

export function deleteVisaRule(id) {
  saveVisaRules(loadVisaRules().filter((r) => r.id !== id));
}
