'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MOCK_FRIENDS } from '@/lib/mockData';

// --- Icons ---
const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const LoginIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const FriendsHeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);
const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);
const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
);
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const UserPlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
);
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
);
const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
    </svg>
);
const SoundIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
);
const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const ChallengeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-md">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

// --- Main Sidebar Component ---
type PanelType = 'profile' | 'settings' | 'friends' | 'analytics' | 'challenges' | null;

import LeaderboardModal from '@/components/LeaderboardModal';
import ChallengePanel from '@/components/ChallengePanel';
import EditProfileModal from '@/components/EditProfileModal';
import { loadProfileData, saveProfileData, loadUnlockedRewards, initDemoRewards } from '@/lib/challengeStore';
import { ProfileData, UnlockedReward } from '@/lib/challengeTypes';

const Sidebar = () => {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const handleIconClick = (targetPanel: PanelType) => {
    let panelToOpen = targetPanel;
    // If panel is not settings and user is not logged in, force open profile (for login)
    if (targetPanel !== null && targetPanel !== 'settings' && !isLoggedIn) {
      panelToOpen = 'profile';
    }
    setActivePanel(prev => (prev === panelToOpen ? null : panelToOpen));
  };

  return (
    <>
      <aside 
        className={`
          fixed top-0 left-0 z-40 h-screen bg-[#0c0c0e] border-r border-white/5 flex transition-all duration-300 ease-in-out
          ${activePanel ? 'w-96' : 'w-20'}
        `}
      >
        {/* --- Icon Column --- */}
        <div className="w-20 h-full flex flex-col items-center justify-between py-6 flex-shrink-0">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center">
              <h1 className="text-3xl font-black text-white"><span className="text-red-600">X</span></h1>
            </div>
            <div className="flex flex-col items-center gap-2 mt-8">
              <SidebarButton tooltip="Profile" onClick={() => handleIconClick('profile')} isActive={activePanel === 'profile'}>
                <UserIcon />
              </SidebarButton>
              <SidebarButton tooltip="Global Leaderboard" onClick={() => {
                if (!isLoggedIn) {
                  setActivePanel(prev => prev === 'profile' ? null : 'profile');
                } else {
                  setIsLeaderboardOpen(true);
                }
              }}>
                <TrophyIcon />
              </SidebarButton>
              <SidebarButton tooltip="Friends" onClick={() => handleIconClick('friends')} isActive={activePanel === 'friends'}>
                <FriendsHeartIcon />
              </SidebarButton>
              <SidebarButton tooltip="Analytics" onClick={() => handleIconClick('analytics')} isActive={activePanel === 'analytics'}>
                <AnalyticsIcon />
              </SidebarButton>
              <SidebarButton tooltip="Challenges" onClick={() => handleIconClick('challenges')} isActive={activePanel === 'challenges'}>
                <ChallengeIcon />
              </SidebarButton>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 w-full">
            <SidebarButton tooltip="Settings" onClick={() => handleIconClick('settings')} isActive={activePanel === 'settings'}>
              <SettingsIcon />
            </SidebarButton>
            
            {isLoggedIn && (
              <>
                <div className="w-12 h-px bg-white/10" />

                <SidebarButton 
                  tooltip="Logout" 
                  className="text-red-500 bg-transparent hover:bg-red-500/10 hover:text-red-400"
                  onClick={() => setIsLoggedIn(false)}
                >
                  <LoginIcon />
                </SidebarButton>
              </>
            )}
          </div>
        </div>

        {/* --- Expanded Panel --- */}
        <div className="flex-grow overflow-hidden bg-[#111114]">
          {activePanel === 'settings' && <SettingsPanel onClose={() => setActivePanel(null)} />}
          {activePanel === 'profile' && <ProfilePanel onClose={() => setActivePanel(null)} isLoggedIn={isLoggedIn} onLogin={() => setIsLoggedIn(true)} />}
          {activePanel === 'friends' && <FriendsPanel onClose={() => setActivePanel(null)} />}
          {activePanel === 'analytics' && <AnalyticsPanel onClose={() => setActivePanel(null)} />}
          {activePanel === 'challenges' && <ChallengePanel onClose={() => setActivePanel(null)} />}
        </div>
      </aside>
      {/* Backdrop */}
      {activePanel && (
        <div 
          onClick={() => setActivePanel(null)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}
      
      {/* Global Modals */}
      <LeaderboardModal 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
      />
    </>
  );
};

// --- Helper Components ---
const SidebarButton = ({ children, tooltip, onClick, isActive, className }: { children: React.ReactNode; tooltip: string; onClick?: () => void; isActive?: boolean; className?: string }) => (
  <div className="group relative">
    <button 
      onClick={onClick}
      className={`p-3 rounded-lg transition-all ${className || (isActive ? 'bg-white/10 text-white' : 'text-white/60 bg-transparent hover:bg-white/10 hover:text-white')}`}
    >
      {children}
    </button>
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-[#111114] border border-white/10 rounded-md text-sm text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
      {tooltip}
    </div>
  </div>
);

const PanelHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <div className="flex items-center justify-between p-5 border-b border-white/10 h-[72px]">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <button onClick={onClose} className="p-2 rounded-lg text-[#666666] hover:text-white hover:bg-white/10 transition-all" aria-label="Close panel">
            <CloseIcon />
        </button>
    </div>
);

// --- Panels ---
const ProfilePanel = ({ onClose, isLoggedIn = false, onLogin }: { onClose: () => void, isLoggedIn?: boolean, onLogin?: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  // Login form states
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [selectedGame, setSelectedGame] = useState('gridshot');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [equippedBadge, setEquippedBadgeState] = useState<string | null>(null);
  
  // Load initial badge from localStorage
  useEffect(() => {
      const savedBadge = localStorage.getItem('aimX_equippedBadge');
      if (savedBadge) {
          setEquippedBadgeState(savedBadge);
      }
  }, []);

  // Profile data and edit modal state
  const [profileData, setProfileData] = useState<ProfileData>({ profilePicture: null, equippedBorder: null, equippedBadges: [] });
  const [unlockedRewards, setUnlockedRewards] = useState<UnlockedReward[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load profile data and unlocked rewards on mount
  useEffect(() => {
      setProfileData(loadProfileData());
      setUnlockedRewards(initDemoRewards());
  }, []);

  const setEquippedBadge = (badge: string | null) => {
      setEquippedBadgeState(badge);
      if (badge) {
          localStorage.setItem('aimX_equippedBadge', badge);
      } else {
          localStorage.removeItem('aimX_equippedBadge');
      }
  };

  const userId = "372987654";

  const gameModes = [
      { id: 'gridshot', name: 'Gridshot' },
      { id: 'spidershot', name: 'Spidershot' },
      { id: 'microshot', name: 'Microshot' },
      { id: 'tracking', name: 'Tracking' },
      { id: 'flick', name: 'Flick' },
      { id: 'precision', name: 'Precision' },
      { id: 'reflex', name: 'Reflex' },
      { id: 'burst', name: 'Burst' },
      { id: 'smooth-aiming', name: 'Smooth Aiming' },
  ];

  const scores: Record<string, string> = {
      'gridshot': '85,240',
      'spidershot': '62,100',
      'microshot': '94,300',
      'tracking': '45,800',
      'flick': '72,150',
      'precision': '68,900',
      'reflex': '55,420',
      'burst': '88,100',
      'smooth-aiming': '41,200',
  };

  const badgeColors: Record<string, string> = {
    "Aim Addict": "text-purple-400 bg-purple-500/10 border-purple-500/20",
    "Aim Never Sleeps": "text-purple-400 bg-purple-500/10 border-purple-500/20",
    "Endless Training": "text-blue-400 bg-blue-500/10 border-blue-500/20",
    "High Roller": "text-orange-400 bg-orange-500/10 border-orange-500/20",
    "Legendary Run": "text-orange-500 bg-orange-600/10 border-orange-600/20",
    "Lightning Reflex": "text-blue-400 bg-blue-500/10 border-blue-500/20",
    "Magnet Aim": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    "Missed Everything": "text-orange-400 bg-orange-500/10 border-orange-500/20",
    "Potato Aim": "text-amber-600 bg-amber-700/10 border-amber-700/20",
    "Quickscope": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    "Sharp Eyes": "text-teal-400 bg-teal-500/10 border-teal-500/20",
    "Skull Cracker": "text-red-500 bg-red-600/10 border-red-600/20",
    "Top 1%": "text-yellow-300 bg-yellow-400/10 border-yellow-400/20",
    "Top 10%": "text-amber-600 bg-amber-700/10 border-amber-700/20",
    "Top 5%": "text-slate-300 bg-slate-400/10 border-slate-400/20",
    "Ultra Instinct": "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
    "Weekly Warrior": "text-green-400 bg-green-500/10 border-green-500/20"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#111114]">
        <PanelHeader title="Profile" onClose={onClose} />
        
        {!isLoggedIn ? (
          <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden flex flex-col pb-12 mt-4">
            {!isRegistering ? (
              <>
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white tracking-tight">SIGN IN</h3>
                </div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (loginPassword.length > 0) {
                      setLoginError("");
                      if (onLogin) onLogin();
                    } else {
                      setLoginError("Invalid password");
                    }
                  }} 
                  className="flex flex-col gap-5 w-full"
                >
                    {loginError && <div className="text-red-500 text-sm text-center">{loginError}</div>}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Username (Dummy)</label>
                        <input 
                            type="text" 
                            placeholder="Enter any username"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            className="bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-white/30 focus:bg-[#1f1f25] transition-all font-sans"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Password (Dummy)</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter any password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-white/30 focus:bg-[#1f1f25] transition-all font-sans"
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white transition-colors flex items-center justify-center h-full"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                        <div className="flex justify-end mt-1">
                            <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</button>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="mt-2 bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                        Sign In
                    </button>
                </form>
                <div className="h-px w-full bg-white/10 my-8"></div>
                <div className="flex flex-col gap-3">
                    <span className="text-sm text-white/50 text-center">Don't have an account?</span>
                    <button 
                        type="button" 
                        onClick={() => setIsRegistering(true)}
                        className="border border-white/10 text-white hover:bg-white/10 hover:border-white/20 font-semibold py-3 rounded-lg transition-all text-sm uppercase tracking-wide"
                    >
                        Create an account
                    </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Create an account</h3>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Email</label>
                        <input 
                            type="email" 
                            placeholder="Enter your email"
                            className="bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-white/30 focus:bg-[#1f1f25] transition-all font-sans"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Username</label>
                        <input 
                            type="text" 
                            placeholder="Choose a username"
                            className="bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-white/30 focus:bg-[#1f1f25] transition-all font-sans"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Create a password"
                                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-white/30 focus:bg-[#1f1f25] transition-all font-sans"
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white transition-colors flex items-center justify-center h-full"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Confirm Password</label>
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm your password"
                                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-white/30 focus:bg-[#1f1f25] transition-all font-sans"
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white transition-colors flex items-center justify-center h-full"
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="mt-4 bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="h-px w-full bg-white/10 my-8"></div>
                <div className="flex flex-col gap-3">
                    <span className="text-sm text-white/50 text-center">Already have an account?</span>
                    <button 
                        type="button" 
                        onClick={() => setIsRegistering(false)}
                        className="border border-white/10 text-white hover:bg-white/10 hover:border-white/20 font-semibold py-3 rounded-lg transition-all text-sm uppercase tracking-wide"
                    >
                        Back to Login
                    </button>
                </div>
              </>
            )}
          </div>
        ) : (
        <>
        {/* Profile Info */}
        <div className="p-6 flex flex-col items-center border-b border-white/5">
            <div className="relative w-28 h-28 flex items-center justify-center mb-4 group/avatar cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                {/* Border overlay */}
                {profileData.equippedBorder && (
                    <img
                        src={`/images/${profileData.equippedBorder}`}
                        alt="Profile border"
                        className="absolute inset-0 w-28 h-28 object-contain pointer-events-none z-10"
                    />
                )}
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
                    {profileData.profilePicture ? (
                        <img
                            src={profileData.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover group-hover/avatar:brightness-50 transition-all duration-200"
                        />
                    ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40 group-hover/avatar:opacity-30 transition-all duration-200">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                    )}
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/40 transition-all duration-200 rounded-full" />
                </div>
                {/* Edit icon - centered, visible on hover */}
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <PencilIcon />
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">GuestPlayer</h3>
            
            {equippedBadge && (
                <div className={`text-xs font-semibold px-2 py-1 rounded mb-2 border ${badgeColors[equippedBadge] || 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'}`}>
                    {equippedBadge}
                </div>
            )}
            
            <button 
                onClick={handleCopy}
                className="text-xs text-[#666666] hover:text-[#aaaaaa] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Copy User ID"
            >
                {userId}
                {copied ? (
                    <span className="text-green-500 flex items-center"><CheckIcon /></span>
                ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
            </button>
        </div>

        {/* Statistics and Achievements */}
        <div className="p-6 flex-1 overflow-y-auto">
            <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-4">Statistics</h4>
            
            <div className="space-y-4">
                {/* Highest Score section with custom dropdown */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center relative">
                        <span className="text-white/60 text-sm">Highest Score</span>
                        
                        {/* Custom Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1.5 bg-[#1a1a1f] border border-white/10 text-white/80 hover:text-white hover:bg-white/5 hover:border-white/20 text-xs rounded px-2.5 py-1.5 outline-none cursor-pointer transition-all font-sans"
                            >
                                <span>{gameModes.find(g => g.id === selectedGame)?.name}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute right-0 top-full mt-1 w-40 max-h-48 overflow-y-auto bg-[#1a1a1f] border border-white/10 rounded-md shadow-xl z-50 flex flex-col py-1 pointer-events-auto custom-scrollbar">
                                        {gameModes.map(mode => (
                                            <button
                                                key={mode.id}
                                                onClick={() => {
                                                    setSelectedGame(mode.id);
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-sans transition-colors ${selectedGame === mode.id ? 'bg-white/15 text-white font-medium' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {mode.name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <span className="text-white font-mono font-bold text-xl">{scores[selectedGame]}</span>
                </div>

                <div className="h-px w-full bg-white/5 my-2"></div>

                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Total Play Time</span>
                    <span className="text-white font-mono font-medium">24h 15m</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Accuracy</span>
                    <span className="text-white font-mono font-medium text-green-400">92.5%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Miss Count</span>
                    <span className="text-white font-mono font-medium text-red-400">1,240</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Click Speed</span>
                    <span className="text-white font-mono font-medium">6.4 CPS</span>
                </div>
            </div>

            {/* Section Separator */}
            <div className="h-px w-full bg-white/10 my-8"></div>

            {/* Achievements / Badges */}
            <div>
                <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-4">Achievements</h4>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        "Aim Addict",
                        "Aim Never Sleeps",
                        "Endless Training",
                        "High Roller",
                        "Legendary Run",
                        "Lightning Reflex",
                        "Magnet Aim",
                        "Missed Everything",
                        "Potato Aim",
                        "Quickscope",
                        "Sharp Eyes",
                        "Skull Cracker",
                        "Top 1%",
                        "Top 10%",
                        "Top 5%",
                        "Ultra Instinct",
                        "Weekly Warrior"
                    ].map((achievementName, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setEquippedBadge(achievementName)}
                            className="aspect-square transition-all flex items-center justify-center cursor-pointer group"
                            title={achievementName}
                        >
                            <img 
                                src={`/images/${encodeURIComponent(achievementName)}.png`} 
                                alt={achievementName}
                                className="w-full h-full object-contain filter group-hover:brightness-110 transition-all drop-shadow-md"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profileData={profileData}
            unlockedRewards={unlockedRewards}
            onSave={(data) => {
                saveProfileData(data);
                setProfileData(data);
            }}
        />
        </>
        )}
    </div>
  );
};

// --- Friends Panel ---
const FriendsPanel = ({ onClose }: { onClose: () => void }) => {
  const [mode, setMode] = useState<'list' | 'add'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [addQuery, setAddQuery] = useState('');

  const filteredFriends = MOCK_FRIENDS.filter(f => 
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col pt-0">
      <PanelHeader title={mode === 'list' ? "Friends" : "Add Friend"} onClose={onClose} />
      
      <div className="flex-grow flex flex-col overflow-hidden">
        {mode === 'list' ? (
          <>
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="relative flex-grow group">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#555] group-focus-within:text-red-500 transition-colors duration-200">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-white/10 pl-7 pr-4 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-red-500/60 focus:placeholder-white/30 transition-all duration-300"
                  />
                </div>
                <button 
                  onClick={() => setMode('add')}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                  title="Add Friend"
                >
                  <UserPlusIcon />
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto px-5 py-4 space-y-3">
              {filteredFriends.length === 0 ? (
                <p className="text-[#666666] text-sm text-center py-4">No friends found.</p>
              ) : (
                filteredFriends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-[#333] rounded-full flex items-center justify-center font-bold text-white">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1a1a] ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{friend.username}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/20">
                            {friend.badge}
                          </span>
                        </div>
                        <span className="text-xs text-[#888]">
                          {friend.isOnline ? 'Online' : friend.lastSeen}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <button 
                onClick={() => setMode('list')}
                className="text-[#888] hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <ArrowLeftIcon />
              </button>
              <div className="relative flex-grow">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Username or ID..."
                  value={addQuery}
                  onChange={(e) => setAddQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:border-white/30 focus:bg-[#1f1f25] transition-all"
                />
              </div>
            </div>
            
            <div className="flex-grow px-5 py-6">
              {addQuery.length < 3 ? (
                <div className="text-center text-[#666] text-sm">
                  <p>Type at least 3 characters to search</p>
                </div>
              ) : (
                <div className="animate-fade-in space-y-4">
                  <p className="text-xs text-[#888] font-semibold uppercase tracking-wider">Search Results</p>
                  
                  {/* Mocked Result */}
                  <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                        {addQuery.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white truncate max-w-[120px]">{addQuery}</span>
                        <span className="text-xs text-[#888]">ID: #{Math.floor(Math.random() * 9000) + 1000}</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-white hover:bg-gray-200 text-black text-xs font-bold rounded-lg transition-colors">
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Settings Panel Components ---

// A reusable container for a section within the settings panel
const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-4 px-5">
            {title}
        </h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

// Specific settings component for Crosshair
const CrosshairSettings = () => {
    const defaultSettings = { 
        length: 6, thickness: 2, gap: 4, hasDot: false, dotThickness: 2, color: '#00ff00',
        hasOutline: true, outlineThickness: 1
    };
    const [crosshair, setCrosshair] = useState(defaultSettings);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('aimX_crosshair');
        if (saved) {
            try { 
                setCrosshair({ ...defaultSettings, ...JSON.parse(saved) }); 
            } catch(e) {}
        }
    }, []);

    const updateSetting = (key: string, value: any) => {
        setCrosshair(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        localStorage.setItem('aimX_crosshair', JSON.stringify(crosshair));
        // Dispatch an event so GameCanvas or other components can update immediately
        window.dispatchEvent(new Event('crosshairChange'));
        
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 2000);
    };

    const d = Number(crosshair.gap) || 0;
    const l = Number(crosshair.length) || 0;
    const t = Number(crosshair.thickness) || 0;
    const dotT = Number(crosshair.dotThickness) || 0;
    const o = crosshair.hasOutline ? (Number(crosshair.outlineThickness) || 0) : 0;
    const totalSize = (d + l + o) * 2;
    const svgSize = Math.max(totalSize, 60);
    const center = svgSize / 2;

    return (
        <SettingsSection title="Crosshair">
            <div className="px-5 space-y-4">
                {/* Preview Box */}
                <div className="w-full h-32 bg-[#0c0c0e] border border-white/10 rounded-lg flex items-center justify-center relative shadow-inner overflow-hidden mb-2">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <svg width={svgSize} height={svgSize} overflow="visible" className="z-10">
                        {/* Outline Layer (Rendered First / Behind) */}
                        {crosshair.hasOutline && (
                            <>
                                {crosshair.hasDot && (
                                    <rect x={center - (dotT / 2) - o} y={center - (dotT / 2) - o} width={dotT + (o * 2)} height={dotT + (o * 2)} fill="#000000" />
                                )}
                                <rect x={center - (t / 2) - o} y={center - d - l - o} width={t + (o * 2)} height={l + (o * 2)} fill="#000000" />
                                <rect x={center - (t / 2) - o} y={center + d - o} width={t + (o * 2)} height={l + (o * 2)} fill="#000000" />
                                <rect x={center - d - l - o} y={center - (t / 2) - o} width={l + (o * 2)} height={t + (o * 2)} fill="#000000" />
                                <rect x={center + d - o} y={center - (t / 2) - o} width={l + (o * 2)} height={t + (o * 2)} fill="#000000" />
                            </>
                        )}
                        
                        {/* Color Layer (Rendered Last / On Top) */}
                        {crosshair.hasDot && (
                            <rect x={center - dotT / 2} y={center - dotT / 2} width={dotT} height={dotT} fill={crosshair.color} />
                        )}
                        <rect x={center - t / 2} y={center - d - l} width={t} height={l} fill={crosshair.color} />
                        <rect x={center - t / 2} y={center + d} width={t} height={l} fill={crosshair.color} />
                        <rect x={center - d - l} y={center - t / 2} width={l} height={t} fill={crosshair.color} />
                        <rect x={center + d} y={center - t / 2} width={l} height={t} fill={crosshair.color} />
                    </svg>
                </div>

                {/* Sliders */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-white/80">
                        <span>Length</span><span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{crosshair.length}</span>
                    </div>
                    <input type="range" min="1" max="30" step="1" value={crosshair.length} onChange={(e) => updateSetting('length', parseInt(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-white/80">
                        <span>Thickness</span><span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{crosshair.thickness}</span>
                    </div>
                    <input type="range" min="1" max="14" step="1" value={crosshair.thickness} onChange={(e) => updateSetting('thickness', parseInt(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-white/80">
                        <span>Center Gap</span><span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{crosshair.gap}</span>
                    </div>
                    <input type="range" min="0" max="30" step="1" value={crosshair.gap} onChange={(e) => updateSetting('gap', parseInt(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>

                {/* Dot Slider (Conditional) */}
                {crosshair.hasDot && (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs text-white/80">
                            <span>Dot Thickness</span><span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{crosshair.dotThickness}</span>
                        </div>
                        <input type="range" min="1" max="14" step="1" value={crosshair.dotThickness} onChange={(e) => updateSetting('dotThickness', parseInt(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
                    </div>
                )}

                {/* Outline Sliders (Conditional) */}
                {crosshair.hasOutline && (
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs text-white/80">
                            <span>Outline Thickness</span><span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{crosshair.outlineThickness}</span>
                        </div>
                        <input type="range" min="1" max="5" step="1" value={crosshair.outlineThickness} onChange={(e) => updateSetting('outlineThickness', parseInt(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
                    </div>
                )}

                {/* Dot & Color Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/80">Center Dot</span>
                            <button onClick={() => updateSetting('hasDot', !crosshair.hasDot)} className={`w-8 h-4 rounded-full relative transition-colors ${crosshair.hasDot ? 'bg-indigo-500' : 'bg-white/20'}`}>
                                <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] transition-all ${crosshair.hasDot ? 'left-[18px]' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-white/80">Color</span>
                            <input type="color" value={crosshair.color} onChange={(e) => updateSetting('color', e.target.value)} className="w-6 h-6 bg-transparent border-0 rounded cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/80">Outline</span>
                            <button onClick={() => updateSetting('hasOutline', !crosshair.hasOutline)} className={`w-8 h-4 rounded-full relative transition-colors ${crosshair.hasOutline ? 'bg-indigo-500' : 'bg-white/20'}`}>
                                <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] transition-all ${crosshair.hasOutline ? 'left-[18px]' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-3">
                    <button 
                        onClick={handleSubmit} 
                        className={`w-full font-bold py-2.5 rounded-lg transition-all text-sm uppercase tracking-wide flex justify-center items-center gap-2 ${
                            isSubmitted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white text-black hover:bg-gray-200'
                        }`}
                    >
                        {isSubmitted ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Saved!
                            </>
                        ) : (
                            'Submit'
                        )}
                    </button>
                </div>
            </div>
        </SettingsSection>
    );
};

// Specific settings component for Hit Sounds
const SoundSettings = () => {
    interface SoundOption { id: string; name: string; file: string; startOffset?: number; volume?: number; }
    const soundOptions: SoundOption[] = [
        { id: 'hitmarker', name: 'Hitmarker', file: 'hitmarker.mp3', volume: 0.8 },
        { id: 'pop', name: 'Pop', file: 'Pop.mp3', startOffset: 0.08, volume: 1.5 },
        { id: 'tick', name: 'Tick', file: 'Tick.mp3', volume: 1.0 },
        { id: 'click', name: 'Click', file: 'Click.mp3', volume: 0.9 },
        { id: 'retro', name: 'Retro', file: 'Retro.mp3', volume: 0.7 },
    ];

    const [selectedSound, setSelectedSound] = useState('hitmarker');
    const [playingSound, setPlayingSound] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    useEffect(() => {
        let saved = localStorage.getItem('aimX_hitSound');
        if (saved) {
            if (saved.startsWith('{') || saved.startsWith('"')) {
                try {
                    const parsed = JSON.parse(saved);
                    saved = parsed.id || parsed || 'hitmarker';
                } catch(e) {}
            }
            if (saved) setSelectedSound(saved as string);
        }
        
        // Initialize AudioContext on client
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);

        return () => {
            audioContextRef.current?.close();
        }
    }, []);

    const handleSoundSelect = (soundId: string) => {
        setSelectedSound(soundId);
        localStorage.setItem('aimX_hitSound', soundId);
    };

    const playSound = (sound: SoundOption) => {
        if (!audioContextRef.current || !gainNodeRef.current) return;

        if (audioRef.current) {
            audioRef.current.pause();
        }
        setPlayingSound(sound.id);

        const audio = new Audio(`/sounds/${sound.file}`);
        audioRef.current = audio;

        const source = audioContextRef.current.createMediaElementSource(audio);
        source.connect(gainNodeRef.current);
        
        // Set volume, allowing values > 1
        gainNodeRef.current.gain.value = sound.volume ?? 1.0;

        audio.onended = () => setPlayingSound(null);

        if (sound.startOffset) {
            audio.addEventListener('loadedmetadata', () => {
                audio.currentTime = sound.startOffset!;
                audio.play().catch(console.error);
            });
            // Fallback just in case loadedmetadata doesn't fire
            audio.play().catch(console.error);
        } else {
            audio.play().catch(console.error);
        }
    };

    return (
        <SettingsSection title="Audio">
            {soundOptions.map((sound) => {
                const isSelected = selectedSound === sound.id;
                return (
                    <div key={sound.id} onClick={() => handleSoundSelect(sound.id)}
                        className={`flex items-center justify-between p-2.5 mx-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-red-600/15' : 'bg-transparent hover:bg-white/5'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-red-500 text-white' : 'border-2 border-[#444444]'}`}>
                            </div>
                            <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'text-[#999999]'}`}>{sound.name}</span>
                            {sound.id === 'hitmarker' && <span className="text-[10px] text-[#666666] bg-white/5 px-1.5 py-0.5 rounded">DEFAULT</span>}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); playSound(sound); }}
                            className={`p-1.5 rounded-md transition-all ${playingSound === sound.id ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-[#666666] hover:text-white'}`}
                            aria-label={`Play ${sound.name} sound`}>
                            <SoundIcon />
                        </button>
                    </div>
                );
            })}
        </SettingsSection>
    );
}

// Main Settings Panel, which will contain all setting sections
const SettingsPanel = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="h-full flex flex-col bg-[#111114] panel-enter">
            <PanelHeader title="Settings" onClose={onClose} />
            <div className="flex-grow overflow-y-auto py-4">
                <CrosshairSettings />
                <div className="h-px w-full bg-white/5 my-6"></div>
                <SoundSettings />
                {/* Future settings sections can be added here */}
                {/* <VideoSettings /> */}
                {/* <MouseSettings /> */}
            </div>
            <div className="px-5 pb-4 border-t border-white/5 pt-3">
                <p className="text-xs text-[#555555] text-center">More settings coming soon.</p>
            </div>
        </div>
    );
};

// --- Analytics Panel ---
type TimeRange = '7d' | '14d' | '30d';

const analyticsData: Record<TimeRange, {
  scoreHistory: { label: string; score: number }[];
  accuracyHistory: { label: string; accuracy: number }[];
  summary: { avgScore: number; scoreDelta: number; avgAccuracy: number; accuracyDelta: number; avgReaction: number; reactionDelta: number; sessions: number; sessionsDelta: number };
  modePerformance: { mode: string; avgScore: number; avgAccuracy: number; trend: 'up' | 'down' | 'stable'; delta: number }[];
}> = {
  '7d': {
    scoreHistory: [
      { label: 'Mon', score: 42000 }, { label: 'Tue', score: 45200 }, { label: 'Wed', score: 43800 },
      { label: 'Thu', score: 48500 }, { label: 'Fri', score: 51200 }, { label: 'Sat', score: 49800 }, { label: 'Sun', score: 54300 },
    ],
    accuracyHistory: [
      { label: 'Mon', accuracy: 84.2 }, { label: 'Tue', accuracy: 86.1 }, { label: 'Wed', accuracy: 85.5 },
      { label: 'Thu', accuracy: 88.3 }, { label: 'Fri', accuracy: 89.7 }, { label: 'Sat', accuracy: 87.9 }, { label: 'Sun', accuracy: 91.2 },
    ],
    summary: { avgScore: 47829, scoreDelta: 12.4, avgAccuracy: 87.6, accuracyDelta: 3.2, avgReaction: 238, reactionDelta: -8, sessions: 21, sessionsDelta: 5 },
    modePerformance: [
      { mode: 'Gridshot', avgScore: 54300, avgAccuracy: 92.1, trend: 'up', delta: 4.2 },
      { mode: 'Flick Shot', avgScore: 48100, avgAccuracy: 85.3, trend: 'up', delta: 2.1 },
      { mode: 'Tracking', avgScore: 31200, avgAccuracy: 71.2, trend: 'down', delta: -3.5 },
      { mode: 'Precision', avgScore: 44800, avgAccuracy: 88.7, trend: 'stable', delta: 0.3 },
      { mode: 'Reflex', avgScore: 39800, avgAccuracy: 79.5, trend: 'down', delta: -2.1 },
    ],
  },
  '14d': {
    scoreHistory: [
      { label: 'D1', score: 38500 }, { label: 'D3', score: 41000 }, { label: 'D5', score: 42500 },
      { label: 'D7', score: 44200 }, { label: 'D9', score: 45200 }, { label: 'D11', score: 48500 }, { label: 'D14', score: 54300 },
    ],
    accuracyHistory: [
      { label: 'D1', accuracy: 80.1 }, { label: 'D3', accuracy: 82.5 }, { label: 'D5', accuracy: 83.7 },
      { label: 'D7', accuracy: 85.0 }, { label: 'D9', accuracy: 86.1 }, { label: 'D11', accuracy: 88.3 }, { label: 'D14', accuracy: 91.2 },
    ],
    summary: { avgScore: 44579, scoreDelta: 18.7, avgAccuracy: 84.7, accuracyDelta: 5.8, avgReaction: 251, reactionDelta: -15, sessions: 38, sessionsDelta: 12 },
    modePerformance: [
      { mode: 'Gridshot', avgScore: 51200, avgAccuracy: 90.4, trend: 'up', delta: 5.8 },
      { mode: 'Flick Shot', avgScore: 45600, avgAccuracy: 83.1, trend: 'up', delta: 3.7 },
      { mode: 'Tracking', avgScore: 29800, avgAccuracy: 69.8, trend: 'down', delta: -4.2 },
      { mode: 'Precision', avgScore: 43200, avgAccuracy: 87.2, trend: 'up', delta: 1.5 },
      { mode: 'Reflex', avgScore: 37500, avgAccuracy: 77.8, trend: 'stable', delta: -0.4 },
    ],
  },
  '30d': {
    scoreHistory: [
      { label: 'W1', score: 35200 }, { label: 'W2', score: 38900 },
      { label: 'W3', score: 43500 }, { label: 'W4', score: 48100 },
    ],
    accuracyHistory: [
      { label: 'W1', accuracy: 76.4 }, { label: 'W2', accuracy: 80.2 },
      { label: 'W3', accuracy: 84.8 }, { label: 'W4', accuracy: 88.5 },
    ],
    summary: { avgScore: 41425, scoreDelta: 24.3, avgAccuracy: 82.5, accuracyDelta: 9.1, avgReaction: 262, reactionDelta: -24, sessions: 72, sessionsDelta: 28 },
    modePerformance: [
      { mode: 'Gridshot', avgScore: 48700, avgAccuracy: 88.2, trend: 'up', delta: 8.4 },
      { mode: 'Flick Shot', avgScore: 42300, avgAccuracy: 80.5, trend: 'up', delta: 6.2 },
      { mode: 'Tracking', avgScore: 27500, avgAccuracy: 67.3, trend: 'stable', delta: -1.2 },
      { mode: 'Precision', avgScore: 41800, avgAccuracy: 85.9, trend: 'up', delta: 4.1 },
      { mode: 'Reflex', avgScore: 35200, avgAccuracy: 75.4, trend: 'up', delta: 2.8 },
    ],
  },
};

const AnalyticsPanel = ({ onClose }: { onClose: () => void }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const data = analyticsData[timeRange];

  // Reusable chart renderer
  const renderChart = (
    dataPoints: { label: string; value: number }[],
    gradientId: string,
    color: string = '#dc2626'
  ) => {
    const chartWidth = 260;
    const chartHeight = 100;
    const maxVal = Math.max(...dataPoints.map(d => d.value));
    const minVal = Math.min(...dataPoints.map(d => d.value));
    const valRange = maxVal - minVal || 1;

    const points = dataPoints.map((d, i) => {
      const x = (i / (dataPoints.length - 1)) * chartWidth;
      const y = chartHeight - ((d.value - minVal) / valRange) * (chartHeight - 10) - 5;
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

    return (
      <>
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[100px]" preserveAspectRatio="none">
            <polygon points={areaPoints} fill={`url(#${gradientId})`} opacity="0.3" />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {dataPoints.map((d, i) => {
              const x = (i / (dataPoints.length - 1)) * chartWidth;
              const y = chartHeight - ((d.value - minVal) / valRange) * (chartHeight - 10) - 5;
              return <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="#0c0c0e" strokeWidth="1.5" />;
            })}
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex justify-between mt-2 px-1">
          {dataPoints.map((d, i) => (
            <span key={i} className="text-[9px] text-white/25">{d.label}</span>
          ))}
        </div>
      </>
    );
  };

  // Generate recommendation based on declining modes
  const decliningModes = data.modePerformance.filter(m => m.trend === 'down');
  const weakestMode = data.modePerformance.reduce((prev, curr) => prev.avgAccuracy < curr.avgAccuracy ? prev : curr);

  const getRecommendation = () => {
    if (decliningModes.length > 0) {
      const mode = decliningModes[0];
      if (mode.mode === 'Tracking') return `Your Tracking accuracy is declining (${mode.delta}%). Try playing Smooth Aiming to rebuild your fundamentals.`;
      if (mode.mode === 'Reflex') return `Your Reflex performance is dropping (${mode.delta}%). Play Reflex Shots to sharpen your reaction time.`;
      return `Your ${mode.mode} performance is declining (${mode.delta}%). Focus on dedicated ${mode.mode} sessions to reverse the trend.`;
    }
    return `Great progress across all modes! Keep training ${weakestMode.mode} to round out your skills.`;
  };

  return (
    <div className="h-full flex flex-col bg-[#111114] panel-enter">
      <PanelHeader title="Analytics" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* Time Range Selector */}
        <div className="flex gap-1 p-1 bg-[#0c0c0e] rounded-lg border border-white/5">
          {(['7d', '14d', '30d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                timeRange === range
                  ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '14d' ? '14 Days' : '30 Days'}
            </button>
          ))}
        </div>

        {/* Score Progress Chart */}
        <div className="bg-[#0c0c0e] rounded-xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Score Progress</h4>
            <span className="text-[10px] text-white/30">{timeRange === '7d' ? 'Last 7 days' : timeRange === '14d' ? 'Last 14 days' : 'Last 30 days'}</span>
          </div>
          {renderChart(
            data.scoreHistory.map(d => ({ label: d.label, value: d.score })),
            'scoreGradient',
            '#dc2626'
          )}
        </div>

        {/* Accuracy Progress Chart */}
        <div className="bg-[#0c0c0e] rounded-xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Accuracy Progress</h4>
            <span className="text-[10px] text-white/30">{timeRange === '7d' ? 'Last 7 days' : timeRange === '14d' ? 'Last 14 days' : 'Last 30 days'}</span>
          </div>
          {renderChart(
            data.accuracyHistory.map(d => ({ label: d.label, value: d.accuracy })),
            'accuracyGradient',
            '#22c55e'
          )}
        </div>

        {/* Period Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0c0c0e] rounded-xl border border-white/5 p-4">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Avg Score</div>
            <div className="text-xl font-bold text-white">{data.summary.avgScore.toLocaleString()}</div>
            <div className={`text-[10px] mt-1 font-medium ${data.summary.scoreDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.summary.scoreDelta >= 0 ? '↑' : '↓'} {Math.abs(data.summary.scoreDelta)}%
            </div>
          </div>
          <div className="bg-[#0c0c0e] rounded-xl border border-white/5 p-4">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Avg Accuracy</div>
            <div className="text-xl font-bold text-white">{data.summary.avgAccuracy}%</div>
            <div className={`text-[10px] mt-1 font-medium ${data.summary.accuracyDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.summary.accuracyDelta >= 0 ? '↑' : '↓'} {Math.abs(data.summary.accuracyDelta)}%
            </div>
          </div>
          <div className="bg-[#0c0c0e] rounded-xl border border-white/5 p-4">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Avg Reaction</div>
            <div className="text-xl font-bold text-white">{data.summary.avgReaction}<span className="text-xs text-white/50">ms</span></div>
            <div className={`text-[10px] mt-1 font-medium ${data.summary.reactionDelta <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.summary.reactionDelta <= 0 ? '↑' : '↓'} {Math.abs(data.summary.reactionDelta)}ms
            </div>
          </div>
          <div className="bg-[#0c0c0e] rounded-xl border border-white/5 p-4">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Sessions</div>
            <div className="text-xl font-bold text-white">{data.summary.sessions}</div>
            <div className={`text-[10px] mt-1 font-medium ${data.summary.sessionsDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.summary.sessionsDelta >= 0 ? '+' : ''}{data.summary.sessionsDelta} vs prev
            </div>
          </div>
        </div>

        {/* Mode Performance Breakdown */}
        <div className="bg-[#0c0c0e] rounded-xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Mode Performance</h4>
            <div className="relative group">
              <div className="p-1 rounded-md cursor-pointer text-[#555555] hover:text-red-400 hover:bg-red-500/10 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
              </div>
              <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <p className="text-[11px] text-white/70 leading-relaxed">{getRecommendation()}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {data.modePerformance.map((mode) => (
              <div key={mode.mode} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70 font-medium truncate">{mode.mode}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/40">{mode.avgScore.toLocaleString()}</span>
                      <span className="text-xs font-mono text-white/60">{mode.avgAccuracy}%</span>
                      <span className={`text-[10px] font-medium ${
                        mode.trend === 'up' ? 'text-green-400' :
                        mode.trend === 'down' ? 'text-red-400' :
                        'text-white/30'
                      }`}>
                        {mode.trend === 'up' ? '↑' : mode.trend === 'down' ? '↓' : '→'}
                        {mode.delta > 0 ? '+' : ''}{mode.delta}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        mode.avgAccuracy >= 90 ? 'bg-green-500' :
                        mode.avgAccuracy >= 80 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${mode.avgAccuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Games */}
        {/* Recent Games */}
        <div className="bg-[#0c0c0e] rounded-xl border border-white/5 p-4">
          <h4 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">Recent Games</h4>
          <div className="space-y-1">
            {[
              { mode: 'Gridshot', score: 54300, accuracy: 94.2, time: '2m ago' },
              { mode: 'Flick Shot', score: 48100, accuracy: 86.7, time: '15m ago' },
              { mode: 'Tracking', score: 31200, accuracy: 72.4, time: '32m ago' },
              { mode: 'Reflex Shots', score: 39800, accuracy: 78.1, time: '1h ago' },
              { mode: 'Microshot', score: 51600, accuracy: 91.3, time: '2h ago' },
            ].map((game, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-white/70 truncate">{game.mode}</span>
                  <span className="text-[9px] text-white/25">{game.time}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-mono ${
                    game.accuracy >= 90 ? 'text-green-400' :
                    game.accuracy >= 80 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {game.accuracy}%
                  </span>
                  <span className="text-xs font-mono font-bold text-white/50">{game.score.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;

