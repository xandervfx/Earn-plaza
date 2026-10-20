// src/components/ProfileModal.jsx
import React, { useEffect, useState } from 'react';
import {
  X,
  UserRound,
  LockKeyhole,
  Save,
  LoaderCircle,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { API_BASE } from './config';

export default function ProfileModal({
  isOpen = true,
  onClose = () => {},
  user,
  onProfileUpdated,
  standalone = false
}) {
  const [profile, setProfile] = useState(user || {});
  const [name, setName] = useState(user?.name || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Independent visibility controls for each password.
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const pageIsActive = standalone || isOpen;

  const token = () => localStorage.getItem('token');

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  useEffect(() => {
    if (!pageIsActive) return;

    let cancelled = false;

    setProfile(user || {});
    setName(user?.name || '');
    setMessage('');
    setMessageType('success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    const authToken = token();

    if (!authToken) {
      showMessage(
        'Your session has expired. Please log in again.',
        'error'
      );
      return;
    }

    async function loadProfile() {
      setLoadingProfile(true);

      try {
        const response = await fetch(
          `${API_BASE}/api/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error ||
            data.message ||
            'Could not load your profile.'
          );
        }

        const profileData = data.profile || data.user || data;

        if (
          !cancelled &&
          profileData &&
          typeof profileData === 'object'
        ) {
          setProfile((previous) => ({
            ...previous,
            ...profileData
          }));

          if (profileData.name) {
            setName(profileData.name);
          }
        }
      } catch (error) {
        if (!cancelled) {
          showMessage(
            error.message || 'Could not load your profile.',
            'error'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [pageIsActive, user?.id]);

  useEffect(() => {
    if (standalone || !isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [standalone, isOpen, onClose]);

  if (!standalone && !isOpen) return null;

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setMessage('');

    const cleanName = name.trim();

    if (!cleanName) {
      showMessage('Please enter your name.', 'error');
      return;
    }

    if (cleanName.length > 100) {
      showMessage(
        'Your name must be 100 characters or fewer.',
        'error'
      );
      return;
    }

    const authToken = token();

    if (!authToken) {
      showMessage(
        'Please log in again before updating your profile.',
        'error'
      );
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/user/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            name: cleanName
          })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          'Could not update your profile.'
        );
      }

      const updatedProfile = {
        ...profile,
        ...(data.profile || data.user || {}),
        name: cleanName
      };

      setProfile(updatedProfile);
      setName(cleanName);
      onProfileUpdated?.(updatedProfile);

      showMessage('Your profile was updated successfully.');
    } catch (error) {
      showMessage(
        error.message || 'Could not update your profile.',
        'error'
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage(
        'Please complete all password fields.',
        'error'
      );
      return;
    }

    if (newPassword.length < 8) {
      showMessage(
        'Your new password must be at least 8 characters long.',
        'error'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        'The new passwords do not match.',
        'error'
      );
      return;
    }

    if (currentPassword === newPassword) {
      showMessage(
        'Choose a different password from your current one.',
        'error'
      );
      return;
    }

    const authToken = token();

    if (!authToken) {
      showMessage(
        'Please log in again before changing your password.',
        'error'
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/user/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          'Could not change your password.'
        );
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      showMessage(
        data.message || 'Your password was changed successfully.'
      );
    } catch (error) {
      showMessage(
        error.message || 'Could not change your password.',
        'error'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const inputClass =
    'w-full min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition';

  const labelClass =
    'block text-xs font-bold text-slate-300 mb-2';

  // Reusable password input with its own eye toggle.
  const renderPasswordField = ({
    id,
    label,
    value,
    onChange,
    visible,
    setVisible,
    placeholder,
    autoComplete
  }) => (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="relative w-full">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`${inputClass} pr-14`}
          required
        />

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible((previous) => !previous)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 bg-slate-900 hover:text-emerald-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          style={{
            display: 'flex',
            visibility: 'visible',
            opacity: 1
          }}
        >
          {visible ? (
            <EyeOff
              size={22}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0"
            />
          ) : (
            <Eye
              size={22}
              strokeWidth={2}
              aria-hidden="true"
              className="shrink-0"
            />
          )}
        </button>
      </div>
    </div>
  );

  const content = (
    <section
      role={standalone ? 'region' : 'dialog'}
      aria-modal={standalone ? undefined : true}
      aria-labelledby="profile-page-title"
      className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 sm:px-6 py-5 bg-slate-900 border-b border-slate-800">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <UserRound className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id="profile-page-title"
            className="text-lg sm:text-xl font-black text-white"
          >
            My Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your Earn Plaza account
          </p>
        </div>

        {!standalone && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {message && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              messageType === 'error'
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            }`}
          >
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <UserRound className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="min-w-0">
              <p className="font-bold text-white break-words">
                {profile.name || user?.name || 'Earn Plaza Member'}
              </p>
              <p className="text-xs text-slate-400 break-all">
                {profile.email || user?.email || 'Email unavailable'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Keep your account details up to date.
          </div>
        </div>

        {loadingProfile && (
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin" />
            Loading account details...
          </p>
        )}

        {/* Account details */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h3 className="text-sm font-black text-white">
            Account Details
          </h3>

          <div>
            <label htmlFor="profile-name" className={labelClass}>
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="profile-email" className={labelClass}>
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={profile.email || user?.email || ''}
              className={`${inputClass} opacity-70 cursor-not-allowed`}
              readOnly
              aria-readonly="true"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Your email address cannot be changed here.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingProfile || loadingProfile}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingProfile ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <div className="border-t border-slate-800" />

        {/* Change password */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="flex items-center gap-2">
            <LockKeyhole className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white">
              Change Password
            </h3>
          </div>

          {renderPasswordField({
            id: 'current-password',
            label: 'Current Password',
            value: currentPassword,
            onChange: (event) => setCurrentPassword(event.target.value),
            visible: showCurrentPassword,
            setVisible: setShowCurrentPassword,
            placeholder: 'Enter current password',
            autoComplete: 'current-password'
          })}

          {renderPasswordField({
            id: 'new-password',
            label: 'New Password',
            value: newPassword,
            onChange: (event) => setNewPassword(event.target.value),
            visible: showNewPassword,
            setVisible: setShowNewPassword,
            placeholder: 'At least 8 characters',
            autoComplete: 'new-password'
          })}

          {renderPasswordField({
            id: 'confirm-password',
            label: 'Confirm New Password',
            value: confirmPassword,
            onChange: (event) => setConfirmPassword(event.target.value),
            visible: showConfirmPassword,
            setVisible: setShowConfirmPassword,
            placeholder: 'Re-enter new password',
            autoComplete: 'new-password'
          })}

          <p className="text-xs text-slate-500">
            Use the eye icon in each field to show or hide that password.
          </p>

          <button
            type="submit"
            disabled={changingPassword}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changingPassword ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <LockKeyhole className="w-4 h-4" />
            )}
            {changingPassword
              ? 'Updating Password...'
              : 'Update Password'}
          </button>
        </form>
      </div>
    </section>
  );

  if (standalone) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-4 py-6 sm:px-6 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
            }}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="mb-6">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">
              Account Settings
            </p>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              Profile &amp; Security
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Update your personal details and keep your account secure.
            </p>
          </div>

          {content}
        </div>
      </main>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
}