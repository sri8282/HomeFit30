/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { HomeScreen } from './components/HomeScreen';
import {
  isOnboardingCompleted,
  getUserProfile,
  UserProfile,
} from './dataService';
import { isAuthenticated, logout } from './authService';

export default function App() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Initialize state exclusively via dataService and authService
  useEffect(() => {
    const authenticated = isAuthenticated();
    const completed = isOnboardingCompleted();
    const loadedProfile = getUserProfile();

    setIsUserLoggedIn(authenticated);
    setHasCompletedOnboarding(completed);
    setProfile(loadedProfile);
    setIsReady(true);
  }, []);

  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
    const completed = isOnboardingCompleted();
    const loadedProfile = getUserProfile();
    setHasCompletedOnboarding(completed);
    setProfile(loadedProfile);
  };

  const handleOnboardingFinished = () => {
    const updatedProfile = getUserProfile();
    setProfile(updatedProfile);
    setHasCompletedOnboarding(true);
  };

  const handleResetOnboarding = () => {
    setProfile(null);
    setHasCompletedOnboarding(false);
  };

  const handleRefreshProfile = () => {
    const updatedProfile = getUserProfile();
    setProfile(updatedProfile);
  };

  const handleLogout = () => {
    logout();
    setIsUserLoggedIn(false);
    setHasCompletedOnboarding(false);
    setProfile(null);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PhoneFrame>
      {!isUserLoggedIn ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : !hasCompletedOnboarding ? (
        <OnboardingFlow onComplete={handleOnboardingFinished} />
      ) : (
        <HomeScreen
          profile={profile}
          onResetOnboarding={handleResetOnboarding}
          onRefreshProfile={handleRefreshProfile}
          onLogout={handleLogout}
        />
      )}
    </PhoneFrame>
  );
}
