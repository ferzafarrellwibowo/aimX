'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidFileExtension } from '@/lib/challengeStore';
import { ProfileData, UnlockedReward } from '@/lib/challengeTypes';
import {
  NORMAL_BORDER_MILESTONES,
  LUXURY_BORDER_MILESTONES,
  BADGE_MILESTONES,
} from '@/lib/milestoneDefinitions';
import { MilestoneDefinition } from '@/lib/challengeTypes';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  unlockedRewards: UnlockedReward[];
  onSave: (data: ProfileData) => void;
}

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const UserIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

function getMilestoneRequirementText(milestone: MilestoneDefinition): string {
  const { condition } = milestone;
  switch (condition.type) {
    case 'total_challenges':
      return `Complete ${condition.threshold} challenges`;
    case 'streak_days':
      return `${condition.threshold}-day streak`;
    case 'perfect_days':
      return `${condition.threshold} perfect days`;
    case 'accuracy_avg':
      return `Maintain ${condition.threshold}% average accuracy`;
    case 'total_score':
      return `Earn ${condition.threshold.toLocaleString()} total score`;
    case 'total_sessions':
      return `Play ${condition.threshold} sessions`;
    case 'single_score':
      return `Score ${condition.threshold.toLocaleString()}+ in one session`;
    case 'reaction_best':
      return `React under ${condition.threshold}ms`;
    case 'leaderboard_percentile':
      return `Reach top ${condition.threshold}% on global leaderboard`;
    default:
      return '';
  }
}

function getTooltipText(milestone: MilestoneDefinition, unlocked: boolean, equipped: boolean): string {
  if (!unlocked) {
    return getMilestoneRequirementText(milestone);
  }
  if (equipped) {
    return `${milestone.rewardName} — Equipped`;
  }
  return `${milestone.rewardName} — Click to equip`;
}

function getBadgeColor(badge: string): string {
  const colors: Record<string, string> = {
    "Aim Addict": "text-purple-400",
    "Aim Never Sleeps": "text-purple-400",
    "Endless Training": "text-blue-400",
    "High Roller": "text-orange-400",
    "Legendary Run": "text-orange-500",
    "Lightning Reflex": "text-blue-400",
    "Magnet Aim": "text-cyan-400",
    "Missed Everything": "text-orange-400",
    "Potato Aim": "text-amber-600",
    "Quickscope": "text-cyan-400",
    "Sharp Eyes": "text-teal-400",
    "Skull Cracker": "text-red-500",
    "Top 1%": "text-yellow-300",
    "Top 5%": "text-slate-300",
    "Top 10%": "text-amber-500",
    "Ultra Instinct": "text-fuchsia-400",
    "Weekly Warrior": "text-green-400",
  };
  return colors[badge] || "text-white/80";
}

// --- Tooltip wrapper ---
const TooltipWrapper = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="relative group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1a1a1f] border border-white/10 rounded-md text-[11px] text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] shadow-lg max-w-[200px] text-center whitespace-normal">
      {text}
    </div>
  </div>
);

export default function EditProfileModal({
  isOpen,
  onClose,
  profileData,
  unlockedRewards,
  onSave,
}: EditProfileModalProps) {
  const [localProfilePicture, setLocalProfilePicture] = useState<string | null>(
    profileData.profilePicture
  );
  const [localEquippedBorder, setLocalEquippedBorder] = useState<string | null>(
    profileData.equippedBorder
  );
  const [localEquippedBadges, setLocalEquippedBadges] = useState<string[]>(
    profileData.equippedBadges || []
  );
  const [localEquippedTitle, setLocalEquippedTitle] = useState<string | null>(
    profileData.equippedTitle || null
  );
  const [titleDropdownOpen, setTitleDropdownOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allBorderMilestones = [...NORMAL_BORDER_MILESTONES, ...LUXURY_BORDER_MILESTONES];

  // Get unlocked badge names for title selection
  const unlockedBadgeNames = BADGE_MILESTONES
    .filter(m => unlockedRewards.some(r => r.milestoneId === m.id))
    .map(m => m.rewardName);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidFileExtension(file.name)) {
      setFileError('Invalid file type. Only .png, .jpg, and .jpeg are allowed.');
      return;
    }

    setFileError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setLocalProfilePicture(reader.result as string);
    };
    reader.onerror = () => {
      setFileError('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleRemovePicture = () => {
    setLocalProfilePicture(null);
    setFileError(null);
  };

  const isRewardUnlocked = (milestoneId: string): boolean => {
    return unlockedRewards.some((r) => r.milestoneId === milestoneId);
  };

  const handleBorderClick = (filename: string, milestoneId: string) => {
    if (!isRewardUnlocked(milestoneId)) return;

    // Toggle: deselect if already selected
    if (localEquippedBorder === filename) {
      setLocalEquippedBorder(null);
    } else {
      setLocalEquippedBorder(filename);
    }
  };

  const handleBadgeClick = (filename: string, milestoneId: string) => {
    if (!isRewardUnlocked(milestoneId)) return;

    if (localEquippedBadges.includes(filename)) {
      // Remove
      setLocalEquippedBadges(prev => prev.filter(b => b !== filename));
    } else if (localEquippedBadges.length < 3) {
      // Add
      setLocalEquippedBadges(prev => [...prev, filename]);
    }
    // If already 3, do nothing (the UI will show the limit message)
  };

  const handleSave = () => {
    onSave({
      profilePicture: localProfilePicture,
      equippedBorder: localEquippedBorder,
      equippedBadges: localEquippedBadges,
      equippedTitle: localEquippedTitle,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-[#111114] border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden max-h-[90vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Edit Profile
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="overflow-y-auto overflow-x-hidden flex-1">
            <div className="px-6 py-5 space-y-6">
              {/* Profile Picture Section */}
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-3">
                  Profile Picture
                </h3>
                <div className="flex items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {localProfilePicture ? (
                      <img
                        src={localProfilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white/40">
                        <UserIcon />
                      </span>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleUploadClick}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <UploadIcon />
                      Upload Photo
                    </button>
                    {localProfilePicture && (
                      <button
                        onClick={handleRemovePicture}
                        className="px-3.5 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {fileError && (
                  <p className="mt-2 text-xs text-red-400">{fileError}</p>
                )}
              </div>

              {/* Separator */}
              <div className="h-px w-full bg-white/10" />

              {/* Title Selection */}
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-3">
                  Title
                </h3>
                <div className="relative">
                  <button
                    onClick={() => setTitleDropdownOpen(!titleDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-[#1a1a1f] border border-white/10 rounded-lg text-sm hover:border-white/20 transition-colors"
                  >
                    <span className={localEquippedTitle ? getBadgeColor(localEquippedTitle) + ' font-medium' : 'text-white/40'}>
                      {localEquippedTitle || 'No title selected'}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-white/40 transition-transform ${titleDropdownOpen ? 'rotate-180' : ''}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {titleDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-[61]" onClick={() => setTitleDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl z-[62] max-h-48 overflow-y-auto">
                        {/* No title option */}
                        <button
                          onClick={() => { setLocalEquippedTitle(null); setTitleDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!localEquippedTitle ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        >
                          No title
                        </button>
                        {unlockedBadgeNames.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-white/30">
                            Unlock badges to use them as titles
                          </div>
                        ) : (
                          unlockedBadgeNames.map(name => (
                            <button
                              key={name}
                              onClick={() => { setLocalEquippedTitle(name); setTitleDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${localEquippedTitle === name ? 'bg-white/10' : 'hover:bg-white/5'} ${getBadgeColor(name)}`}
                            >
                              {name}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Border Selection Section — merged Normal + Luxury */}
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-4">
                  Borders
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {allBorderMilestones.map((milestone) => {
                    const unlocked = isRewardUnlocked(milestone.id);
                    const equipped = localEquippedBorder === milestone.rewardImage;
                    const tooltipText = getTooltipText(milestone, unlocked, equipped);

                    return (
                      <TooltipWrapper
                        key={milestone.id}
                        text={tooltipText}
                      >
                        <button
                          onClick={() =>
                            handleBorderClick(
                              milestone.rewardImage,
                              milestone.id
                            )
                          }
                          disabled={!unlocked}
                          className={`
                            relative w-full aspect-square rounded-xl border-2 overflow-hidden transition-all duration-200
                            flex items-center justify-center
                            ${
                              equipped
                                ? 'border-red-500 ring-2 ring-red-500 ring-offset-1 ring-offset-[#111114]'
                                : unlocked
                                  ? 'border-white/10 hover:border-white/30'
                                  : 'border-white/5 cursor-not-allowed'
                            }
                          `}
                        >
                          <img
                            src={`/images/${encodeURIComponent(milestone.rewardImage)}`}
                            alt={milestone.rewardName}
                            className={`w-14 h-14 object-contain ${
                              unlocked
                                ? 'opacity-100'
                                : 'opacity-40 grayscale'
                            }`}
                          />
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <span className="text-white/60">
                                <LockIcon />
                              </span>
                            </div>
                          )}
                          {equipped && unlocked && (
                            <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-500 border border-[#111114]" />
                          )}
                        </button>
                      </TooltipWrapper>
                    );
                  })}
                </div>
              </div>

              {/* Badge Selection Section */}
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-1">
                  Badges
                </h3>
                <p className="text-xs text-white/40 mb-4">Select up to 3 badges</p>
                <div className="grid grid-cols-4 gap-3">
                  {BADGE_MILESTONES.map((milestone) => {
                    const unlocked = isRewardUnlocked(milestone.id);
                    const equipped = localEquippedBadges.includes(milestone.rewardImage);
                    const tooltipText = getTooltipText(milestone, unlocked, equipped);

                    return (
                      <TooltipWrapper
                        key={milestone.id}
                        text={tooltipText}
                      >
                        <button
                          onClick={() =>
                            handleBadgeClick(
                              milestone.rewardImage,
                              milestone.id
                            )
                          }
                          disabled={!unlocked}
                          className={`
                            relative w-full aspect-square rounded-xl border-2 overflow-hidden transition-all duration-200
                            flex items-center justify-center
                            ${
                              equipped
                                ? 'border-red-500 ring-2 ring-red-500 ring-offset-1 ring-offset-[#111114]'
                                : unlocked
                                  ? 'border-white/10 hover:border-white/30'
                                  : 'border-white/5 cursor-not-allowed'
                            }
                          `}
                        >
                          <img
                            src={`/images/${encodeURIComponent(milestone.rewardImage)}`}
                            alt={milestone.rewardName}
                            className={`w-14 h-14 object-contain ${
                              unlocked
                                ? 'opacity-100'
                                : 'opacity-40 grayscale'
                            }`}
                          />
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <span className="text-white/60">
                                <LockIcon />
                              </span>
                            </div>
                          )}
                          {equipped && unlocked && (
                            <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-green-500 border border-[#111114]" />
                          )}
                        </button>
                      </TooltipWrapper>
                    );
                  })}
                </div>
                <p className="text-xs text-white/40 mt-2">
                  {localEquippedBadges.length}/3 badges selected
                  {localEquippedBadges.length >= 3 && <span className="text-amber-400 ml-2">Maximum reached</span>}
                </p>
              </div>
            </div>
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors shadow-[0_0_16px_rgba(220,38,38,0.2)]"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
