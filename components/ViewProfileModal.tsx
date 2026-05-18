'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMockProfile } from '@/lib/mockProfile';

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: {
    id: string;
    username: string;
    badge: string;
  };
  onRemoveFriend?: () => void;
}

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const UserIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const getBadgeColor = (badge: string): string => {
  const colors: Record<string, string> = {
    "Aim Addict": "text-purple-400",
    "High Roller": "text-orange-400",
    "Legendary Run": "text-orange-500",
    "Magnet Aim": "text-cyan-400",
    "Sharp Eyes": "text-teal-400",
    "Top 1%": "text-yellow-300",
    "Top 5%": "text-slate-300",
    "Top 10%": "text-amber-500",
    "Ultra Instinct": "text-fuchsia-400",
    "Aim Never Sleeps": "text-purple-400",
    "Endless Training": "text-blue-400",
    "Lightning Reflex": "text-blue-400",
    "Missed Everything": "text-orange-400",
    "Potato Aim": "text-amber-600",
    "Quickscope": "text-cyan-400",
    "Skull Cracker": "text-red-500",
    "Weekly Warrior": "text-green-400",
    "Grandmaster": "text-yellow-300",
    "Ascendant": "text-fuchsia-400",
    "Bronze": "text-amber-600",
  };
  return colors[badge] || "text-white/50";
};

function formatPlayTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy > 85) return 'text-green-400';
  if (accuracy > 70) return 'text-amber-400';
  return 'text-red-400';
}

function generateDisplayId(playerId: string): string {
  return `372${Math.abs(playerId.split('').reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0)).toString().padStart(6, '0').slice(0, 6)}`;
}

const CopyableId = ({ playerId }: { playerId: string }) => {
  const [copied, setCopied] = useState(false);
  const displayId = generateDisplayId(playerId);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-white/30 hover:text-white/50 transition-colors flex items-center gap-1.5 cursor-pointer"
      title="Copy ID"
    >
      {displayId}
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
};

export default function ViewProfileModal({ isOpen, onClose, player, onRemoveFriend }: ViewProfileModalProps) {
  const profileData = useMemo(() => {
    if (!player.id) return null;
    return generateMockProfile(player.id);
  }, [player.id]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && profileData && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-[#111114] border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden max-h-[85vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Player Profile
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Profile Section */}
              <div className="px-6 py-6 flex flex-col items-center border-b border-white/5">
                {/* Avatar with border */}
                <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                  {profileData.equippedBorder && (
                    <img
                      src={`/images/${encodeURIComponent(profileData.equippedBorder)}`}
                      alt="Profile border"
                      className="absolute inset-0 w-24 h-24 object-contain pointer-events-none z-10"
                    />
                  )}
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    <span className="text-white/40">
                      <UserIcon />
                    </span>
                  </div>
                </div>

                {/* Username */}
                <h3 className="text-xl font-bold text-white mb-1">
                  {player.username || 'Unknown Player'}
                </h3>

                {/* Badge/Title */}
                {player.badge && (
                  <span className={`text-sm font-semibold ${getBadgeColor(player.badge)} mb-2`}>
                    {player.badge}
                  </span>
                )}

                {/* User ID - copyable */}
                <CopyableId playerId={player.id} />
              </div>

              {/* Badges Section */}
              <div className="px-6 py-5 border-b border-white/5">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                  Badges
                </h4>
                <div className="flex items-center gap-3 justify-center">
                  {[0, 1, 2].map((slotIndex) => {
                    const badge = profileData.equippedBadges[slotIndex];
                    return badge ? (
                      <div
                        key={slotIndex}
                        className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden"
                        title={badge.replace('.png', '')}
                      >
                        <img
                          src={`/images/${encodeURIComponent(badge)}`}
                          alt={badge.replace('.png', '')}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        key={slotIndex}
                        className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center"
                      >
                        <span className="text-white/20 text-xs">—</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats Section */}
              <div className="px-6 py-5">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
                  Stats
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {/* Total Play Time */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Play Time</p>
                    <p className="text-sm font-bold text-white font-mono">
                      {formatPlayTime(profileData.stats.totalPlayTime)}
                    </p>
                  </div>

                  {/* Accuracy */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Accuracy</p>
                    <p className={`text-sm font-bold font-mono ${getAccuracyColor(profileData.stats.accuracy)}`}>
                      {profileData.stats.accuracy}%
                    </p>
                  </div>

                  {/* Favorite Mode */}
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Fav Mode</p>
                    <p className="text-xs font-bold text-white truncate" title={profileData.stats.favoriteMode}>
                      {profileData.stats.favoriteMode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Remove Friend Button - only shown when accessed from friend list */}
            {onRemoveFriend && (
              <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
                <button
                  onClick={onRemoveFriend}
                  className="w-full py-2.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-600/20 transition-colors"
                >
                  Remove Friend
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
