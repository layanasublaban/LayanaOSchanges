import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/AppShell';
import { Button, Card, Eyebrow, Toggle } from '../components/ui';

export default function Settings() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ calendar: true, digest: true, passkey: false });

  const rows: { key: keyof typeof prefs; label: string; hint: string }[] = [
    { key: 'calendar', label: 'Sync Google Calendar', hint: 'Two-way sync with your primary calendar' },
    { key: 'digest', label: 'Morning digest', hint: 'A short plan for the day at 7:00 AM' },
    { key: 'passkey', label: 'Passkey sign-in', hint: 'Use Face ID or your device instead of a password' },
  ];

  return (
    <>
      <PageHeader eyebrow="Manage" title="Settings" />
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-7">
        <Card className="flex flex-col gap-2">
          <Eyebrow>Preferences</Eyebrow>
          <div className="divide-y divide-line-subtle">
            {rows.map((r) => (
              <div key={r.key} className="flex items-center justify-between gap-3 py-3">
                <div className="flex flex-col">
                  <span className="text-sm text-ink">{r.label}</span>
                  <span className="text-xs text-ink-2">{r.hint}</span>
                </div>
                <Toggle
                  label={r.label}
                  checked={prefs[r.key]}
                  onChange={(v) => setPrefs((p) => ({ ...p, [r.key]: v }))}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
