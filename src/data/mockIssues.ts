import { supabase } from '@/lib/supabaseClient';

export type IssueCategory = 'Infrastructure' | 'Sanitation' | 'Safety' | 'Traffic' | 'Environment';
export type IssueSeverity = 'Low' | 'Medium' | 'High';
export type IssueStatus = 'Reported' | 'In Progress' | 'Resolved';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  lat: number;
  lng: number;
  upvotes: number;
  createdAt: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  userUpvoted?: boolean;
  userReported?: boolean;
  resolvedVotes?: number;
  userResolvedVoted?: boolean;
  user_id?: string;
  city?: string;
}

// Haversine formula to calculate distance between two coordinates in kilometers
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Pre-seeded base issues with relative coordinates (offsets from center)
const BASE_ISSUES = [
  {
    title: 'Crater-Sized Pothole',
    description: 'Major pothole in the middle lane causing cars to swerve dangerously. Has already damaged at least two tires today.',
    category: 'Infrastructure' as IssueCategory,
    severity: 'High' as IssueSeverity,
    status: 'Reported' as IssueStatus,
    latOffset: 0.005,
    lngOffset: -0.003,
    upvotes: 42,
    createdAt: '2 hours ago',
    mediaUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=60',
    mediaType: 'image' as const,
  },
  {
    title: 'Overflowing Garbage Bin',
    description: 'Public bin is completely overflowing. Trash is spilling onto the pavement and attracting stray cats and rodents. Bad odor in the vicinity.',
    category: 'Sanitation' as IssueCategory,
    severity: 'Medium' as IssueSeverity,
    status: 'In Progress' as IssueStatus,
    latOffset: -0.004,
    lngOffset: 0.006,
    upvotes: 18,
    createdAt: '5 hours ago',
    mediaUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=60',
    mediaType: 'image' as const,
  },
  {
    title: 'Broken Streetlight Intersection',
    description: 'Three lights are completely dark at the main crossing. Extremely unsafe for pedestrians crossing at night. High accident risk.',
    category: 'Safety' as IssueCategory,
    severity: 'High' as IssueSeverity,
    status: 'Reported' as IssueStatus,
    latOffset: 0.002,
    lngOffset: 0.008,
    upvotes: 29,
    createdAt: '1 day ago',
    mediaUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&auto=format&fit=crop&q=60',
    mediaType: 'image' as const,
  },
  {
    title: 'Fallen Tree Blocking Sidewalk',
    description: 'A massive branch has snapped off the banyan tree and completely blocked the pedestrian sidewalk and bicycle path.',
    category: 'Environment' as IssueCategory,
    severity: 'Low' as IssueSeverity,
    status: 'Resolved' as IssueStatus,
    latOffset: -0.006,
    lngOffset: -0.007,
    upvotes: 11,
    createdAt: '2 days ago',
    mediaUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=60',
    mediaType: 'image' as const,
  },
  {
    title: 'Clogged Storm Drain Flooding',
    description: 'Plastic waste and leaves have choked the drainage system. Mild rain is causing the road to pool water up to ankle height.',
    category: 'Infrastructure' as IssueCategory,
    severity: 'High' as IssueSeverity,
    status: 'In Progress' as IssueStatus,
    latOffset: -0.001,
    lngOffset: -0.002,
    upvotes: 35,
    createdAt: '8 hours ago',
    mediaUrl: 'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?w=800&auto=format&fit=crop&q=60',
    mediaType: 'image' as const,
  },
  {
    title: 'Malfunctioning Traffic Signal',
    description: 'The traffic signal is stuck on red for Northbound traffic, causing a massive gridlock. Traffic police are directing manually.',
    category: 'Traffic' as IssueCategory,
    severity: 'High' as IssueSeverity,
    status: 'In Progress' as IssueStatus,
    latOffset: 0.008,
    lngOffset: 0.002,
    upvotes: 56,
    createdAt: '30 mins ago',
    // Let's use a nice short community dashboard stock video, or standard video URL.
    // For safety, we can use a sample video from web like a public test video, or an image.
    // Since browser support for mp4 is universal, we can use a sample mp4.
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-in-a-busy-city-street-at-night-40291-large.mp4',
    mediaType: 'video' as const,
  }
];

export const CITY_CENTERS = [
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777, email: 'mc@mcgm.gov.in', body: 'Brihanmumbai Municipal Corporation (BMC)' },
  { city: 'Delhi', lat: 28.6139, lng: 77.2090, email: 'mcd-ithelpdesk@mcd.nic.in', body: 'Municipal Corporation of Delhi (MCD)' },
  { city: 'Bengaluru', lat: 12.9716, lng: 77.5946, email: 'comm@bbmp.gov.in', body: 'Bruhat Bengaluru Mahanagara Palike (BBMP)' },
  { city: 'Chennai', lat: 13.0827, lng: 80.2707, email: 'commissioner@chennaicorporation.gov.in', body: 'Greater Chennai Corporation (GCC)' },
  { city: 'Hyderabad', lat: 17.3850, lng: 78.4867, email: 'commissioner-ghmc@gov.in', body: 'Greater Hyderabad Municipal Corporation (GHMC)' },
  { city: 'Kolkata', lat: 22.5726, lng: 88.3639, email: 'mc@kmcgov.in', body: 'Kolkata Municipal Corporation (KMC)' },
  { city: 'Pune', lat: 18.5204, lng: 73.8567, email: 'info@punecorporation.org', body: 'Pune Municipal Corporation (PMC)' },
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, email: 'mc@ahmedabadcity.gov.in', body: 'Amdavad Municipal Corporation (AMC)' },
  { city: 'Aurangabad', lat: 19.8762, lng: 75.3433, email: 'commissioner@amc.gov.in', body: 'Aurangabad Municipal Corporation (AMC)' },
  { city: 'Surat', lat: 21.1702, lng: 72.8311, email: 'commissioner@suratmunicipal.gov.in', body: 'Surat Municipal Corporation (SMC)' },
  { city: 'Jaipur', lat: 26.9124, lng: 75.7873, email: 'commissioner.jmc@rajasthan.gov.in', body: 'Jaipur Municipal Corporation (JMC)' },
  { city: 'Lucknow', lat: 26.8467, lng: 80.9462, email: 'nnlko@nic.in', body: 'Lucknow Municipal Corporation (LMC)' },
  { city: 'Nagpur', lat: 21.1458, lng: 79.0882, email: 'mconagpur@gov.in', body: 'Nagpur Municipal Corporation (NMC)' },
  { city: 'Indore', lat: 22.7196, lng: 75.8577, email: 'nn.indore@mpurban.gov.in', body: 'Indore Municipal Corporation (IMC)' },
  { city: 'Thane', lat: 19.2183, lng: 72.9781, email: 'mc@thanecity.gov.in', body: 'Thane Municipal Corporation (TMC)' },
  { city: 'Bhopal', lat: 23.2599, lng: 77.4126, email: 'commoffice@bmconline.gov.in', body: 'Bhopal Municipal Corporation (BMC)' },
  { city: 'Patna', lat: 25.5941, lng: 85.1376, email: 'patnamc-bih@gov.in', body: 'Patna Municipal Corporation (PMC)' },
  { city: 'Vadodara', lat: 22.3072, lng: 73.1812, email: 'commissioner@vmc.gov.in', body: 'Vadodara Municipal Corporation (VMC)' },
  { city: 'Coimbatore', lat: 11.0168, lng: 76.9558, email: 'commr.coimbatore@tn.gov.in', body: 'Coimbatore City Municipal Corporation (CCMC)' },
  { city: 'Ludhiana', lat: 30.9010, lng: 75.8573, email: 'commissioner.mcl@punjab.gov.in', body: 'Municipal Corporation Ludhiana (MCL)' },
  { city: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, email: 'commissioner@gvmc.gov.in', body: 'Greater Visakhapatnam Municipal Corporation (GVMC)' }
];

export function getClosestCity(lat: number, lng: number): string {
  let closestCity = 'Mumbai';
  let minDistance = Infinity;
  for (const center of CITY_CENTERS) {
    const dist = calculateDistance(lat, lng, center.lat, center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = center.city;
    }
  }
  return closestCity;
}

export function isOfficialEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  if (domain === 'example.gov' || domain === 'test.gov' || domain === 'civicpulse.gov') {
    return true;
  }

  return (
    domain.endsWith('.gov') ||
    domain.endsWith('.gov.in') ||
    domain.endsWith('.nic.in') ||
    domain.endsWith('.nic') ||
    domain.endsWith('.municipal.in') ||
    domain.endsWith('.org.in') ||
    domain === 'punecorporation.org' ||
    domain === 'mcgm.gov.in' ||
    domain === 'mcd.nic.in' ||
    domain === 'bbmp.gov.in' ||
    domain === 'chennaicorporation.gov.in' ||
    domain === 'kmcgov.in' ||
    domain === 'ahmedabadcity.gov.in' ||
    domain === 'ghmc.gov.in' ||
    domain === 'gov.in' ||
    domain === 'nic.in'
  );
}

const LOCAL_STORAGE_KEY = 'civicpulse_issues';
const UPVOTED_IDS_KEY = 'civicpulse_upvoted_issues';
const CREATED_IDS_KEY = 'civicpulse_created_issues';

function getLocalUpvotedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const val = localStorage.getItem(UPVOTED_IDS_KEY);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
}

function setLocalUpvotedIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(UPVOTED_IDS_KEY, JSON.stringify(ids));
  } catch (e) {}
}

export function getLocalCreatedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const val = localStorage.getItem(CREATED_IDS_KEY);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
}

export function setLocalCreatedIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CREATED_IDS_KEY, JSON.stringify(ids));
  } catch (e) {}
}

const RESOLVED_VOTES_IDS_KEY = 'civicpulse_resolved_voted_issues';

export function getLocalResolvedVotedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const val = localStorage.getItem(RESOLVED_VOTES_IDS_KEY);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
}

export function setLocalResolvedVotedIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RESOLVED_VOTES_IDS_KEY, JSON.stringify(ids));
  } catch (e) {}
}

export function getLocalIssues(centerLat: number, centerLng: number, currentUserId?: string): Issue[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Issue[];
      const createdIds = getLocalCreatedIds();
      const resolvedVotedIds = getLocalResolvedVotedIds();
      return parsed.filter(i => i.id).map(i => ({
        ...i,
        userUpvoted: currentUserId ? (i.userUpvoted || false) : false,
        userReported: currentUserId ? createdIds.includes(i.id) : false,
        resolvedVotes: i.resolvedVotes || 0,
        userResolvedVoted: currentUserId ? resolvedVotedIds.includes(i.id) : false,
        city: i.city || getClosestCity(i.lat, i.lng)
      }));
    } catch (e) {
      console.error("Failed to parse issues from localStorage:", e);
    }
  }

  // Seed default issues around the provided coordinates
  const seeded: Issue[] = BASE_ISSUES.map((issue, idx) => {
    const lat = centerLat + issue.latOffset;
    const lng = centerLng + issue.lngOffset;
    return {
      id: `seed-${idx}`,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      severity: issue.severity,
      status: issue.status,
      lat,
      lng,
      upvotes: issue.upvotes,
      createdAt: issue.createdAt,
      mediaUrl: issue.mediaUrl,
      mediaType: issue.mediaType,
      userUpvoted: false,
      resolvedVotes: 0,
      userResolvedVoted: false,
      city: getClosestCity(lat, lng)
    };
  });

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveLocalIssue(
  issue: Omit<Issue, 'id' | 'createdAt' | 'upvotes' | 'status'>,
  centerLat: number,
  centerLng: number,
  currentUserId?: string
): Issue {
  const currentIssues = getLocalIssues(centerLat, centerLng, currentUserId);
  
  const newIssueId = `user-${Date.now()}`;
  const newIssue: Issue = {
    ...issue,
    id: newIssueId,
    createdAt: 'Just now',
    upvotes: 1,
    status: 'Reported',
    userUpvoted: true,
    userReported: true,
    user_id: currentUserId,
    city: issue.city || getClosestCity(issue.lat, issue.lng)
  };

  // Track created issue locally
  const createdIds = getLocalCreatedIds();
  setLocalCreatedIds([...createdIds, newIssueId]);

  const updated = [newIssue, ...currentIssues];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return newIssue;
}

export function toggleLocalUpvoteIssue(id: string, centerLat: number, centerLng: number, currentUserId?: string): Issue[] {
  const currentIssues = getLocalIssues(centerLat, centerLng, currentUserId);
  const updated = currentIssues.map(issue => {
    if (issue.id === id) {
      const isUpvoted = !issue.userUpvoted;
      return {
        ...issue,
        userUpvoted: isUpvoted,
        upvotes: isUpvoted ? issue.upvotes + 1 : issue.upvotes - 1
      };
    }
    return issue;
  });
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return getLocalIssues(centerLat, centerLng, currentUserId);
}

interface DbIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  lat: number;
  lng: number;
  upvotes: number;
  media_url: string;
  media_type: string;
  created_at: string;
  resolved_votes?: number;
  user_id?: string;
}

function mapDbToIssue(db: DbIssue, centerLat: number, centerLng: number, currentUserId?: string): Issue {
  const upvotedIds = getLocalUpvotedIds();
  const userUpvoted = currentUserId ? upvotedIds.includes(db.id) : false;

  const createdIds = getLocalCreatedIds();
  const userReported = db.user_id
    ? (!!currentUserId && db.user_id === currentUserId)
    : (currentUserId ? createdIds.includes(db.id) : false);

  const resolvedVotedIds = getLocalResolvedVotedIds();
  const userResolvedVoted = currentUserId ? resolvedVotedIds.includes(db.id) : false;
  const resolvedVotes = db.resolved_votes || 0;

  let timeStr = 'Some time ago';
  try {
    const date = new Date(db.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) {
      timeStr = 'Just now';
    } else if (diffMins < 60) {
      timeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      timeStr = date.toLocaleDateString();
    }
  } catch (e) {
    // Fallback
  }

  return {
    id: db.id,
    title: db.title,
    description: db.description,
    category: db.category as IssueCategory,
    severity: db.severity as IssueSeverity,
    status: db.status as IssueStatus,
    lat: db.lat,
    lng: db.lng,
    upvotes: db.upvotes,
    createdAt: timeStr,
    mediaUrl: db.media_url,
    mediaType: db.media_type as 'image' | 'video',
    userUpvoted,
    userReported,
    resolvedVotes,
    userResolvedVoted,
    user_id: db.user_id,
    city: getClosestCity(db.lat, db.lng),
  };
}

export async function getIssues(centerLat: number, centerLng: number, currentUserId?: string): Promise<Issue[]> {
  if (!supabase) {
    return getLocalIssues(centerLat, centerLng, currentUserId);
  }

  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching issues from Supabase:", error);
      return getLocalIssues(centerLat, centerLng);
    }

    if (!data || data.length === 0) {
      // Seed default issues into Supabase so it has initial items plotted relative to user
      const seededDbIssues = BASE_ISSUES.map((issue, idx) => {
        const id = `seed-${idx}`;
        const lat = centerLat + issue.latOffset;
        const lng = centerLng + issue.lngOffset;
        return {
          id,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          severity: issue.severity,
          status: issue.status,
          lat,
          lng,
          upvotes: issue.upvotes,
          media_url: issue.mediaUrl,
          media_type: issue.mediaType,
          created_at: new Date(Date.now() - (idx * 3600000)).toISOString()
        };
      });

      const { error: insertError } = await supabase
        .from('issues')
        .insert(seededDbIssues);

      if (insertError) {
        console.error("Failed to seed base issues to Supabase:", insertError);
      } else {
        console.log("Seeded database with default coordinates.");
        return seededDbIssues.map(db => mapDbToIssue(db as unknown as DbIssue, centerLat, centerLng, currentUserId));
      }
    }

    return (data as DbIssue[]).map(db => mapDbToIssue(db, centerLat, centerLng, currentUserId));
  } catch (e) {
    console.error("Failed to query Supabase, falling back to local storage:", e);
    return getLocalIssues(centerLat, centerLng, currentUserId);
  }
}

export async function saveIssue(
  issue: Omit<Issue, 'id' | 'createdAt' | 'upvotes' | 'status'>,
  centerLat: number,
  centerLng: number,
  currentUserId?: string
): Promise<Issue> {
  if (!supabase) {
    return saveLocalIssue(issue, centerLat, centerLng, currentUserId);
  }

  try {
    let finalMediaUrl = issue.mediaUrl;
    
    // Upload media if it's a blob URL
    if (issue.mediaUrl.startsWith('blob:')) {
      const response = await fetch(issue.mediaUrl);
      const blob = await response.blob();
      
      const fileExt = issue.mediaType === 'video' ? 'mp4' : 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('civicpulse-media')
        .upload(filePath, blob, {
          contentType: blob.type,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Failed to upload media to Supabase storage:", uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('civicpulse-media')
        .getPublicUrl(filePath);

      finalMediaUrl = publicUrlData.publicUrl;
    }

    const newIssueId = `user-${Date.now()}`;
    const dbIssue: DbIssue = {
      id: newIssueId,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      severity: issue.severity,
      status: 'Reported',
      lat: issue.lat,
      lng: issue.lng,
      upvotes: 1,
      media_url: finalMediaUrl,
      media_type: issue.mediaType,
      created_at: new Date().toISOString(),
      user_id: currentUserId
    };

    const { error: insertError } = await supabase
      .from('issues')
      .insert([dbIssue]);

    if (insertError) {
      console.error("Failed to insert issue in Supabase:", insertError);
      throw insertError;
    }

    // Save upvoted status locally
    const upvotedIds = getLocalUpvotedIds();
    setLocalUpvotedIds([...upvotedIds, newIssueId]);

    // Track created issue locally
    const createdIds = getLocalCreatedIds();
    setLocalCreatedIds([...createdIds, newIssueId]);

    return mapDbToIssue(dbIssue, centerLat, centerLng, currentUserId);
  } catch (e) {
    console.error("Supabase saveIssue failed, falling back to local storage:", e);
    return saveLocalIssue(issue, centerLat, centerLng, currentUserId);
  }
}

export async function toggleUpvoteIssue(id: string, centerLat: number, centerLng: number, currentUserId?: string): Promise<Issue[]> {
  if (!supabase) {
    return toggleLocalUpvoteIssue(id, centerLat, centerLng);
  }

  try {
    const upvotedIds = getLocalUpvotedIds();
    const isCurrentlyUpvoted = upvotedIds.includes(id);

    // Fetch current upvotes
    const { data: fetchResult, error: fetchError } = await supabase
      .from('issues')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error("Error fetching upvotes for issue:", fetchError);
      throw fetchError;
    }

    const currentUpvotes = fetchResult.upvotes || 0;
    const nextUpvotes = isCurrentlyUpvoted 
      ? Math.max(0, currentUpvotes - 1) 
      : currentUpvotes + 1;

    const { error: updateError } = await supabase
      .from('issues')
      .update({ upvotes: nextUpvotes })
      .eq('id', id);

    if (updateError) {
      console.error("Error updating upvote count in Supabase:", updateError);
      throw updateError;
    }

    // Update local storage upvoted list
    if (isCurrentlyUpvoted) {
      setLocalUpvotedIds(upvotedIds.filter(x => x !== id));
    } else {
      setLocalUpvotedIds([...upvotedIds, id]);
    }

    return getIssues(centerLat, centerLng, currentUserId);
  } catch (e) {
    console.error("Supabase toggleUpvoteIssue failed, falling back to local storage:", e);
    return toggleLocalUpvoteIssue(id, centerLat, centerLng, currentUserId);
  }
}

export function voteLocalIssueResolved(id: string, centerLat: number, centerLng: number, currentUserId?: string): Issue[] {
  const currentIssues = getLocalIssues(centerLat, centerLng, currentUserId);
  const resolvedVotedIds = getLocalResolvedVotedIds();
  const isVoted = resolvedVotedIds.includes(id);

  const updated = currentIssues.map(issue => {
    if (issue.id === id) {
      let votes = issue.resolvedVotes || 0;
      if (isVoted) {
        votes = Math.max(0, votes - 1);
      } else {
        votes += 1;
      }

      let newStatus = issue.status;
      if (votes >= 3) {
        newStatus = 'Resolved';
      } else if (issue.status === 'Resolved') {
        newStatus = 'Reported';
      }

      return {
        ...issue,
        resolvedVotes: votes,
        status: newStatus
      };
    }
    return issue;
  });

  if (isVoted) {
    setLocalResolvedVotedIds(resolvedVotedIds.filter(x => x !== id));
  } else {
    setLocalResolvedVotedIds([...resolvedVotedIds, id]);
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return getLocalIssues(centerLat, centerLng, currentUserId);
}

export async function voteIssueResolved(id: string, centerLat: number, centerLng: number, currentUserId?: string): Promise<Issue[]> {
  if (!supabase) {
    return voteLocalIssueResolved(id, centerLat, centerLng, currentUserId);
  }

  try {
    const resolvedVotedIds = getLocalResolvedVotedIds();
    const isVoted = resolvedVotedIds.includes(id);

    // Fetch current resolved_votes and status
    const { data: fetchResult, error: fetchError } = await supabase
      .from('issues')
      .select('resolved_votes, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error("Error fetching resolved votes from Supabase:", fetchError);
      throw fetchError;
    }

    const currentVotes = fetchResult.resolved_votes || 0;
    const nextVotes = isVoted
      ? Math.max(0, currentVotes - 1)
      : currentVotes + 1;

    let nextStatus = fetchResult.status;
    if (nextVotes >= 3) {
      nextStatus = 'Resolved';
    } else if (fetchResult.status === 'Resolved') {
      nextStatus = 'Reported';
    }

    const { error: updateError } = await supabase
      .from('issues')
      .update({
        resolved_votes: nextVotes,
        status: nextStatus
      })
      .eq('id', id);

    if (updateError) {
      console.error("Error updating resolved votes in Supabase:", updateError);
      throw updateError;
    }

    // Update local voted list
    if (isVoted) {
      setLocalResolvedVotedIds(resolvedVotedIds.filter(x => x !== id));
    } else {
      setLocalResolvedVotedIds([...resolvedVotedIds, id]);
    }

    return getIssues(centerLat, centerLng, currentUserId);
  } catch (e) {
    console.error("Supabase voteIssueResolved failed, falling back to local storage:", e);
    return voteLocalIssueResolved(id, centerLat, centerLng);
  }
}

export function deleteLocalIssue(id: string, centerLat: number, centerLng: number, currentUserId?: string): Issue[] {
  if (typeof window === 'undefined') return [];

  // 1. Remove from civicpulse_issues
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Issue[];
      const updated = parsed.filter(i => i.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to parse/update issues during delete:", e);
    }
  }

  // 2. Remove from civicpulse_created_issues
  const createdIds = getLocalCreatedIds();
  if (createdIds.includes(id)) {
    setLocalCreatedIds(createdIds.filter(x => x !== id));
  }

  // 3. Clean up upvoted/resolved lists too
  const upvotedIds = getLocalUpvotedIds();
  if (upvotedIds.includes(id)) {
    setLocalUpvotedIds(upvotedIds.filter(x => x !== id));
  }

  const resolvedVotedIds = getLocalResolvedVotedIds();
  if (resolvedVotedIds.includes(id)) {
    setLocalResolvedVotedIds(resolvedVotedIds.filter(x => x !== id));
  }

  return getLocalIssues(centerLat, centerLng, currentUserId);
}

export async function deleteIssue(id: string, centerLat: number, centerLng: number, currentUserId?: string): Promise<Issue[]> {
  // Always update local storage first as local state cache / fallback
  deleteLocalIssue(id, centerLat, centerLng, currentUserId);

  if (!supabase) {
    return getLocalIssues(centerLat, centerLng, currentUserId);
  }

  try {
    const { data, error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error deleting issue from Supabase:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      // Check if the issue actually exists in the database
      const { data: checkData, error: checkError } = await supabase
        .from('issues')
        .select('id')
        .eq('id', id);

      if (!checkError && checkData && checkData.length > 0) {
        // The issue exists, meaning it was blocked by RLS policies
        const msg = "No rows deleted in Supabase. You likely need to enable 'DELETE' permissions on the 'issues' table or check your Row Level Security (RLS) policies in the Supabase Dashboard.";
        console.warn(msg);
        throw new Error(msg);
      } else {
        // The issue did not exist (already deleted or local mock issue), so handle it silently
        console.log("Issue did not exist in Supabase or was already deleted. Proceeding silently.");
      }
    }

    return getIssues(centerLat, centerLng, currentUserId);
  } catch (e) {
    console.error("Supabase deleteIssue failed:", e);
    throw e;
  }
}

export function updateLocalIssueStatus(id: string, status: IssueStatus, centerLat: number, centerLng: number): Issue[] {
  const currentIssues = getLocalIssues(centerLat, centerLng);
  const updated = currentIssues.map(issue => {
    if (issue.id === id) {
      return { ...issue, status };
    }
    return issue;
  });
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return getLocalIssues(centerLat, centerLng);
}

export async function updateIssueStatus(id: string, status: IssueStatus, centerLat: number, centerLng: number, currentUserId?: string): Promise<Issue[]> {
  updateLocalIssueStatus(id, status, centerLat, centerLng);

  if (!supabase) {
    return getLocalIssues(centerLat, centerLng);
  }

  try {
    const { error } = await supabase
      .from('issues')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error("Error updating issue status in Supabase:", error);
      throw error;
    }

    return getIssues(centerLat, centerLng, currentUserId);
  } catch (e) {
    console.error("Supabase updateIssueStatus failed, falling back to local storage:", e);
    return getLocalIssues(centerLat, centerLng);
  }
}

