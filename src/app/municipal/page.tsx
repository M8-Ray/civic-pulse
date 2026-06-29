"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { supabase } from '@/lib/supabaseClient';
import { 
  getIssues, 
  updateIssueStatus, 
  isOfficialEmail, 
  CITY_CENTERS, 
  Issue, 
  IssueStatus,
  IssueCategory,
  IssueSeverity,
  getClosestCity,
  calculateDistance
} from '@/data/mockIssues';
import { 
  Building2, 
  Search, 
  Lock, 
  Mail, 
  User, 
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  ListFilter, 
  LogOut, 
  MapPin, 
  Calendar, 
  ThumbsUp, 
  Sparkles,
  Info
} from 'lucide-react';
import Footer from '@/components/Footer';
import TopBar from '@/components/TopBar';
import styles from '../../styles/municipal.module.css';

interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    city: string;
    is_authority: boolean;
  };
}

export default function MunicipalPortalPage() {
  const router = useRouter();
  const { user, logout: supabaseLogout } = useAuth();
  const { userLocation, defaultLocation } = useLocation();

  // Mock Session State for Testing
  const [mockUser, setMockUser] = useState<MockUser | null>(null);

  // Authentication UI state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Dashboard state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'All'>('All');
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);

  // Active Authenticated State
  const activeUser = mockUser || (user?.user_metadata?.is_authority ? user : null);
  const isDenied = user && !user.user_metadata?.is_authority;
  const activeCity = activeUser?.user_metadata?.city || '';

  // Get coordinates of the city represented
  const cityCenter = CITY_CENTERS.find(c => c.city.toLowerCase() === activeCity.toLowerCase()) || defaultLocation;

  // Load Issues once authenticated
  useEffect(() => {
    if (activeCity) {
      setLoadingIssues(true);
      getIssues(cityCenter.lat, cityCenter.lng, activeUser?.id)
        .then((data) => {
          // Filter issues matching the default 'Near Me' page logic (within 10km radius)
          const cityIssues = data.filter(issue => {
            const distance = calculateDistance(cityCenter.lat, cityCenter.lng, issue.lat, issue.lng);
            return distance <= 10;
          });
          setIssues(cityIssues);
          setLoadingIssues(false);
        })
        .catch((err) => {
          console.error("Failed to load issues for city:", err);
          setLoadingIssues(false);
        });
    }
  }, [activeCity, cityCenter.lat, cityCenter.lng, activeUser?.id]);

  // Handle Authentication Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email || !password || (isSignUp && !name)) {
      setAuthError("Please fill in all required fields.");
      return;
    }

    // Official email check
    if (!isOfficialEmail(email)) {
      setAuthError("Access Restricted: Registrations are restricted to official government domains (.gov, .nic, or registered municipal endpoints). Try testing with '@example.gov'.");
      return;
    }

    setAuthLoading(true);

    try {
      if (isSignUp) {
        if (!supabase) {
          throw new Error("Supabase is not initialized. Please verify .env.local configuration.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              city,
              is_authority: true
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          setAuthSuccess("Authority registration successful! Logged in.");
        } else {
          setAuthSuccess("Registration successful! Verification email sent (if enabled).");
        }
      } else {
        // Sign In
        if (!supabase) {
          throw new Error("Supabase is not initialized. Please verify .env.local configuration.");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Verify if user is actually an authority
        if (!data.user?.user_metadata?.is_authority) {
          // Sign them out from AuthState as they are regular users in the admin console
          await supabase.auth.signOut();
          throw new Error("Access Denied: This account is not registered as a Municipal Authority.");
        }

        setAuthSuccess("Authenticated successfully. Redirecting to dashboard...");
      }
    } catch (err: any) {
      console.error("Municipal Auth Error:", err);
      setAuthError(err.message || "An error occurred during authentication.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Mock Testing Quick Login Trigger for local city
  const handleMockLocalLogin = () => {
    const activeLat = userLocation?.lat ?? defaultLocation.lat;
    const activeLng = userLocation?.lng ?? defaultLocation.lng;
    const detectedCity = getClosestCity(activeLat, activeLng);
    
    const mockSessionUser: MockUser = {
      id: 'mock-officer-local',
      email: `officer.${detectedCity.toLowerCase()}@example.gov`,
      user_metadata: {
        name: `Local Officer (${detectedCity} Limits)`,
        city: detectedCity,
        is_authority: true
      }
    };
    setMockUser(mockSessionUser);
    setAuthSuccess(`Mock Testing: Logged in as Local Officer for ${detectedCity}`);
    setTimeout(() => setAuthSuccess(null), 3000);
  };

  // Handle Logout
  const handleLogout = async () => {
    if (mockUser) {
      setMockUser(null);
    } else {
      await supabaseLogout();
    }
    setIssues([]);
    setStatusFilter('All');
    setCategoryFilter('All');
    setSearchQuery('');
  };

  // Handle Changing Issue Status
  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    setUpdatingIssueId(issueId);
    try {
      const updatedList = await updateIssueStatus(
        issueId, 
        newStatus, 
        cityCenter.lat, 
        cityCenter.lng, 
        activeUser?.id
      );
      
      // Filter list again to keep only issues in the authority's city
      const cityIssues = updatedList.filter(issue => issue.city?.toLowerCase() === activeCity.toLowerCase());
      setIssues(cityIssues);
    } catch (err: any) {
      console.error("Failed to update status:", err);
      alert(err.message || "Failed to update issue status. Check connection and policies.");
    } finally {
      setUpdatingIssueId(null);
    }
  };

  // Filter list of issues based on search and filters
  const filteredIssues = issues.filter(issue => {
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || issue.category === categoryFilter;
    const matchesSeverity = severityFilter === 'All' || issue.severity === severityFilter;
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesStatus && matchesCategory && matchesSeverity && matchesSearch;
  });

  // Calculate statistics for dashboard metrics
  const totalCount = issues.length;
  const reportedCount = issues.filter(i => i.status === 'Reported').length;
  const progressCount = issues.filter(i => i.status === 'In Progress').length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;

  return (
    <div className={styles.container}>
      <TopBar />
      {activeUser ? (
        /* ==================== DASHBOARD VIEW ==================== */
        <div className={styles.content}>
          
          {/* Header Area */}
          <header className={styles.headerArea}>
            <div className={styles.cityBadge}>
              🏛️ {activeCity} Municipal Corporation
            </div>
            <div className={styles.titleRow}>
              <div>
                <h1 className={styles.title}>Grievance Monitoring Console</h1>
                <p className={styles.subtitle}>
                  Logged in as <strong>{activeUser.user_metadata?.name || 'Officer'}</strong> ({activeUser.email}). Viewing verified public reports within local limits.
                </p>
              </div>
              <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Sign out from dashboard">
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </header>

          {/* Stats Summary Cards */}
          <section className={styles.statsGrid}>
            
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '3px solid var(--accent-cyan)' }}>
              <div className={styles.statCardGlow} style={{ background: 'var(--accent-cyan)' }} />
              <span className={styles.statLabel}>Total Issues</span>
              <span className={styles.statValue}>{totalCount}</span>
              <span className={styles.statDesc}>Assigned to {activeCity} limits</span>
            </div>

            <div className={`${styles.statCard} glass`} style={{ borderLeft: '3px solid var(--accent-crimson)' }}>
              <div className={styles.statCardGlow} style={{ background: 'var(--accent-crimson)' }} />
              <span className={styles.statLabel}>New Reported</span>
              <span className={styles.statValue}>{reportedCount}</span>
              <span className={styles.statDesc}>Awaiting inspection / logs</span>
            </div>

            <div className={`${styles.statCard} glass`} style={{ borderLeft: '3px solid var(--accent-amber)' }}>
              <div className={styles.statCardGlow} style={{ background: 'var(--accent-amber)' }} />
              <span className={styles.statLabel}>In Progress</span>
              <span className={styles.statValue}>{progressCount}</span>
              <span className={styles.statDesc}>Work crews dispatched</span>
            </div>

            <div className={`${styles.statCard} glass`} style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
              <div className={styles.statCardGlow} style={{ background: 'var(--accent-emerald)' }} />
              <span className={styles.statLabel}>Resolved</span>
              <span className={styles.statValue}>{resolvedCount}</span>
              <span className={styles.statDesc}>Grievance closed successfully</span>
            </div>

          </section>

          {/* Filters Row */}
          <section className={styles.filterSection}>
            <div className={styles.searchSortRow}>
              
              <div className={styles.searchBox}>
                <Search className={styles.searchIcon} size={18} />
                <input
                  type="text"
                  placeholder="Search by ID, keyword or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={styles.selectInput}
                aria-label="Filter issues by status"
              >
                <option value="All">🚦 All Statuses</option>
                <option value="Reported">🔴 Reported Only</option>
                <option value="In Progress">🟡 In Progress</option>
                <option value="Resolved">🟢 Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className={styles.selectInput}
                aria-label="Filter issues by category"
              >
                <option value="All">📁 All Categories</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Safety">Safety</option>
                <option value="Traffic">Traffic</option>
                <option value="Environment">Environment</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className={styles.selectInput}
                aria-label="Filter issues by severity"
              >
                <option value="All">⚡ All Severities</option>
                <option value="High">⚠️ High Severity</option>
                <option value="Medium">⚡ Medium Severity</option>
                <option value="Low">ℹ️ Low Severity</option>
              </select>

            </div>
          </section>

          {/* Grid list of issue cards */}
          <section className={styles.issuesList}>
            {loadingIssues ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '12px' }}>
                <Loader2 className="spinner" size={32} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fetching city grievance log...</span>
              </div>
            ) : filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <article key={issue.id} className={`${styles.issueCard} glass`}>
                  
                  {/* Media Section */}
                  <div className={styles.mediaSection}>
                    {issue.mediaType === 'video' ? (
                      <>
                        <video src={issue.mediaUrl} muted loop playsInline autoPlay className={styles.media} />
                        <span className={styles.videoBadge}>📹 Video</span>
                      </>
                    ) : (
                      <img src={issue.mediaUrl} alt={issue.title} className={styles.media} />
                    )}
                  </div>

                  {/* Info Section */}
                  <div className={styles.infoSection}>
                    <div>
                      
                      <div className={styles.cardHeader}>
                        <div>
                          <h2 className={styles.cardTitle}>{issue.title}</h2>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>
                            ID: {issue.id}
                          </div>
                        </div>

                        <div className={styles.cardBadges}>
                          <span className={`${styles.badge} ${
                            issue.severity === 'High' ? styles.severityHigh : issue.severity === 'Medium' ? styles.severityMedium : styles.severityLow
                          }`}>
                            {issue.severity}
                          </span>
                          <span className={`${styles.badge} ${
                            issue.status === 'Resolved' ? styles.statusResolved : issue.status === 'In Progress' ? styles.statusInProgress : styles.statusReported
                          }`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>

                      <p className={styles.description}>{issue.description}</p>

                      <div className={styles.metadataRow}>
                        <div className={styles.metaItem}>
                          <MapPin className={styles.metaIcon} size={14} />
                          <span>Coords: {issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Calendar className={styles.metaIcon} size={14} />
                          <span>Reported: {issue.createdAt}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaIcon}>📁</span>
                          <span>{issue.category}</span>
                        </div>
                      </div>

                    </div>

                    {/* Footer / Status controls */}
                    <div className={styles.cardFooter}>
                      
                      <div className={styles.upvoteCount}>
                        <ThumbsUp size={14} style={{ color: 'var(--accent-cyan)' }} />
                        <span>{issue.upvotes} Citizens upvoted</span>
                      </div>

                      <div className={styles.statusControlArea}>
                        <span className={styles.statusControlLabel}>Manage Status:</span>
                        {updatingIssueId === issue.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Loader2 className="spinner" size={14} style={{ color: 'var(--accent-cyan)' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updating...</span>
                          </div>
                        ) : (
                          <select
                            value={issue.status}
                            onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                            className={styles.statusDropdown}
                            aria-label={`Change status for issue: ${issue.title}`}
                          >
                            <option value="Reported">🔴 Reported (New)</option>
                            <option value="In Progress">🟡 In Progress</option>
                            <option value="Resolved">🟢 Resolved (Closed)</option>
                          </select>
                        )}
                      </div>

                    </div>

                  </div>

                </article>
              ))
            ) : (
              <div className={`${styles.emptyState} glass`}>
                <CheckCircle2 className={styles.emptyIcon} size={48} style={{ color: 'var(--accent-emerald)', opacity: 0.8 }} />
                <h2 className={styles.emptyTitle}>All Clear!</h2>
                <p className={styles.emptyDesc}>
                  No active grievances matching your current search parameters in {activeCity}.
                </p>
              </div>
            )}
          </section>

        </div>
      ) : (
        /* ==================== LOGIN / REGISTRATION FORM ==================== */
        <div className={styles.authContainer}>
          <div className={`${styles.authCard} glass`}>
            
            <div className={styles.authHeader}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Building2 size={36} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h2 className={styles.authTitle}>Municipal Console</h2>
              <p className={styles.authDesc}>
                Official login portal for municipal administrators to monitor local resident grievances and update progress.
              </p>
            </div>

            {/* Form Toggle Tabs */}
            <div className={styles.authTabs}>
              <button 
                className={`${styles.authTab} ${!isSignUp ? styles.authTabActive : ''}`}
                onClick={() => { setIsSignUp(false); setAuthError(null); setAuthSuccess(null); }}
              >
                Sign In
              </button>
              <button 
                className={`${styles.authTab} ${isSignUp ? styles.authTabActive : ''}`}
                onClick={() => { setIsSignUp(true); setAuthError(null); setAuthSuccess(null); }}
              >
                Authority Signup
              </button>
            </div>

            {/* Status alerts */}
            {authError && (
              <div className={styles.authError}>
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className={styles.authSuccess}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Login / Signup form */}
            <form onSubmit={handleAuthSubmit} className={styles.authForm}>
              
              {isSignUp && (
                <div className={styles.formGroup}>
                  <label htmlFor="authority-name" className={styles.formLabel}>Full Name / Officer Designation</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} size={16} />
                    <input
                      id="authority-name"
                      type="text"
                      placeholder="e.g. Officer Deshmukh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={styles.inputField}
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="authority-email" className={styles.formLabel}>Official Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={16} />
                  <input
                    id="authority-email"
                    type="email"
                    placeholder="officer@municipality.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              {isSignUp && (
                <div className={styles.formGroup}>
                  <label htmlFor="authority-city" className={styles.formLabel}>Representing City Limits</label>
                  <select
                    id="authority-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={styles.selectField}
                  >
                    {CITY_CENTERS.map((center) => (
                      <option key={center.city} value={center.city}>
                        {center.city} ({center.body.split('(')[1].replace(')', '')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="authority-password" className={styles.formLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={16} />
                  <input
                    id="authority-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={authLoading}>
                {authLoading ? (
                  <>
                    <Loader2 className="spinner" size={16} />
                    <span>Processing Portal...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Register Corporation Profile' : 'Authenticate Dashboard'}</span>
                  </>
                )}
              </button>

            </form>

            {/* Quick Demo Test Panel */}
            <div className={styles.demoPanel}>
              <div className={styles.demoPanelHeader}>
                <span className={styles.demoPanelTitle}>🧪 Mock Testing Panel</span>
                <span className={styles.demoModeBadge}>Bypass Mode</span>
              </div>
              <p className={styles.demoDesc}>
                Bypass database authentication and log in immediately as an officer for your detected city limits:
              </p>
              <button 
                onClick={handleMockLocalLogin}
                className={styles.submitBtn}
                style={{ 
                  background: 'rgba(0, 240, 255, 0.08)', 
                  border: '1.5px solid var(--accent-cyan)', 
                  color: 'var(--accent-cyan)',
                  marginTop: '4px' 
                }}
                type="button"
              >
                ⚡ Single-Click Mock Sign In
              </button>
            </div>

            {/* Denied view indicator */}
            {isDenied && (
              <div className={styles.authError} style={{ marginTop: '10px' }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>Notice: Your current account is logged in as a normal citizen. Official actions are locked. Please logout or use the mock panel.</span>
              </div>
            )}

            <div className={styles.authFooter}>
              {isSignUp ? (
                <p>Already registered? <span onClick={() => setIsSignUp(false)}>Sign In</span></p>
              ) : (
                <p>Register new official endpoint? <span onClick={() => setIsSignUp(true)}>Signup here</span></p>
              )}
            </div>

          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
