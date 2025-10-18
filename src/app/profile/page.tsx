"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useUser, useClerk } from "@clerk/nextjs";
import { Home, TrendingUp, BarChart3, User as UserIcon, ChevronRight, ChevronLeft, LogOut, Shield, Mail, Calendar, Clock, Sliders, Watch, CreditCard, Info, Edit2, Save, X, Check, Plus, Trash2, RefreshCw, Eye, FileText, Sparkles, Download, Settings, Key, Bell, Palette, Cpu, Lock, Crown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "main" | "account" | "notifications" | "tracking" | "integrations" | "privacy" | "subscription" | "about";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeSection, setActiveSection] = useState<Section>("main");
  const [editingAccount, setEditingAccount] = useState(false);
  
  // Account data - use user's name from Clerk or extract from email
  const defaultName = user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0] || "User";
  const [displayName, setDisplayName] = useState(defaultName);
  
  // Update display name when user changes
  useEffect(() => {
    if (user) {
      const newName = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User";
      setDisplayName(newName);
    }
  }, [user]);
  
  // Debug: Log user data
  console.log('Profile - User data:', user);
  console.log('Profile - Default name:', defaultName);
  const [pronouns, setPronouns] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [country, setCountry] = useState("United States");
  const email = user?.emailAddresses[0]?.emailAddress || "";
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [connectedAccounts] = useState({
    google: user?.externalAccounts.some(account => account.provider === 'google') || false,
    apple: user?.externalAccounts.some(account => account.provider === 'apple') || false
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState(true);
  const [timezone, setTimezone] = useState("auto");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");
  
  // Tracking preferences
  const [moodInputMode, setMoodInputMode] = useState<"tags" | "slider">("tags");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [haptics, setHaptics] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [menstrualTracking, setMenstrualTracking] = useState(false);
  
  // Integrations
  const [wearables] = useState([
    { id: "oura", name: "Oura Ring", connected: false, lastSync: null },
    { id: "apple-watch", name: "Apple Watch", connected: false, lastSync: null },
    { id: "apple-health", name: "Apple Health", connected: true, lastSync: "2 hours ago" },
  ]);
  

  const handleSaveAccount = () => {
    setEditingAccount(false);
    // Save to backend
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      if (confirm("FINAL WARNING: All your data will be permanently deleted. Continue?")) {
        // Delete account
        console.log("Account deleted");
      }
    }
  };

  // Main settings list view
  if (activeSection === "main") {
    return (
      <div className="min-h-screen pb-20" style={{ backgroundColor: '#f8f5f2' }}>
        <header className="bg-white px-3 sm:px-4 py-3 sm:py-4 border-b border-neutral-200">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="/home" className="p-1">
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-600" />
              </a>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-neutral-800">Profile & Settings</h1>
                <p className="text-xs text-neutral-500">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* User Profile Card */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-6 pb-6 px-5">
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #f5855f 0%, #960047 50%, #953599 100%)' }}
                >
                  {displayName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-800">{displayName}</h2>
                  <p className="text-sm text-neutral-500">{email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Verified</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Section */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 px-1">Account</h3>
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="p-0">
                <button
                  onClick={() => setActiveSection("account")}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-800">Personal Information</p>
                      <p className="text-xs text-neutral-500">Name, pronouns, birth year</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </button>
                
                <div className="border-t border-neutral-200" />
                
                <button
                  onClick={() => setActiveSection("account")}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                      <Key className="h-5 w-5 text-pink-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-800">Email & Sign-In</p>
                      <p className="text-xs text-neutral-500">Authentication methods</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Preferences Section */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 px-1">Preferences</h3>
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="p-0">
                <button
                  onClick={() => setActiveSection("notifications")}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-800">Time & Notifications</p>
                      <p className="text-xs text-neutral-500">Timezone, reminders, quiet hours</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </button>
                
                <div className="border-t border-neutral-200" />
                
                <button
                  onClick={() => setActiveSection("tracking")}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Palette className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-800">Tracking Preferences</p>
                      <p className="text-xs text-neutral-500">Mood mode, units, accessibility</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Data & Integrations Section */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 px-1">Data & Integrations</h3>
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="p-0">
                <button
                  onClick={() => setActiveSection("integrations")}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <Cpu className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-800">Integrations</p>
                      <p className="text-xs text-neutral-500">Wearables, calendars</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </button>
                
                <div className="border-t border-neutral-200" />
                
                <button
                  onClick={() => setActiveSection("privacy")}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-800">Data & Privacy</p>
                      <p className="text-xs text-neutral-500">Export data, manage privacy</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* App Section */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 px-1">App</h3>
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="p-0">
                <button
                  onClick={() => setActiveSection("subscription")}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-800">Subscription</p>
                      <p className="text-xs text-neutral-500">Plan details and billing</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </button>
                
                <div className="border-t border-neutral-200" />
                
                <button
                  onClick={() => setActiveSection("about")}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <HelpCircle className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-800">About</p>
                      <p className="text-xs text-neutral-500">Version, help, support</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Sign Out */}
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 p-4 border border-red-200 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
          <div className="flex items-center justify-around h-14 sm:h-16 px-2 sm:px-4 max-w-2xl mx-auto">
            <a href="/home" className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-600 min-w-0">
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs truncate">Home</span>
            </a>
            <a href="/track" className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-600 min-w-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs truncate">Track</span>
            </a>
            <a href="/analytics" className="flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-600 min-w-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs truncate">Analytics</span>
            </a>
            <div className="flex flex-col items-center gap-1 text-purple-600 min-w-0">
              <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs font-medium truncate">Profile</span>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  // Detail view (for all other sections)
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f2' }}>
      <header className="bg-white px-3 sm:px-4 py-3 sm:py-4 border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setActiveSection("main")} className="p-1">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-neutral-800">
                {activeSection === "account" && "Personal Information"}
                {activeSection === "notifications" && "Time & Notifications"}
                {activeSection === "tracking" && "Tracking Preferences"}
                {activeSection === "integrations" && "Integrations"}
                {activeSection === "privacy" && "Data & Privacy"}
                {activeSection === "subscription" && "Subscription"}
                {activeSection === "about" && "About"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 pb-20 sm:pb-24">
        {/* Account Section Content */}
        {activeSection === "account" && (
          <div className="space-y-4">
            {/* Personal Information */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base text-neutral-800">Personal Information</h3>
                  {!editingAccount ? (
                    <button
                      onClick={() => setEditingAccount(true)}
                      className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingAccount(false)}
                        className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAccount}
                        className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #f5855f 0%, #960047 50%, #953599 100%)' }}
                    >
                      {displayName.charAt(0)}
                    </div>
                    {editingAccount && (
                      <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                        Change Avatar
                      </button>
                    )}
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Display Name</label>
                    {editingAccount ? (
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                      />
                    ) : (
                      <p className="text-sm text-neutral-800">{displayName}</p>
                    )}
                  </div>

                  {/* Pronouns */}
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Pronouns (Optional)</label>
                    {editingAccount ? (
                      <input
                        type="text"
                        value={pronouns}
                        onChange={(e) => setPronouns(e.target.value)}
                        placeholder="e.g., she/her, they/them"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                      />
                    ) : (
                      <p className="text-sm text-neutral-800">{pronouns || "Not specified"}</p>
                    )}
                  </div>

                  {/* Birth Year */}
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Birth Year (Optional)</label>
                    {editingAccount ? (
                      <input
                        type="number"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        placeholder="YYYY"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                      />
                    ) : (
                      <p className="text-sm text-neutral-800">{birthYear || "Not specified"}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Country</label>
                    {editingAccount ? (
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                      >
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                        <option>Australia</option>
                        <option>Other</option>
                      </select>
                    ) : (
                      <p className="text-sm text-neutral-800">{country}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email & Sign-In */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base text-neutral-800">Email & Sign-In</h3>
                  {!editingEmail ? (
                    <button
                      onClick={() => setEditingEmail(true)}
                      className="flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingEmail(false)}
                        className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          // TODO: Implement email change
                          setEditingEmail(false);
                        }}
                        className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Email Address</label>
                    {editingEmail ? (
                      <div className="space-y-3">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="New email address"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        />
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current password"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        />
                        <p className="text-xs text-neutral-500">Enter your current password to confirm this change</p>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-800">{email}</p>
                    )}
                  </div>

                  {/* Connected Accounts */}
                  <div>
                    <label className="text-xs text-neutral-500 mb-2 block">Connected Accounts</label>
                    <div className="space-y-2">
                      <button className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border ${connectedAccounts.google ? 'border-green-200 bg-green-50' : 'border-neutral-200'}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-neutral-700">Google</span>
                        </div>
                        <span className="text-sm">{connectedAccounts.google ? 'Connected' : 'Connect'}</span>
                      </button>

                      <button className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border ${connectedAccounts.apple ? 'border-green-200 bg-green-50' : 'border-neutral-200'}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path d="M17.05 20.28c-.98.95-2.05.94-3.12.47-1.12-.48-2.14-.48-3.31 0-1.47.62-2.25.44-3.12-.47C2.86 15.37 3.6 7.68 9.05 7.35c1.65.08 2.76.87 3.58.87.83 0 2.37-.85 4-.91 .68-.03 2.58.26 3.8 1.97-3.33 2.15-2.8 6.88.62 8.43-.62 1.61-1.42 3.23-3 2.57M13 3.76c.85-1.07 1.5-2.58 1.26-4.1-1.39.09-3.01.96-3.95 2.03-.85 1.03-1.57 2.54-1.29 4 1.44.11 2.96-.82 3.98-1.93" fill="currentColor"/>
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-neutral-700">Apple</span>
                        </div>
                        <span className="text-sm">{connectedAccounts.apple ? 'Connected' : 'Connect'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Integrations Section */}
        {activeSection === "integrations" && (
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-6 pb-6 px-5">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-sm text-neutral-600 mb-2">Integration options will be coming soon</p>
                  <p className="text-xs text-neutral-500">We're working on connecting with your favorite apps and devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Section */}
        {activeSection === "subscription" && (
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-6 pb-6 px-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-base text-neutral-800">Free Beta Access</h3>
                  <p className="text-sm text-neutral-600 mt-1">You are using the free beta version</p>
                </div>
                <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                  Beta
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>All features included</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Early access to new features</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Help shape the product</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time & Notifications Section */}
        {activeSection === "notifications" && (
          <div className="space-y-4">
            {/* Time Zone Settings */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <h3 className="font-semibold text-base text-neutral-800 mb-4">Time Zone</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Time Zone Setting</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    >
                      <option value="auto">Auto-detect (Recommended)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                    <p className="text-xs text-neutral-500 mt-1">This affects how times are displayed throughout the app</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <h3 className="font-semibold text-base text-neutral-800 mb-4">Notifications</h3>
                <div className="space-y-6">
                  {/* Enable/Disable Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Enable Notifications</p>
                      <p className="text-xs text-neutral-500">Receive reminders and updates</p>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-purple-600' : 'bg-neutral-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  {notifications && (
                    <>
                      {/* Daily Reminder Time */}
                      <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Daily Reminder Time</label>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                        />
                        <p className="text-xs text-neutral-500 mt-1">When should we remind you to check in?</p>
                      </div>

                      {/* Quiet Hours */}
                      <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Quiet Hours</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={quietHoursStart}
                            onChange={(e) => setQuietHoursStart(e.target.value)}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                          />
                          <span className="text-sm text-neutral-500">to</span>
                          <input
                            type="time"
                            value={quietHoursEnd}
                            onChange={(e) => setQuietHoursEnd(e.target.value)}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                          />
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">We won't send notifications during these hours</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tracking Preferences */}
        {activeSection === "tracking" && (
          <div className="space-y-4">
            {/* Input Preferences */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <h3 className="font-semibold text-base text-neutral-800 mb-4">Input Preferences</h3>
                <div className="space-y-6">
                  {/* Mood Input Mode */}
                  <div>
                    <label className="text-xs text-neutral-500 mb-2 block">Mood Input Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMoodInputMode("tags")}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          moodInputMode === "tags"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        Tags
                      </button>
                      <button
                        onClick={() => setMoodInputMode("slider")}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          moodInputMode === "slider"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        Slider
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Choose how you want to record your mood</p>
                  </div>

                  {/* Units */}
                  <div>
                    <label className="text-xs text-neutral-500 mb-2 block">Units</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setUnits("metric")}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          units === "metric"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        Metric
                      </button>
                      <button
                        onClick={() => setUnits("imperial")}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          units === "imperial"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        Imperial
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Used for weight, height, and other measurements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <h3 className="font-semibold text-base text-neutral-800 mb-4">Accessibility</h3>
                <div className="space-y-6">
                  {/* Haptic Feedback */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Haptic Feedback</p>
                      <p className="text-xs text-neutral-500">Vibration feedback on actions</p>
                    </div>
                    <button
                      onClick={() => setHaptics(!haptics)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${haptics ? 'bg-purple-600' : 'bg-neutral-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${haptics ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Reduced Motion</p>
                      <p className="text-xs text-neutral-500">Minimize animations</p>
                    </div>
                    <button
                      onClick={() => setReducedMotion(!reducedMotion)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${reducedMotion ? 'bg-purple-600' : 'bg-neutral-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${reducedMotion ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">High Contrast</p>
                      <p className="text-xs text-neutral-500">Increase text contrast</p>
                    </div>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${highContrast ? 'bg-purple-600' : 'bg-neutral-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Features */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <h3 className="font-semibold text-base text-neutral-800 mb-4">Additional Features</h3>
                <div className="space-y-6">
                  {/* Menstrual Tracking */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Menstrual Tracking</p>
                      <p className="text-xs text-neutral-500">Track your cycle and symptoms</p>
                    </div>
                    <button
                      onClick={() => setMenstrualTracking(!menstrualTracking)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${menstrualTracking ? 'bg-purple-600' : 'bg-neutral-200'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${menstrualTracking ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}


        {/* Data & Privacy */}
        {activeSection === "privacy" && (
          <div className="space-y-4">
            {/* Data Export */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <h3 className="font-semibold text-base text-neutral-800 mb-4">Data Export</h3>
                <div className="space-y-4">
                  <p className="text-sm text-neutral-600">Download a copy of your data in JSON format</p>
                  <button
                    onClick={() => {
                      // TODO: Implement data export
                      alert('Data export will be available soon');
                    }}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200"
                  >
                    <Download className="h-4 w-4" />
                    Export Data
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <h3 className="font-semibold text-base text-neutral-800 mb-4">Privacy Settings</h3>
                <div className="space-y-6">
                  {/* Data Collection */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Analytics Collection</p>
                      <p className="text-xs text-neutral-500">Help us improve by sharing usage data</p>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement analytics toggle
                        alert('Analytics settings will be available soon');
                      }}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                    </button>
                  </div>

                  {/* Third-party Data Sharing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Third-party Sharing</p>
                      <p className="text-xs text-neutral-500">Share data with connected services</p>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement data sharing toggle
                        alert('Data sharing settings will be available soon');
                      }}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Deletion */}
            <Card className="border-neutral-200 shadow-sm">
              <CardContent className="pt-6 pb-6 px-5">
                <h3 className="font-semibold text-base text-neutral-800 mb-4">Account Deletion</h3>
                <div className="space-y-4">
                  <p className="text-sm text-neutral-600">Permanently delete your account and all associated data</p>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </button>
                  <p className="text-xs text-neutral-500">This action cannot be undone</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Other sections placeholder */}
        {!["account", "integrations", "subscription", "notifications", "tracking", "privacy", "about"].includes(activeSection) && (
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-6 pb-6 px-5">
              <p className="text-sm text-neutral-600">Content for {activeSection} section coming soon...</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
