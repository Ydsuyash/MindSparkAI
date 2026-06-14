import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Volume2, Music, Bell, Moon, Sun, Download, Trash2, RotateCcw, 
  Settings as SettingsIcon, Mail, Shield, User, Volume1
} from "lucide-react";
import { AVATARS } from "@/lib/avatars";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({ meta: [{ title: "Settings — MindSpark AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [voiceVol, setVoiceVol] = useState(80);
  const [musicVol, setMusicVol] = useState(50);
  const [sfxVol, setSfxVol] = useState(100);
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleExport = () => {
    alert("Exporting data as CSV/JSON...");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      alert("Progress reset.");
    }
  };

  const handleDelete = () => {
    if (confirm("DANGER: Delete account permanently?")) {
      alert("Account deleted.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <header className="card-premium p-8 bg-gradient-to-br from-primary to-primary-glow text-white">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur-md">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">Settings</h1>
            <p className="mt-1 font-medium text-white/90">Personalize your MindSpark experience</p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Audio Settings */}
        <section className="card-premium p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-extrabold">
            <Volume2 className="h-6 w-6 text-primary" /> Audio & Voice
          </h2>
          <div className="space-y-6">
            <SliderSetting label="Voice Volume" value={voiceVol} setValue={setVoiceVol} icon={<Volume2 className="h-4 w-4" />} />
            <SliderSetting label="Music Volume" value={musicVol} setValue={setMusicVol} icon={<Music className="h-4 w-4" />} />
            <SliderSetting label="Sound Effects" value={sfxVol} setValue={setSfxVol} icon={<Volume1 className="h-4 w-4" />} />
            
            <div className="pt-2">
              <div className="mb-2 text-sm font-bold text-muted-foreground uppercase tracking-wide">Speech Speed</div>
              <div className="flex gap-2">
                {[0.8, 1, 1.2, 1.5].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setSpeechSpeed(speed)}
                    className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
                      speechSpeed === speed ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="card-premium p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-extrabold">
            <User className="h-6 w-6 text-amber-500" /> Preferences
          </h2>
          <div className="space-y-4">
            <ToggleSetting label="Dark Mode" active={darkMode} setActive={setDarkMode} icon={<Moon className="h-5 w-5" />} desc="Easier on the eyes at night" />
            <ToggleSetting label="Push Notifications" active={notifications} setActive={setNotifications} icon={<Bell className="h-5 w-5" />} desc="Daily reminders & streaks" />
            <ToggleSetting label="Parent Weekly Email" active={true} setActive={() => {}} icon={<Mail className="h-5 w-5" />} desc="Send report to parent email" />
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="card-premium p-6 md:col-span-2 border-2 border-rose-100 bg-rose-50/30">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-extrabold text-rose-900">
            <Shield className="h-6 w-6 text-rose-500" /> Data & Privacy
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <button onClick={handleExport} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm border border-border hover:border-primary hover:shadow-md transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-blue-600"><Download className="h-5 w-5" /></div>
              <div className="font-bold">Export Data</div>
              <div className="text-xs text-muted-foreground">Download your records</div>
            </button>
            <button onClick={handleReset} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm border border-border hover:border-amber-500 hover:shadow-md transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600"><RotateCcw className="h-5 w-5" /></div>
              <div className="font-bold">Reset Progress</div>
              <div className="text-xs text-muted-foreground">Start fresh from Level 1</div>
            </button>
            <button onClick={handleDelete} className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm border border-border hover:border-rose-500 hover:shadow-md transition-all">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-rose-600"><Trash2 className="h-5 w-5" /></div>
              <div className="font-bold">Delete Account</div>
              <div className="text-xs text-muted-foreground">Permanently remove data</div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SliderSetting({ label, value, setValue, icon }: any) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold text-muted-foreground uppercase tracking-wide">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <span>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </div>
  );
}

function ToggleSetting({ label, active, setActive, icon, desc }: any) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4 border border-border/50">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-background shadow-sm text-foreground">
          {icon}
        </div>
        <div>
          <div className="font-bold">{label}</div>
          <div className="text-xs text-muted-foreground font-medium">{desc}</div>
        </div>
      </div>
      <button
        onClick={() => setActive(!active)}
        className={`relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          active ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <motion.div
          className="mx-1 h-5 w-5 rounded-full bg-white shadow-sm"
          animate={{ x: active ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
