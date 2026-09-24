import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, X, Share2, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  isMidnight: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ isMidnight }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed PWA / standalone app, render a subtle installed badge
  if (isInstalled) {
    return (
      <div 
        id="pwa-installed-badge"
        className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
          isMidnight 
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
            : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
        }`}
        title="Running in Standalone App Mode"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Android App Active</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable ? (
        <button
          id="pwa-install-app-btn"
          onClick={install}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
            isMidnight
              ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.35)] hover:opacity-95'
              : 'bg-[#0284c7] text-white border-b-4 border-[#0369a1] hover:translate-y-[1px] hover:border-b-2 active:translate-y-[3px] active:border-b-0 shadow-sm'
          }`}
          title="Install Brights as an Android/Mobile App"
        >
          <Smartphone className="w-4 h-4" />
          <span>Install Android App</span>
        </button>
      ) : (
        <button
          id="pwa-guide-btn"
          onClick={() => setShowGuideModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isMidnight
              ? 'bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
          }`}
          title="How to install this app on your phone"
        >
          <Download className="w-3.5 h-3.5 text-sky-500" />
          <span className="hidden sm:inline">Install on Phone</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {/* Guide Modal for Android & iOS Users */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className={`w-full max-w-md rounded-2xl p-6 transition-all ${
              isMidnight 
                ? 'glass-panel border border-slate-700 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]' 
                : 'bg-white border-2 border-slate-200 shadow-[8px_8px_0px_0px_rgba(203,213,225,1)] text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-200/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Install on Android & Mobile</h3>
                  <p className="text-[11px] opacity-70">Run full-screen directly from your home screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg opacity-70 hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Android Chrome Instructions */}
              <div className={`p-3.5 rounded-xl border ${isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 font-black text-sky-500 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>On Android (Google Chrome / Brave / Edge):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 opacity-85 leading-relaxed font-medium">
                  <li>Open this app in <strong>Chrome</strong> on your Android phone.</li>
                  <li>Tap the <strong>three vertical dots (⋮)</strong> in the top-right menu.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Tap <strong>Install</strong> to add the Brights icon to your launcher!</li>
                </ol>
              </div>

              {/* iOS Safari Instructions */}
              <div className={`p-3.5 rounded-xl border ${isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 font-black text-pink-500 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>On iPhone / iPad (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 opacity-85 leading-relaxed font-medium">
                  <li>Tap the <strong>Share</strong> button (square with arrow pointing up) at the bottom.</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Confirm by tapping <strong>Add</strong> in the top-right.</li>
                </ol>
              </div>

              {/* Desktop Chrome / Edge */}
              <p className="text-[11px] opacity-65 italic text-center">
                Tip: On desktop Chrome/Edge, look for the ⊕ install icon in your URL address bar.
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isMidnight ? 'bg-sky-500 hover:bg-sky-400 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
