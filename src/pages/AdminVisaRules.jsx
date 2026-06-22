// @ts-nocheck
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { loadVisaRules, upsertVisaRule, deleteVisaRule } from '@/lib/visaRulesStorage';
import { COUNTRIES } from '@/components/travel/PassportSelector';

const STATUS_OPTIONS = ['visa_free', 'evisa', 'visa_on_arrival', 'visa_required'];

export default function AdminVisaRules() {
  const [rules, setRules] = useState(() => loadVisaRules());
  const [form, setForm] = useState({
    passport_country: '',
    destination_country: '',
    status: 'visa_required',
    max_stay_days: '',
    notes: '',
  });

  const refresh = () => setRules(loadVisaRules());

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.passport_country || !form.destination_country) {
      toast.error('Passport and destination countries are required.');
      return;
    }
    upsertVisaRule({
      ...form,
      max_stay_days: form.max_stay_days ? parseInt(form.max_stay_days, 10) : null,
    });
    refresh();
    setForm({ passport_country: '', destination_country: '', status: 'visa_required', max_stay_days: '', notes: '' });
    toast.success('Rule saved');
  };

  const handleDelete = (id) => {
    deleteVisaRule(id);
    refresh();
    toast.success('Rule deleted');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 pb-12">
      <div className="border-b border-border dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to={createPageUrl('Settings')}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-500" />
              Visa Rules Admin
            </h1>
            <p className="text-xs text-slate-500">Manage transit and destination visa rules</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Add / edit rule</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Passport country</Label>
                  <Select value={form.passport_country} onValueChange={(v) => setForm({ ...form, passport_country: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Destination country</Label>
                  <Select value={form.destination_country} onValueChange={(v) => setForm({ ...form, destination_country: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Max stay (days)</Label>
                  <Input type="number" value={form.max_stay_days} onChange={(e) => setForm({ ...form, max_stay_days: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional admin notes" />
              </div>
              <Button type="submit" className="gap-2 bg-sky-500 hover:bg-sky-600">
                <Plus className="w-4 h-4" />
                Save rule
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Rules ({rules.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {rules.length === 0 ? (
              <p className="text-sm text-slate-500">No custom rules yet. Rules sync to Supabase when deployed with backend configured.</p>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                  <div>
                    <span className="font-medium">{rule.passport_country}</span>
                    <span className="text-slate-400 mx-2">→</span>
                    <span className="font-medium">{rule.destination_country}</span>
                    <span className="ml-2 text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{rule.status}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
