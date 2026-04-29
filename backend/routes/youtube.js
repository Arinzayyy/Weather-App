// YouTube Data API v3 — search weather & outdoor condition videos for a location.
// Keeps the API key server-side so it never hits the browser.
// Serves user story US-09: Marcus (event planner) wants to understand the real-world
// climate character of a venue city beyond raw numbers.
// GET /api/youtube?location=Chicago,IL  → { videos: [...] }
const express = require('express');
const axios   = require('axios');
const router  = express.Router();

const YT_BASE = 'https://www.googleapis.com/youtube/v3/search';

router.get('/', async (req, res, next) => {
  try {
    const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
    if (!location) {
      const e = new Error('location query param is required');
      e.statusCode = 400;
      throw e;
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      const e = new Error('YouTube API key is not configured.');
      e.statusCode = 503;
      throw e;
    }

    const sharedParams = {
      key:               apiKey,
      part:              'snippet',
      type:              'video',
      relevanceLanguage: 'en',
      safeSearch:        'strict',
    };

    // Two intentional searches in parallel:
    //  - 2 weather/conditions videos  (serves: understand climate character)
    //  - 1 events/activities video    (serves: understand what happens in the area)
    const [weatherRes, eventsRes] = await Promise.all([
      axios.get(YT_BASE, { params: { ...sharedParams, q: location + ' weather conditions outdoor', maxResults: 2 } }),
      axios.get(YT_BASE, { params: { ...sharedParams, q: location + ' events activities',           maxResults: 1 } }),
    ]);

    function mapItem(item) {
      return {
        videoId:      item.id.videoId,
        title:        item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail:    item.snippet.thumbnails.medium
                      ? item.snippet.thumbnails.medium.url
                      : item.snippet.thumbnails.default.url,
        publishedAt:  item.snippet.publishedAt,
      };
    }

    const videos = [
      ...(weatherRes.data.items || []).map(mapItem),
      ...(eventsRes.data.items  || []).map(mapItem),
    ];

    res.json({ location, videos });
  } catch (err) {
    // Bubble up Axios HTTP errors with a clean message
    if (err.response) {
      const msg = (err.response.data && err.response.data.error && err.response.data.error.message)
        || 'YouTube API error';
      const wrapped = new Error(msg);
      wrapped.statusCode = err.response.status;
      return next(wrapped);
    }
    next(err);
  }
});

module.exports = router;
