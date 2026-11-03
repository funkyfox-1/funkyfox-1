import * as React from 'react';
import {
  User,
  Shield,
  CheckCircle2,
  Save,
  Camera,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Smartphone,
  Tag,
  Check,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { getDemoUser, updateDemoProfile, UserProfile } from '../../data/accountMockData';
import JellyRadio from '../ui/JellyRadio';
import './AccountStyles.css';

export default function AccountProfile() {
  const user = getDemoUser();

  // Split name for realistic first/last inputs
  const initialNames = (user?.name || 'Arjun Mehta').split(' ');
  const [firstName, setFirstName] = React.useState(initialNames[0] || 'Arjun');
  const [lastName, setLastName] = React.useState(initialNames.slice(1).join(' ') || 'Mehta');
  const [email, setEmail] = React.useState(user?.email || 'arjun.mehta@example.com');
  const [phone, setPhone] = React.useState(user?.phone || '+91 98765 43210');
  const [birthDate, setBirthDate] = React.useState('1996-08-14');
  const [avatar, setAvatar] = React.useState(user?.avatar || '/images/standard/model-tall-clean.jpg');

  // Fit & Styling
  const [preferredSize, setPreferredSize] = React.useState(user?.preferredSize || 'L');
  const [fitSilhouette, setFitSilhouette] = React.useState<'relaxed' | 'classic' | 'tailored'>('relaxed');

  // Security Form
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [pwdFeedback, setPwdFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Notifications
  const [notifyWhatsApp, setNotifyWhatsApp] = React.useState(true);
  const [notifyEarlyDrops, setNotifyEarlyDrops] = React.useState(true);
  const [notifyPromos, setNotifyPromos] = React.useState(false);

  // Page state
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Compute password strength
  const passwordStrength = React.useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  }, [newPassword]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      updateDemoProfile({
        name: fullName,
        email,
        phone,
        avatar,
        preferredSize
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3800);
    }, 350);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPwdFeedback({ type: 'error', message: 'Please enter your current demo password.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwdFeedback({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }

    setPwdFeedback({
      type: 'success',
      message: 'Password updated successfully in demo session.'
    });
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPwdFeedback(null), 4000);
  };

  // Avatar rotation helper for demo
  const rotateAvatar = () => {
    const avatars = [
      '/images/standard/model-tall-clean.jpg',
      '/images/standard/model-watch-clean.jpg',
      '/images/hero-model.jpg'
    ];
    const currentIndex = avatars.indexOf(avatar);
    const nextAvatar = avatars[(currentIndex + 1) % avatars.length];
    setAvatar(nextAvatar);
  };

  return (
    <div className="space-y-8">
      {/* 1. HERO IDENTITY CARD */}
      <div className="fox-profile-hero">
        {/* Subtle background SVG watermark */}
        <div className="fox-profile-hero-pattern" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,5 90,95 10,95" />
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar with Camera Trigger */}
            <div className="fox-profile-avatar-wrap">
              <img
                src={avatar}
                alt={`${firstName} ${lastName}`}
                className="fox-profile-avatar-img"
                onError={(e) => {
                  e.currentTarget.src = '/images/hero-model.jpg';
                }}
              />
              <button
                type="button"
                onClick={rotateAvatar}
                className="fox-profile-avatar-edit-btn"
                title="Click to cycle demo avatar"
                aria-label="Change profile photo"
              >
                <Camera size={13} strokeWidth={2.2} />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E87535] bg-[#E87535]/15 px-2.5 py-0.5 rounded-full border border-[#E87535]/30">
                  {user?.tier || 'Fox Club Gold'}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Member since {user?.memberSince || 'October 2024'}
                </span>
              </div>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                {firstName} {lastName}
              </h1>
              <p className="text-xs text-neutral-300 font-medium">
                {email} · {phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            <span className="text-xs font-semibold text-neutral-300">
              Account Verified
            </span>
          </div>
        </div>

        {/* Quick Membership Metrics Row */}
        <div className="fox-profile-stats-grid">
          <div className="fox-profile-stat-box">
            <span className="fox-profile-stat-val">5</span>
            <span className="fox-profile-stat-label">Lifetime Orders</span>
          </div>
          <div className="fox-profile-stat-box">
            <div className="flex items-baseline gap-1">
              <span className="fox-profile-stat-val text-[#E87535]">{user?.rewardsPoints || 450}</span>
              <span className="text-[11px] font-bold text-neutral-400">/ 500 PTS</span>
            </div>
            <span className="fox-profile-stat-label">50 pts to Platinum</span>
          </div>
          <div className="fox-profile-stat-box">
            <span className="fox-profile-stat-val">Size {preferredSize}</span>
            <span className="fox-profile-stat-label">Saved Fit Profile</span>
          </div>
        </div>
      </div>

      {/* Global Success Feedback Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <span className="font-semibold">
              Profile details and preferred fit updated successfully.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-green-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. MAIN PROFILE FORM */}
      <form onSubmit={handleProfileSave} className="space-y-6">
        {/* CARD 1: PERSONAL INFORMATION */}
        <div className="fox-profile-card">
          <div className="fox-profile-card-header">
            <div>
              <h2 className="font-display text-base font-black uppercase tracking-tight text-ink flex items-center gap-2">
                <User size={16} className="text-[#E87535]" />
                Personal Information
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Primary contact details used for doorstep delivery and invoice receipts.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  First Name
                </label>
                <div className="fox-profile-input-wrap">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Arjun"
                    className="fox-profile-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Last Name
                </label>
                <div className="fox-profile-input-wrap">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Mehta"
                    className="fox-profile-input"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Email Address
                  </label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.2 rounded-full border border-green-200">
                    Verified
                  </span>
                </div>
                <div className="fox-profile-input-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="arjun@example.com"
                    className="fox-profile-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Phone Number
                </label>
                <div className="fox-profile-input-wrap">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    className="fox-profile-input"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-neutral-400" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="fox-profile-input"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Enjoy a special ₹500 voucher on your birthday month.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <Tag size={13} className="text-neutral-400" />
                  Catalog Focus
                </label>
                <div className="relative w-full">
                  <select className="fox-profile-input appearance-none -webkit-appearance-none pr-10 cursor-pointer font-medium">
                    <option value="menswear">Menswear Essentials & Easy Layers</option>
                    <option value="oversized">Oversized & Streetwear Fits</option>
                    <option value="unisex">All Collections & Unisex Edits</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: TAILORED FIT & SIZING PROFILE */}
        <div className="fox-profile-card">
          <div className="fox-profile-card-header">
            <div>
              <h2 className="font-display text-base font-black uppercase tracking-tight text-ink flex items-center gap-2">
                <Sparkles size={16} className="text-[#E87535]" />
                Tailored Fit & Styling Preferences
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                We pre-select your preferred size across the collection and adjust size recommendations.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Interactive Spring JellyRadio Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Primary Top & Layer Size
                </label>
                <span className="text-xs font-semibold text-[#E87535]">
                  Currently Selected: Size {preferredSize}
                </span>
              </div>
              <div className="overflow-x-auto pb-1 scrollbar-none">
                <JellyRadio
                  items={['XS', 'S', 'M', 'L', 'XL', 'XXL']}
                  value={preferredSize}
                  onChange={(val) => setPreferredSize(val)}
                  size="md"
                  gap={8}
                  radius={12}
                  swell={0.18}
                  barge={4}
                  shrink={0.04}
                  chipColor="#FAF9F6"
                  activeColor="#E87535"
                  activeTextColor="#ffffff"
                  textColor="#191919"
                  ariaLabel="Select default size"
                />
              </div>
            </div>

            {/* Silhouette Preference Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2.5">
                Preferred Cut & Torso Silhouette
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setFitSilhouette('relaxed')}
                  className={`fox-fit-pill ${fitSilhouette === 'relaxed' ? 'fox-fit-pill--active' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">Relaxed & Boxy</span>
                    {fitSilhouette === 'relaxed' && <Check size={14} className="text-[#E87535]" />}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                    Dropped shoulders, broader chest, structured everyday drape.
                  </p>
                </div>

                <div
                  onClick={() => setFitSilhouette('classic')}
                  className={`fox-fit-pill ${fitSilhouette === 'classic' ? 'fox-fit-pill--active' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">Classic Regular</span>
                    {fitSilhouette === 'classic' && <Check size={14} className="text-[#E87535]" />}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                    Standard shoulder seams, straight torso cut, timeless proportion.
                  </p>
                </div>

                <div
                  onClick={() => setFitSilhouette('tailored')}
                  className={`fox-fit-pill ${fitSilhouette === 'tailored' ? 'fox-fit-pill--active' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">Tailored / Slim</span>
                    {fitSilhouette === 'tailored' && <Check size={14} className="text-[#E87535]" />}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                    Closer chest fit, gentle waist taper, ideal for jacket under-layers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: NOTIFICATIONS & DROPS */}
        <div className="fox-profile-card">
          <div className="fox-profile-card-header">
            <div>
              <h2 className="font-display text-base font-black uppercase tracking-tight text-ink flex items-center gap-2">
                <Bell size={16} className="text-[#E87535]" />
                Communication & Order Updates
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Choose how you prefer to receive shipping tracking and seasonal drop access.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <label className="flex items-center justify-between p-3 rounded-lg border border-[#E8E5DF] bg-[#FAF9F6] cursor-pointer hover:bg-white transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone size={17} className="text-neutral-500" />
                <div>
                  <p className="text-xs font-bold text-ink">WhatsApp & SMS Live Dispatch Alerts</p>
                  <p className="text-[11px] text-neutral-500">Real-time out-for-delivery notifications directly to your phone.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyWhatsApp}
                onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                className="h-4 w-4 rounded text-fox focus:ring-fox"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-[#E8E5DF] bg-[#FAF9F6] cursor-pointer hover:bg-white transition-colors">
              <div className="flex items-center gap-3">
                <Sparkles size={17} className="text-[#E87535]" />
                <div>
                  <p className="text-xs font-bold text-ink">Early Access Drop Invites (Fox Club VIP)</p>
                  <p className="text-[11px] text-neutral-500">Shop limited-edition seasonal capsules 24 hours before public release.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyEarlyDrops}
                onChange={(e) => setNotifyEarlyDrops(e.target.checked)}
                className="h-4 w-4 rounded text-fox focus:ring-fox"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-[#E8E5DF] bg-[#FAF9F6] cursor-pointer hover:bg-white transition-colors">
              <div className="flex items-center gap-3">
                <Mail size={17} className="text-neutral-500" />
                <div>
                  <p className="text-xs font-bold text-ink">Editorial Newsletter & Style Guides</p>
                  <p className="text-[11px] text-neutral-500">Curated styling edits, fabric care tips, and exclusive member discounts.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyPromos}
                onChange={(e) => setNotifyPromos(e.target.checked)}
                className="h-4 w-4 rounded text-fox focus:ring-fox"
              />
            </label>
          </div>
        </div>

        {/* SAVE PROFILE ACTION BUTTON */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="py-3 px-8 rounded-full bg-ink text-white font-display text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Save size={15} />
            {isSaving ? 'Updating Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* CARD 4: SECURITY & CREDENTIALS (INDEPENDENT FORM) */}
      <div className="fox-profile-card">
        <div className="fox-profile-card-header">
          <div>
            <h2 className="font-display text-base font-black uppercase tracking-tight text-ink flex items-center gap-2">
              <Shield size={16} className="text-[#E87535]" />
              Security & Credentials
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage your password and inspect authenticated session details.
            </p>
          </div>
        </div>

        {pwdFeedback && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
              pwdFeedback.type === 'success'
                ? 'bg-green-50 text-green-900 border border-green-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {pwdFeedback.type === 'success' ? <CheckCircle2 size={16} className="text-green-600 shrink-0" /> : <AlertCircle size={16} className="text-red-600 shrink-0" />}
            <span>{pwdFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="fox-profile-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="fox-profile-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Dynamic Password Strength Meter */}
            {newPassword && (
              <div className="mt-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= step
                          ? passwordStrength <= 2
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                          : 'bg-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-neutral-500">
                  {passwordStrength <= 1
                    ? 'Weak — add capital letters, numbers, or symbols'
                    : passwordStrength <= 3
                    ? 'Moderate — good security'
                    : 'Strong — excellent password'}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-full border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
            >
              Update Password
            </button>

            <span className="text-[11px] text-neutral-400">
              Demo session security simulation
            </span>
          </div>
        </form>

        {/* Current Active Session Info */}
        <div className="mt-6 pt-5 border-t border-[#F0ECE1] flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-medium text-neutral-700">Active Session:</span>
            <span>Chrome on Windows · Mumbai, India</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Current Device</span>
        </div>
      </div>
    </div>
  );
}
