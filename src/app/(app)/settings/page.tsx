'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { LogOut, Save, Shield, Bell, User, Palette, SlidersHorizontal } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers } from '@/lib/mock-data';
import { MALPRACTICE_WEIGHTS } from '@/lib/proctoring';
import type { ViolationType } from '@/lib/types';
import { VIOLATION_DISPLAY_NAMES } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const adminUser = mockUsers.find(u => u.role === 'admin');

const VIOLATION_DESCRIPTIONS: Partial<Record<ViolationType, string>> = {
  MULTIPLE_PEOPLE: 'Someone else visible in frame',
  PHONE_DETECTED: 'Mobile device visible',
  NO_FACE_DETECTED: 'Student not in frame',
  GAZE_AWAY: 'Student looking away from screen',
  TAB_SWITCH: 'Browser tab changed',
  FULLSCREEN_EXIT: 'Exited fullscreen mode',
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [weights, setWeights] = useState<Record<ViolationType, number>>({ ...MALPRACTICE_WEIGHTS } as Record<ViolationType, number>);
  const [passingScore, setPassingScore] = useState(50);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [proctorInterval, setProctorInterval] = useState(5);

  const handleSave = () => {
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
  };

  const weightEntries = Object.entries(weights) as [ViolationType, number][];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile, proctoring configuration, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" />Profile</CardTitle>
              <CardDescription>Your account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={adminUser?.avatarUrl} alt={adminUser?.name} />
                  <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">{adminUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{adminUser?.name}</p>
                  <p className="text-sm text-muted-foreground">{adminUser?.email}</p>
                  <Badge variant="secondary" className="mt-1 text-xs capitalize">{adminUser?.role}</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm">Display Name</Label>
                  <Input id="name" defaultValue={adminUser?.name} className="bg-background" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input id="email" defaultValue={adminUser?.email} className="bg-background" readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Palette className="w-4 h-4" />Appearance</CardTitle>
              <CardDescription>Customize the look and feel.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Theme</Label>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Sign out of your account</Label>
                <Button variant="outline" size="sm">
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Proctoring weights */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Shield className="w-4 h-4 text-primary" />Proctoring Weights</CardTitle>
              <CardDescription>
                Configure how each violation type affects the integrity risk score. Higher weight = more impact per event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {weightEntries.map(([type, value]) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{VIOLATION_DISPLAY_NAMES[type] || type}</Label>
                      {VIOLATION_DESCRIPTIONS[type] && (
                        <p className="text-xs text-muted-foreground">{VIOLATION_DESCRIPTIONS[type]}</p>
                      )}
                    </div>
                    <span className={`text-sm font-bold w-8 text-right ${value >= 30 ? 'text-red-500' : value >= 20 ? 'text-amber-500' : 'text-emerald-500'}`}>{value}</span>
                  </div>
                  <Slider
                    min={5}
                    max={50}
                    step={5}
                    value={[value]}
                    onValueChange={([v]) => setWeights(prev => ({ ...prev, [type]: v }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low impact</span><span>High impact</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground italic border-t pt-4">
                Note: These settings are for demonstration. In production, they would be persisted to the database.
              </p>
            </CardContent>
          </Card>

          {/* Exam defaults */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><SlidersHorizontal className="w-4 h-4 text-primary" />Exam Defaults</CardTitle>
              <CardDescription>Default settings applied to new exams.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Default Passing Score</Label>
                  <span className="text-sm font-bold text-primary">{passingScore}%</span>
                </div>
                <Slider min={25} max={90} step={5} value={[passingScore]} onValueChange={([v]) => setPassingScore(v)} />
                <div className="flex justify-between text-xs text-muted-foreground"><span>25%</span><span>90%</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">AI Analysis Interval</Label>
                  <span className="text-sm font-bold">{proctorInterval}s</span>
                </div>
                <Slider min={3} max={30} step={1} value={[proctorInterval]} onValueChange={([v]) => setProctorInterval(v)} />
                <p className="text-xs text-muted-foreground">How often webcam frames are analyzed. Lower = more frequent (uses more API calls).</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-Submit on Max Risk</Label>
                  <p className="text-xs text-muted-foreground">Automatically end exam when risk score reaches 100.</p>
                </div>
                <Switch checked={autoSubmit} onCheckedChange={setAutoSubmit} />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Bell className="w-4 h-4 text-primary" />Notifications</CardTitle>
              <CardDescription>Control what alerts you receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Email Notifications', desc: 'Receive exam summaries and reports by email.', state: emailNotifications, setter: setEmailNotifications },
                { label: 'High-Risk Alerts', desc: 'Instant alerts when a student is flagged as high risk.', state: highRiskAlerts, setter: setHighRiskAlerts },
              ].map(({ label, desc, state, setter }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={state} onCheckedChange={setter} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="shadow-md shadow-primary/20">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
