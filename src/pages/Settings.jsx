import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const defaultSettings = {
  theme: 'dark',
  notifications: {
    email: true,
    courseUpdates: true,
  },
  privacy: {
    profileVisible: true,
  },
  language: 'English',
  account: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
};

const ToggleSwitch = ({ enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={enabled}
    className={`relative inline-flex h-6 w-12 items-center rounded-full border transition-all duration-200 ${enabled
      ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400'
      : 'bg-gray-700 border-gray-600'
      }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
    />
  </button>
);

const Settings = () => {
  const { user } = useAuth();
  const userKey = user?.email || 'default';
  const [settings, setSettings] = useState(defaultSettings);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [skipSave, setSkipSave] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('userSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        const savedSettings = parsedSettings?.[userKey];
        if (savedSettings) {
          setSettings({
            ...defaultSettings,
            ...savedSettings,
            notifications: {
              ...defaultSettings.notifications,
              ...savedSettings.notifications,
            },
            privacy: {
              ...defaultSettings.privacy,
              ...savedSettings.privacy,
            },
            account: {
              ...defaultSettings.account,
              ...savedSettings.account,
            },
          });
        }
      } catch {
        setSettings(defaultSettings);
      }
    }
    setHasLoaded(true);
  }, [userKey]);

  useEffect(() => {
    if (!hasLoaded || skipSave) {
      if (skipSave) {
        setSkipSave(false);
      }
      return;
    }
    const storedSettings = localStorage.getItem('userSettings');
    let parsedSettings = {};
    try {
      parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};
    } catch {
      parsedSettings = {};
    }
    parsedSettings[userKey] = settings;
    localStorage.setItem('userSettings', JSON.stringify(parsedSettings));
    toast.success('Settings saved', { id: 'settings-saved' });
  }, [settings, userKey, hasLoaded, skipSave]);

  const handleThemeToggle = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleNotificationToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handlePrivacyToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key],
      },
    }));
  };

  const handleLanguageChange = (event) => {
    setSettings(prev => ({
      ...prev,
      language: event.target.value,
    }));
  };

  const handleAccountChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      account: {
        ...prev.account,
        [key]: value,
      },
    }));
  };

  const handleReset = () => {
    localStorage.removeItem('userSettings');
    setSettings(defaultSettings);
    setSkipSave(true);
    toast.success('Settings reset to defaults', { id: 'settings-reset' });
  };

  const handlePasswordUpdate = () => {
    toast('Password update saved locally', { icon: '🔒', id: 'password-update' });
  };

  const summaryItems = useMemo(
    () => [
      {
        label: 'Theme',
        value: settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode',
      },
      {
        label: 'Email Notifications',
        value: settings.notifications.email ? 'Enabled' : 'Disabled',
      },
      {
        label: 'Course Updates',
        value: settings.notifications.courseUpdates ? 'Enabled' : 'Disabled',
      },
      {
        label: 'Profile Visibility',
        value: settings.privacy.profileVisible ? 'Visible' : 'Hidden',
      },
      {
        label: 'Language',
        value: settings.language,
      },
    ],
    [settings],
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 px-4 py-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8 hover:border-purple-500/60 transition-all duration-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase text-gray-400 tracking-wide">User Settings</p>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-400 mt-2">Manage your preferences and account experience.</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 w-full md:w-auto">
              <p className="text-lg font-semibold text-white">
                {user?.displayName || user?.email || 'User'}
              </p>
              <p className="text-sm text-gray-400 break-all">{user?.email}</p>
              <span className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/60 transition-all duration-200">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Theme Preference
              </h2>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-400">Toggle between dark and light themes.</p>
                </div>
                <ToggleSwitch enabled={settings.theme === 'dark'} onToggle={handleThemeToggle} />
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/60 transition-all duration-200">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Notification Preferences
              </h2>
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-400">Get updates via email.</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.email}
                    onToggle={() => handleNotificationToggle('email')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Course Updates</p>
                    <p className="text-sm text-gray-400">Receive alerts for course changes.</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.notifications.courseUpdates}
                    onToggle={() => handleNotificationToggle('courseUpdates')}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/60 transition-all duration-200">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Privacy Settings
              </h2>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-white font-medium">Profile Visibility</p>
                  <p className="text-sm text-gray-400">Control who can see your profile.</p>
                </div>
                <ToggleSwitch
                  enabled={settings.privacy.profileVisible}
                  onToggle={() => handlePrivacyToggle('profileVisible')}
                />
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/60 transition-all duration-200">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Language Selection
              </h2>
              <div className="mt-4">
                <select
                  value={settings.language}
                  onChange={handleLanguageChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/60 transition-all duration-200">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Account Settings
              </h2>
              <div className="grid gap-4 mt-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={settings.account.currentPassword}
                  onChange={(event) => handleAccountChange('currentPassword', event.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={settings.account.newPassword}
                  onChange={(event) => handleAccountChange('newPassword', event.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={settings.account.confirmPassword}
                  onChange={(event) => handleAccountChange('confirmPassword', event.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-purple-500/60 transition-all duration-200">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Settings Summary
              </h2>
              <ul className="mt-4 space-y-3">
                {summaryItems.map(item => (
                  <li key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-red-500/60 transition-all duration-200">
              <h2 className="text-xl font-semibold text-red-300">Reset Preferences</h2>
              <p className="text-sm text-gray-400 mt-2">
                Clear your saved settings and return to defaults.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 w-full bg-red-500/20 text-red-200 font-semibold px-6 py-3 rounded-lg border border-red-500/40 hover:bg-red-500/30 transition-all duration-200"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
