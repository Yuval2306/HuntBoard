const express = require('express');
const auth = require('../middleware/auth');
const cheerio = require('cheerio');

const router = express.Router();
router.use(auth);

// Extract LinkedIn job ID from URL
function getLinkedInJobId(url) {
  const match = url.match(/\/jobs\/view\/(\d+)/);
  return match ? match[1] : null;
}

// Fetch LinkedIn job via their internal guest API
async function fetchLinkedInJob(url) {
  try {
    const jobId = getLinkedInJobId(url);
    if (!jobId) return null;

    const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.linkedin.com/',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract relevant sections
    const title = $('.top-card-layout__title').text().trim();
    const company = $('.topcard__org-name-link').text().trim() || $('.top-card-layout__second-subline').text().trim();
    const location = $('.topcard__flavor--bullet').text().trim();
    const description = $('.description__text').text().trim();

    const text = `
      Job Title: ${title}
      Company: ${company}
      Location: ${location}
      Description: ${description}
    `.replace(/\s+/g, ' ').trim();

    return text.length > 50 ? text : null;
  } catch (err) {
    console.error('LinkedIn fetch error:', err.message);
    return null;
  }
}

// Fetch any other job site
async function fetchPageSimple(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000);
  } catch (err) {
    console.error('Simple fetch error:', err.message);
    return null;
  }
}

router.post('/', async (req, res) => {
  try {
    const { urlOrText } = req.body;
    if (!urlOrText) return res.status(400).json({ error: 'URL or text required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'Gemini not configured on server' });

    let inputText = urlOrText;

    const isUrl = urlOrText.startsWith('http://') || urlOrText.startsWith('https://');
    if (isUrl) {
      const isLinkedIn = urlOrText.includes('linkedin.com');
      let pageText = null;

      if (isLinkedIn) {
        pageText = await fetchLinkedInJob(urlOrText);
      } else {
        pageText = await fetchPageSimple(urlOrText);
      }

      if (pageText && pageText.length > 50) {
        inputText = pageText;
      } else {
        return res.status(422).json({
          error: isLinkedIn
            ? 'Could not fetch LinkedIn job. Please paste the job description text directly.'
            : 'Could not fetch page. Please paste the job description text directly.',
        });
      }
    }

    const prompt = `You are a job listing parser. Extract structured data from this job posting text.
Return ONLY a valid JSON object with these exact fields (use empty string if not found):
{
  "title": "Job title",
  "company": "Company name",
  "field": "One of: Software Development, Information Systems, IT / Infra, Data Engineering, Machine Learning / AI, DevOps / Cloud, Cybersecurity, QA / Testing, Frontend, Backend, Full Stack, Mobile, Other",
  "location": "City, Country or Remote",
  "salary": "Salary range if mentioned, else empty string",
  "description": "2-3 sentence summary of the role",
  "requirements": "Key requirements as comma-separated list",
  "employmentType": "Full-time / Part-time / Contract / Internship",
  "experienceLevel": "Junior / Mid / Senior / Not specified",
  "contactEmail": "If found",
  "contactName": "Hiring manager name if found"
}

Input: ${inputText}

Return ONLY the JSON, no markdown, no explanation.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: err.error?.message || 'Gemini API error' });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts
      .filter(p => p.text && !p.thought)
      .map(p => p.text)
      .join('');

    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsed = JSON.parse(clean);
      res.json({ job: parsed });
    } catch {
      console.error('Parse error, raw text:', text);
      res.status(502).json({ error: 'Could not parse job data. Try pasting the job description text directly.' });
    }
  } catch (err) {
    console.error('Extract error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;