/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { LandingScreen } from './components/LandingScreen';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { HomeScreen } from './components/HomeScreen';
import { DayPreviewModal } from './components/DayPreviewModal';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import {
  getUserProfile,
  UserProfile,
  DayWorkout,
  migrateLocalStorageToSupabase,
} from './dataService';
import { getCurrentUser, signOut, onAuthStateChange } from './authService';

// Which top-level screen to display
type AppScreen = 'landing' | 'login' | 'onboarding' | 'home';

export default function App() {
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [screen, setScreen] = useState<AppScreen>('landing');

  // Day preview + workout player launched from Landing B
  const [landingPreviewWorkout, setLandingPreviewWorkout] = useState<DayWorkout | null>(null);
  const [landingActiveWorkout, setLandingActiveWorkout] = useState<DayWorkout | null>(null);

  const loadUserSessionAndProfile = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsUserLoggedIn(true);
        await migrateLocalStorageToSupabase(user.id);
        const loadedProfile = await getUserProfile(user.id);
        setProfile(loadedProfile);
        setHasCompletedOnboarding(loadedProfile !== null);
        if (loadedProfile) {
          setScreen('landing');
        } else {
          setScreen('onboarding');
        }
      } else {
        setIsUserLoggedIn(false);
        setHasCompletedOnboarding(false);
        setProfile(null);
        setScreen('landing');
      }
    } catch (err) {
      console.error('Error initializing user session/profile:', err);
      setIsUserLoggedIn(false);
      setHasCompletedOnboarding(false);
      setProfile(null);
      setScreen('landing');
    } finally {
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    loadUserSessionAndProfile();

    const subscription = onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsUserLoggedIn(true);
        await migrateLocalStorageToSupabase(session.user.id);
        const loadedProfile = await getUserProfile(session.user.id);
        setProfile(loadedProfile);
        setHasCompletedOnboarding(loadedProfile !== null);
        if (loadedProfile) {
          setScreen('landing');
        } else {
          setScreen('onboarding');
        }
      } else {
        setIsUserLoggedIn(false);
        setHasCompletedOnboarding(false);
        setProfile(null);
        setScreen('landing');
      }
      setSessionChecked(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserSessionAndProfile]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleLoginSuccess = async () => {
    setSessionChecked(false);
    await loadUserSessionAndProfile();
  };

  const handleOnboardingFinished = async () => {
    const updatedProfile = await getUserProfile();
    setProfile(updatedProfile);
    setHasCompletedOnboarding(updatedProfile !== null);
    setScreen('home');
  };

  const handleResetOnboarding = () => {
    setProfile(null);
    setHasCompletedOnboarding(false);
    setScreen('onboarding');
  };

  const handleRefreshProfile = async () => {
    const updatedProfile = await getUserProfile();
    setProfile(updatedProfile);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsUserLoggedIn(false);
    setHasCompletedOnboarding(false);
    setProfile(null);
    setScreen('landing');
  };

  // Landing B: open day preview sheet without navigating to home
  const handleLandingOpenDayPreview = (workout: DayWorkout) => {
    setLandingPreviewWorkout(workout);
  };

  // Landing B: "Settings" gear → go to home and open settings tab
  const handleLandingShowSettings = () => {
    setScreen('home');
  };

  // ─── Landing session state ─────────────────────────────────────────────────
  const landingSessionState = !sessionChecked
    ? 'checking'
    : isUserLoggedIn && hasCompletedOnboarding
    ? 'returning'
    : 'no-session';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <PhoneFrame>
      {screen === 'landing' && (
        <LandingScreen
          sessionState={landingSessionState}
          profile={profile}
          onGetStarted={() => setScreen('login')}
          onResume={() => setScreen('home')}
          onShowSettings={handleLandingShowSettings}
          onOpenDayPreview={handleLandingOpenDayPreview}
        />
      )}
      {screen === 'login' && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
      {screen === 'onboarding' && (
        <OnboardingFlow onComplete={handleOnboardingFinished} />
      )}
      {screen === 'home' && (
        <HomeScreen
          profile={profile}
          onResetOnboarding={handleResetOnboarding}
          onRefreshProfile={handleRefreshProfile}
          onLogout={handleLogout}
        />
      )}

      {/* Day preview launched from Landing B */}
      <DayPreviewModal
        workout={landingPreviewWorkout}
        onClose={() => setLandingPreviewWorkout(null)}
        onStartWorkout={(w) => {
          setLandingPreviewWorkout(null);
          setLandingActiveWorkout(w);
        }}
      />

      {/* Workout player launched from Landing B day preview */}
      {landingActiveWorkout && (
        <WorkoutPlayer
          workout={landingActiveWorkout}
          onFinishWorkout={() => {
            setLandingActiveWorkout(null);
            setScreen('home');
          }}
          onClose={() => setLandingActiveWorkout(null)}
        />
      )}
    </PhoneFrame>
  );
}

