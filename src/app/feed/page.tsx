"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';
import { useAuth } from '@/context/AuthContext';
import { 
  getIssues, 
  toggleUpvoteIssue, 
  voteIssueResolved,
  deleteIssue,
  calculateDistance, 
  Issue, 
  IssueCategory, 
  IssueStatus 
} from '@/data/mockIssues';
import { Search, MapPin, Eye, Clock, MessageSquareOff, Flame, ThumbsUp, Trash2 } from 'lucide-react';
import Footer from '@/components/Footer';
import TopBar from '@/components/TopBar';
import styles from '../../styles/feed.module.css';

type SortOption = 'distance' | 'upvotes' | 'date';

export default function FeedPage() {
  const { userLocation, isLoading: locationLoading, defaultLocation } = useLocation();
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [isIssuesLoading, setIsIssuesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [radiusLimit, setRadiusLimit] = useState<number | 'all'>(10);

  // Center coordinate reference to sort by distance
  const centerLat = userLocation?.lat ?? defaultLocation.lat;
  const centerLng = userLocation?.lng ?? defaultLocation.lng;

  // Initialize and load issues
  useEffect(() => {
    let active = true;
    if (!locationLoading) {
      setIsIssuesLoading(true);
      getIssues(centerLat, centerLng, user?.id)
        .then((loadedIssues) => {
          if (active) {
            setIssues(loadedIssues);
            setIsIssuesLoading(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load issues:", err);
          if (active) {
            setIsIssuesLoading(false);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [locationLoading, centerLat, centerLng, user?.id]);

  // Handle upvoting
  const handleUpvote = async (id: string) => {
    // Optimistic UI updates
    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id === id) {
          const isUpvoted = !issue.userUpvoted;
          return {
            ...issue,
            userUpvoted: isUpvoted,
            upvotes: isUpvoted ? issue.upvotes + 1 : issue.upvotes - 1,
          };
        }
        return issue;
      })
    );

    try {
      const updated = await toggleUpvoteIssue(id, centerLat, centerLng, user?.id);
      setIssues(updated);
    } catch (err) {
      console.error("Upvote failed:", err);
      // Revert if error
      getIssues(centerLat, centerLng, user?.id).then((loaded) => setIssues(loaded));
    }
  };

  // Handle resolution voting
  const handleResolveVote = async (id: string) => {
    // Optimistic UI updates
    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id === id) {
          const isVoted = !issue.userResolvedVoted;
          const currentVotes = issue.resolvedVotes || 0;
          const nextVotes = isVoted ? currentVotes + 1 : Math.max(0, currentVotes - 1);
          
          let nextStatus = issue.status;
          if (nextVotes >= 3) {
            nextStatus = 'Resolved';
          } else if (issue.status === 'Resolved') {
            nextStatus = 'Reported'; // revert back to reported
          }

          return {
            ...issue,
            userResolvedVoted: isVoted,
            resolvedVotes: nextVotes,
            status: nextStatus,
          };
        }
        return issue;
      })
    );

    try {
      const updated = await voteIssueResolved(id, centerLat, centerLng, user?.id);
      setIssues(updated);
    } catch (err) {
      console.error("Resolve vote failed:", err);
      // Revert if error
      getIssues(centerLat, centerLng, user?.id).then((loaded) => setIssues(loaded));
    }
  };

  // Handle issue deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
      return;
    }

    // Optimistic UI updates
    setIssues((prevIssues) => prevIssues.filter((issue) => issue.id !== id));

    try {
      const updated = await deleteIssue(id, centerLat, centerLng, user?.id);
      setIssues(updated);
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || "Failed to delete issue. Please check your connection and policies.");
      // Revert if error
      getIssues(centerLat, centerLng, user?.id).then((loaded) => setIssues(loaded));
    }
  };

  // Filter issues based on active tab, category, search query, and 10km radius limit
  const filteredIssues = issues.filter((issue) => {
    const tabMatch = activeTab === 'all' || issue.userReported === true;
    const categoryMatch = selectedCategory === 'All' || issue.category === selectedCategory;
    const queryMatch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const distance = calculateDistance(centerLat, centerLng, issue.lat, issue.lng);
    const isWithinRadius = activeTab === 'my' || radiusLimit === 'all' || distance <= radiusLimit;

    return tabMatch && categoryMatch && queryMatch && isWithinRadius;
  });

  // Sort issues based on active sorting choice
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'distance') {
      const distA = calculateDistance(centerLat, centerLng, a.lat, a.lng);
      const distB = calculateDistance(centerLat, centerLng, b.lat, b.lng);
      return distA - distB; // Closest first
    } else if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes; // Most upvoted first
    } else {
      // For seed-based issues, sort by ID sequence or mock timestamps.
      // We will parse high IDs / seed IDs. Date sorting:
      return b.id.localeCompare(a.id); // Newest first
    }
  });

  const formatDistanceValue = (issueLat: number, issueLng: number) => {
    if (locationLoading) return 'Calculating...';
    const km = calculateDistance(centerLat, centerLng, issueLat, issueLng);
    if (km < 1) {
      return `${Math.round(km * 1000)}m away`;
    }
    return `${km.toFixed(1)} km away`;
  };

  const getStatusLabelClass = (status: IssueStatus) => {
    switch (status) {
      case 'Reported': return 'popup-badge-reported';
      case 'In Progress': return 'popup-badge-inprogress';
      case 'Resolved': return 'popup-badge-resolved';
      default: return '';
    }
  };

  return (
    <div className={styles.feedContainer}>
      <TopBar />
      <div className={styles.feedContent}>
        {/* Header Title */}
        <div className={styles.headerArea}>
          <h1 className={styles.title}>Top Issues Near Me</h1>
          <p className={styles.subtitle}>
            {userLocation 
              ? `Showing issues active near your coordinates: [${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}]`
              : `Showing local neighborhood feeds (using default location)`
            }
          </p>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            width: 'fit-content',
            marginTop: '12px',
            gap: '4px'
          }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'all' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'all' ? '#080b11' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🌐 All Nearby Issues
            </button>
            <button
              onClick={() => setActiveTab('my')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'my' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'my' ? '#080b11' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              👤 My Reports
            </button>
          </div>
        </div>

        {/* Search and Sort row */}
        <div className={styles.searchSortRow}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search local reports (e.g. pothole, garbage...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {activeTab !== 'my' && (
            <select
              value={radiusLimit}
              onChange={(e) => {
                const val = e.target.value;
                setRadiusLimit(val === 'all' ? 'all' : Number(val));
              }}
              className={styles.sortSelect}
              aria-label="Filter by proximity radius"
              style={{ minWidth: '130px' }}
            >
              <option value={10}>📍 Within 10 km</option>
              <option value={25}>📍 Within 25 km</option>
              <option value={50}>📍 Within 50 km</option>
              <option value="all">📍 All India (No limit)</option>
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={styles.sortSelect}
            aria-label="Sort issues by criteria"
          >
            <option value="distance">↕ Distance</option>
            <option value="upvotes">🔥 Popularity</option>
            <option value="date">🕒 Date Reported</option>
          </select>
        </div>

        {/* Categories Bar */}
        <div className={styles.filterRow}>
          {(['All', 'Infrastructure', 'Sanitation', 'Safety', 'Traffic', 'Environment'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`${styles.filterBtn} ${selectedCategory === cat ? styles.filterBtnActive : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards list */}
        <div className={styles.cardsList}>
          <style>{`
            @keyframes pulseSkeleton {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 0.25; }
            }
            .skeleton-card {
              animation: pulseSkeleton 1.8s infinite ease-in-out;
            }
          `}</style>
          {isIssuesLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className={`${styles.card} glass skeleton-card`}>
                <div className={styles.mediaSection} style={{ background: 'rgba(255, 255, 255, 0.03)' }} />
                <div className={styles.infoSection}>
                  <div>
                    <div className={styles.cardHeader}>
                      <div style={{ width: '60%', height: '18px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ width: '85px', height: '24px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.08)' }} />
                      </div>
                    </div>
                    <div style={{ width: '90%', height: '12px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', marginTop: '12px' }} />
                    <div style={{ width: '75%', height: '12px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', marginTop: '6px' }} />
                  </div>
                  <div className={styles.cardFooter} style={{ borderTopColor: 'var(--border-light)' }}>
                    <div style={{ width: '80px', height: '26px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)' }} />
                    <div style={{ width: '100px', height: '20px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)' }} />
                  </div>
                </div>
              </div>
            ))
          ) : sortedIssues.length > 0 ? (
            sortedIssues.map((issue) => (
              <article key={issue.id} className={`${styles.card} glass-interactive`}>
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

                <div className={styles.infoSection}>
                  <div>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.cardTitle}>{issue.title}</h2>
                      <div className={styles.cardBadges}>
                        {issue.status === 'Resolved' ? (
                          <span className={styles.resolvedBadge}>
                            ✓ Resolved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleResolveVote(issue.id)}
                            className={`${styles.resolveVoteBtn} ${issue.userResolvedVoted ? styles.resolveVoteBtnActive : ''}`}
                            aria-label={`Vote to resolve this issue. Current votes: ${issue.resolvedVotes || 0} out of 3`}
                          >
                            Resolved? ({issue.resolvedVotes || 0}/3)
                          </button>
                        )}
                      </div>
                    </div>

                    <p className={styles.description}>{issue.description}</p>
                    
                    <div className={styles.metadataRow}>
                      <div className={styles.metaItem}>
                        <MapPin className={styles.metaIcon} size={14} />
                        <span>{formatDistanceValue(issue.lat, issue.lng)}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Clock className={styles.metaIcon} size={14} />
                        <span>{issue.createdAt}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>📁</span>
                        <span>{issue.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.upvotesArea}>
                      <button
                        onClick={() => handleUpvote(issue.id)}
                        className={`${styles.upvoteBtn} ${issue.userUpvoted ? styles.upvoteBtnActive : ''}`}
                        aria-label={`Upvote this issue. Current upvotes: ${issue.upvotes}`}
                      >
                        <ThumbsUp size={14} />
                        <span>{issue.userUpvoted ? 'Upvoted' : 'Upvote'}</span>
                      </button>
                      <span className={styles.upvoteCount}>{issue.upvotes} Upvotes</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {issue.userReported && (
                        <button
                          onClick={() => handleDelete(issue.id)}
                          className={styles.deleteBtn}
                          aria-label="Delete this issue"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      )}

                      <Link 
                        href={`/map?lat=${issue.lat}&lng=${issue.lng}&id=${issue.id}`}
                        className={styles.mapLink}
                      >
                        <Eye size={16} />
                        <span>Locate on Map</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className={`${styles.emptyState} glass`}>
              <MessageSquareOff className={styles.emptyIcon} size={48} />
              <h2 className={styles.emptyTitle}>
                {activeTab === 'my' ? "You haven't reported any issues yet" : "No matching reports found"}
              </h2>
              <p>
                {activeTab === 'my'
                  ? "Help clean up your neighborhood by flagging local road, safety, or sanitation hazards."
                  : "Be the first to report an issue in this category near you!"}
              </p>
              <Link href="/report" style={{
                marginTop: '8px',
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'var(--accent-cyan)',
                color: '#080b11',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}>
                Report an Issue
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
