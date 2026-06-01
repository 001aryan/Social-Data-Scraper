export type Platform = 'twitter' | 'instagram' | 'linkedin' | 'youtube';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ScraperJob {
  id: string;
  name: string;
  platform: Platform;
  type: 'hashtag' | 'profile' | 'keyword' | 'comments';
  target: string;
  limit: number;
  status: JobStatus;
  progress: number; // 0 to 100
  duration: number; // in seconds
  createdAt: string;
  completedAt?: string;
  resultsCount: number;
  results?: Array<Record<string, any>>;
  logs: string[];
}

export interface PlatformConfig {
  id: Platform;
  name: string;
  icon: string;
  description: string;
  avgSpeed: string;
  activeJobs: number;
  successRate: number;
  fields: Array<{
    name: string;
    label: string;
    placeholder: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
    required: boolean;
  }>;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar: string;
}

export interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  icon: string;
  description: string;
}

export interface TourStep {
  tab: 'dashboard' | 'new' | 'jobs' | 'analytics' | 'exports' | 'settings' | null;
  title: string;
  badge: string;
  description: string;
  features: string[];
}
