"use client";

import { useEffect, useState } from "react";
import { Download, X, Info } from "lucide-react";
import Image from "next/image";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const isIPad = !!ua.match(/iPad/i);
    const isIPhone = !!ua.match(/iPhone/i);
    const isIOSDevice = isIPad || isIPhone;
    const isSafari = isIOSDevice && webkit && !ua.match(/CriOS/i);
    
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone);

    if (isStandalone) {
      return; // Already installed
    }

    if (isSafari) {
      setIsIOS(true);
      // Show for iOS after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-primary/50 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-500">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/20 blur-[50px] -z-10 rounded-full" />
        
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors bg-background/50 p-1 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center overflow-hidden rounded-2xl bg-background border border-card-border shadow-[0_0_15px_rgba(6,182,212,0.4)] w-20 h-20">
            <Image 
              src="/logo.jpg" 
              alt="Logo" 
              width={80} 
              height={80} 
              className="object-cover"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-foreground">Install 777 ChainScan</h3>
            <p className="text-sm text-foreground/70 mt-2">
              For the best experience, install this app on your home screen. It's fast, secure, and works offline!
            </p>
          </div>

          {isIOS ? (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 w-full text-left flex gap-3 mt-4">
              <Info className="text-primary shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-primary/90">
                To install on iPhone/iPad: Tap the <strong>Share</strong> icon at the bottom, then scroll down and tap <strong>"Add to Home Screen"</strong>.
              </p>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 mt-2"
            >
              <Download size={20} />
              Install App Now
            </button>
          )}
          
          <button 
            onClick={() => setShowPrompt(false)}
            className="text-xs text-foreground/50 hover:text-foreground transition-colors mt-2 underline-offset-4 hover:underline"
          >
            Not right now
          </button>
        </div>
      </div>
    </div>
  );
}
