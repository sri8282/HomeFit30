/**
 * useInstallPrompt.ts
 * Tracks the PWA install prompt (Android/Chrome) and iOS detection.
 */
import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'homefit_install_dismissed_until';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

export interface InstallPromptState {
  isInstalled: boolean;
  isIOS: boolean;
  canInstallNatively: boolean;
  triggerInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  dismissForWeek: () => void;
  showInstallButton: boolean;
}

function isDismissedRecently(): boolean {
  try {
    const until = localStorage.getItem(DISMISSED_KEY);
    if (!until) return false;
    return Date.now() < Number(until);
  } catch {
    return false;
  }
}

export function useInstallPrompt(): InstallPromptState {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(isDismissedRecently);

  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !/(CriOS|FxiOS|OPiOS|chrome)/i.test(navigator.userAgent);

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    if (mq.matches || (navigator as any).standalone === true) {
      setIsInstalled(true);
    }
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handler = () => setIsInstalled(true);
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const triggerInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    return outcome;
  };

  const dismissForWeek = () => {
    try {
      localStorage.setItem(
        DISMISSED_KEY,
        String(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
    } catch { /* ignore */ }
    setDismissed(true);
  };

  const canInstallNatively = deferredPrompt !== null;
  const showInstallButton =
    !isInstalled && !dismissed && (canInstallNatively || isIOS);

  return {
    isInstalled,
    isIOS,
    canInstallNatively,
    triggerInstall,
    dismissForWeek,
    showInstallButton,
  };
}
