"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, Lock, Mail, Loader2 } from 'lucide-react';
import styles from '../styles/components.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase client is not initialized. Please verify your Supabase environment variables in .env.local.");
      return;
    }

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // Supabase behavior: if email confirmation is enabled, data.user is created but confirmation email is sent
        if (data.session) {
          setMessage("Account registered and logged in successfully!");
          setTimeout(() => {
            onClose();
            setEmail('');
            setPassword('');
            setMessage(null);
          }, 1500);
        } else {
          setMessage("Registration successful! Please check your email inbox to confirm your account.");
          setEmail('');
          setPassword('');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        setMessage("Welcome back! Logged in successfully.");
        setTimeout(() => {
          onClose();
          setEmail('');
          setPassword('');
          setMessage(null);
        }, 1500);
      }
    } catch (err: any) {
      console.error("Auth action failed:", err);
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className={styles.authModalOverlay} onClick={onClose}>
      <div className={`${styles.authModal} glass`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.authCloseBtn} onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className={styles.authHeader}>
          <h2>CiviLog Login</h2>
          <p>Join to report neighborhood issues and manage your community dashboard</p>
        </div>

        {/* Tab switcher */}
        <div className={styles.authTabs}>
          <button
            className={`${styles.authTab} ${!isSignUp ? styles.authTabActive : ''}`}
            onClick={() => { setIsSignUp(false); setError(null); setMessage(null); }}
          >
            Sign In
          </button>
          <button
            className={`${styles.authTab} ${isSignUp ? styles.authTabActive : ''}`}
            onClick={() => { setIsSignUp(true); setError(null); setMessage(null); }}
          >
            Register Account
          </button>
        </div>

        {/* Message and Error Banners */}
        {error && <div className={styles.authError}>{error}</div>}
        {message && <div className={styles.authSuccess}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.authInputGroup}>
            <label htmlFor="auth-email">Email Address</label>
            <div className={styles.authInputWrapper}>
              <Mail className={styles.authInputIcon} size={16} />
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.authInputGroup}>
            <label htmlFor="auth-password">Password</label>
            <div className={styles.authInputWrapper}>
              <Lock className={styles.authInputIcon} size={16} />
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className={styles.authSubmitBtn} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className={styles.authSpinner} size={16} />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isSignUp ? 'Create Free Account' : 'Sign In to Dashboard'}</span>
            )}
          </button>

          {!isSignUp && (
            <button
              type="button"
              className={styles.mockAuthBtn}
              onClick={() => {
                setEmail('demo@example.com');
                setPassword('demo1234');
                setError(null);
              }}
              disabled={loading}
            >
              🔑 Use Mock Sign In (Demo Account)
            </button>
          )}
        </form>

        <div className={styles.authFooter}>
          {isSignUp ? (
            <p>Already have an account? <span onClick={() => setIsSignUp(false)}>Sign In</span></p>
          ) : (
            <p>Don't have a profile yet? <span onClick={() => setIsSignUp(true)}>Register</span></p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
