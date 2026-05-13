'use client';

import React, { useState, useEffect, useRef } from 'react';

// Settings gear icon (matching theme)
const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// Sound/speaker icon for playing preview
const SoundIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

// Close icon
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

// Check icon for selected state
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface SoundOption {
  id: string;
  name: string;
  file: string;
  startOffset?: number;
}

const soundOptions: SoundOption[] = [
  { id: 'hitmarker', name: 'Hitmarker', file: 'hitmarker.mp3' },
  { id: 'ding', name: 'Ding', file: 'Ding.mp3' },
  { id: 'pop', name: 'Pop', file: 'Pop.mp3', startOffset: 0.08 },
  { id: 'tick', name: 'Tick', file: 'Tick.mp3' },
];

export function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState('hitmarker');
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aimX_hitSound');
    if (saved) {
      setSelectedSound(saved);
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSoundSelect = (soundId: string) => {
    setSelectedSound(soundId);
    localStorage.setItem('aimX_hitSound', soundId);
  };

  const playSound = (soundFile: string, soundId: string, startOffset?: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingSound(soundId);
    const audio = new Audio(`/sounds/${soundFile}`);
    audioRef.current = audio;
    if (startOffset) {
      audio.currentTime = startOffset;
    }
    audio.play().catch(console.error);
    audio.onended = () => setPlayingSound(null);
  };

  return (
    <>
      {/* Settings Button - Inline for navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 md:p-2.5 rounded-xl bg-[#0f0f0f] border border-white/10 text-[#666666] hover:text-white hover:bg-[#1a1a1f] hover:border-white/20 transition-all duration-200"
        aria-label="Settings"
      >
        <SettingsIcon />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ margin: 0 }}
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop - Full screen blur */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-lg" />

          {/* Modal */}
          <div
            className="relative w-full max-w-md bg-[#111114] border border-white/10 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden"
            style={{ animation: 'modalFadeIn 0.2s ease-out', transform: 'translateZ(0)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-[#666666] hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label="Close settings"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-[#888888] uppercase tracking-wider mb-4">
                  Hit Sound
                </h3>
                <div className="space-y-2">
                  {soundOptions.map((sound) => {
                    const isSelected = selectedSound === sound.id;
                    const isPlaying = playingSound === sound.id;
                    return (
                      <div
                        key={sound.id}
                        className={`
                          flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200
                          ${isSelected
                            ? 'bg-red-600/15 border border-red-500/30'
                            : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                          }
                        `}
                        onClick={() => handleSoundSelect(sound.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200
                            ${isSelected ? 'bg-red-500 text-white' : 'border-2 border-[#444444]'}
                          `}>
                            {isSelected && <CheckIcon />}
                          </div>
                          <span className={`font-medium transition-colors ${isSelected ? 'text-white' : 'text-[#999999]'}`}>
                            {sound.name}
                          </span>
                          {sound.id === 'hitmarker' && (
                            <span className="text-[10px] text-[#666666] bg-white/5 px-1.5 py-0.5 rounded">DEFAULT</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playSound(sound.file, sound.id, sound.startOffset);
                          }}
                          className={`
                            p-2 rounded-lg transition-all duration-200
                            ${isPlaying
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-white/5 text-[#666666] hover:text-white hover:bg-white/10'
                            }
                          `}
                          aria-label={`Play ${sound.name} sound`}
                        >
                          <SoundIcon />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-5 pb-5">
              <p className="text-[11px] text-[#555555] text-center">
                Click the sound icon to preview each sound
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings;
