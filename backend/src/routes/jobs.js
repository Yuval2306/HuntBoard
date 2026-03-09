const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(auth);

// GET /api/jobs — get all jobs for current user
router.get('/', async (req, res) => {
  try {
    const { status, field, search, sort = 'appliedAt', order = 'desc' } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'all') query.status = status;
    if (field && field !== 'all') query.field = field;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj = { [sort]: order === 'desc' ? -1 : 1 };
    const jobs = await Job.find(query).sort(sortObj).select('-cvData'); // exclude heavy cvData from list

    res.json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/jobs/stats — aggregated stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [statusCounts, fieldCounts, weeklyData] = await Promise.all([
      // Count by status
      Job.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Count by field
      Job.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$field', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Weekly applications (last 8 weeks)
      Job.aggregate([
        { $match: { user: userId, appliedAt: { $gte: new Date(Date.now() - 56 * 86400000) } } },
        {
          $group: {
            _id: { $week: '$appliedAt' },
            count: { $sum: 1 },
          }
        },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    const total = await Job.countDocuments({ user: userId });
    const statMap = {};
    statusCounts.forEach(s => { statMap[s._id] = s.count; });

    const responded = (statMap.interview || 0) + (statMap.offer || 0) + (statMap.rejected || 0);
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    res.json({
      total,
      applied: statMap.applied || 0,
      inProgress: statMap.in_progress || 0,
      interview: statMap.interview || 0,
      offer: statMap.offer || 0,
      rejected: statMap.rejected || 0,
      ghosted: statMap.ghosted || 0,
      responseRate,
      byField: fieldCounts.map(f => ({ name: f._id?.split('/')[0]?.trim() || f._id, count: f.count })),
      byWeek: weeklyData.map(w => ({ week: `W${w._id}`, count: w.count })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/jobs/:id — single job with CV data
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/jobs — create new job
router.post('/', async (req, res) => {
  try {
    const {
      title, company, field, status, url, location, salary,
      description, requirements, employmentType, experienceLevel,
      contactName, contactPhone, contactLinkedin, contactEmail,
      cvFileName, cvData, notes, reminderDays, appliedAt,
    } = req.body;

    if (!title || !company) return res.status(400).json({ error: 'Title and company required' });

    const job = await Job.create({
      user: req.user._id,
      title, company, field, status, url, location, salary,
      description, requirements, employmentType, experienceLevel,
      contactName, contactPhone, contactLinkedin, contactEmail,
      cvFileName, cvData, notes, reminderDays,
      appliedAt: appliedAt || new Date(),
    });

    res.status(201).json({ job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/jobs/:id — update job
router.patch('/:id', async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/jobs — delete all jobs for user
router.delete('/', async (req, res) => {
  try {
    await Job.deleteMany({ user: req.user._id });
    res.json({ message: 'All jobs deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
