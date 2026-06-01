import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  redisUrl: process.env.REDIS_URL || null,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  // Real-world Social Scrapers Integration credentials
  youtubeApiKey: process.env.YOUTUBE_API_KEY || null,
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN || null,
  scrapingbeeApiKey: process.env.SCRAPINGBEE_API_KEY || null,
};
