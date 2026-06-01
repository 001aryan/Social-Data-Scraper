import { ScraperJob, PlatformConfig, TeamMember, Integration } from '../types';

const apiBearerToken = import.meta.env.VITE_API_BEARER_TOKEN || 'YOUR_API_BEARER_TOKEN';

export const PLATFORMS: Record<string, PlatformConfig> = {
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    icon: 'Twitter',
    description: 'Extract posts, replies, engagement metrics, user profiles, and hashtag trends.',
    avgSpeed: '120 posts/min',
    activeJobs: 14,
    successRate: 99.4,
    fields: [
      { name: 'target', label: 'Hashtag, Username, or Search Term', placeholder: 'e.g., #AI, @NASA, or "space exploration"', type: 'text', required: true },
      { name: 'type', label: 'Extraction Mode', placeholder: 'Select extraction mode', type: 'select', options: ['hashtag', 'profile', 'keyword'], required: true },
      { name: 'limit', label: 'Max Results Limit', placeholder: 'e.g., 500', type: 'number', required: true }
    ]
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'Instagram',
    description: 'Scrape media posts, captions, hashtags, comments count, likes, and profile settings code.',
    avgSpeed: '85 posts/min',
    activeJobs: 8,
    successRate: 98.2,
    fields: [
      { name: 'target', label: 'Hashtag or Profile Handle', placeholder: 'e.g., #travel, @natgeo', type: 'text', required: true },
      { name: 'type', label: 'Extraction Mode', placeholder: 'Select mode', type: 'select', options: ['hashtag', 'profile', 'comments'], required: true },
      { name: 'limit', label: 'Max Results Limit', placeholder: 'e.g., 200', type: 'number', required: true }
    ]
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'Linkedin',
    description: 'Target public company profiles, employee headcount metrics, open jobs listing, or posted publications.',
    avgSpeed: '45 entries/min',
    activeJobs: 3,
    successRate: 97.6,
    fields: [
      { name: 'target', label: 'Company Domain or Public Key', placeholder: 'e.g., google or "openai"', type: 'text', required: true },
      { name: 'type', label: 'Data Type', placeholder: 'Select data type', type: 'select', options: ['profile', 'keyword'], required: true },
      { name: 'limit', label: 'Limit', placeholder: 'e.g., 50', type: 'number', required: true }
    ]
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: 'Youtube',
    description: 'Scrape video details, description transcripts, comments, views metrics, and channel statistics.',
    avgSpeed: '150 videos/min',
    activeJobs: 11,
    successRate: 99.1,
    fields: [
      { name: 'target', label: 'Channel URL, Keyword, or Video ID', placeholder: 'e.g., WebDevSimplified or "React 19 Hooks"', type: 'text', required: true },
      { name: 'type', label: 'Extraction Mode', placeholder: 'Select mode', type: 'select', options: ['keyword', 'comments'], required: true },
      { name: 'limit', label: 'Max Results Limit', placeholder: 'e.g., 100', type: 'number', required: true }
    ]
  }
};

export const INITIAL_JOBS: ScraperJob[] = [];

export const INITIAL_TEAM: TeamMember[] = [
  { id: 'u1', name: 'Aryan Singh', email: 'singharyan5011@gmail.com', role: 'owner', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' },
  { id: 'u2', name: 'Sarah Connor', email: 'sarah.c@socialscraper.ai', role: 'admin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
  { id: 'u3', name: 'Alex Rivera', email: 'alex.r@socialscraper.ai', role: 'member', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' }
];

export const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'int-slack', name: 'Slack Alerts', status: 'connected', icon: 'Slack', description: 'Receive notification reports in #social-data channel when scrapes complete.' },
  { id: 'int-gdocs', name: 'Google Sheets Sink', status: 'connected', icon: 'FileSpreadsheet', description: 'Automatically import fresh scraped values directly to target Google spreadsheets.' },
  { id: 'int-webhook', name: 'Custom Developer Webhook', status: 'disconnected', icon: 'Webhook', description: 'Post JSON results block to your custom endpoint upon task completion.' },
  { id: 'int-notion', name: 'Notion Database Sync', status: 'disconnected', icon: 'Database', description: 'Append social mentions directly into targeted Notion content databases.' }
];

export const CODE_TEMPLATES = {
  curl: (jobId: string) => `curl -X GET "https://api.socialscraper.ai/v1/jobs/${jobId}/results" \
  -H "Authorization: Bearer ${apiBearerToken}" \
  -H "Accept: application/json"`,

  javascript: (jobId: string) => `// Fetch scrape results in node or browser
const response = await fetch('https://api.socialscraper.ai/v1/jobs/${jobId}/results', {
  headers: {
    'Authorization': 'Bearer ${apiBearerToken}',
    'Accept': 'application/json'
  }
});

const data = await response.json();
console.log(\`Successfully loaded \${data.count} social documents!\`);`,

  python: (jobId: string) => `# Install requests: pip install requests
import requests

url = "https://api.socialscraper.ai/v1/jobs/${jobId}/results"
headers = {
  "Authorization": "Bearer ${apiBearerToken}",
  "Accept": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()

print(f"Retrieved {len(data['results'])} posts from the cloud cache.")`
};
