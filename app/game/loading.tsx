export default function Loading() {
  return (
    <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center font-sans" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-6">
        {/* Animated reticle */}
        <div className="relative w-16 h-16" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-red-500/40 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-bold text-white tracking-[0.3em] uppercase">
            Loading Arena
          </div>
          <div className="text-xs text-white/40 tracking-wider">
            Preparing targets...
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-red-500 to-transparent loading-bar" />
        </div>
      </div>

      <span className="sr-only">Loading game arena. Please wait.</span>
    </div>
  );
}
