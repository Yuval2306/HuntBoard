const express = require('express');
const nodemailer = require('nodemailer');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// POST /api/reminders/send — send reminder email for a specific job
router.post('/send', async (req, res) => {
  try {
    const { jobId } = req.body;
    const job = await Job.findOne({ _id: jobId, user: req.user._id });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const daysSince = Math.floor((Date.now() - new Date(job.appliedAt)) / 86400000);

    // Use Gmail with App Password
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(503).json({ error: 'Email not configured on server' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"ApplyTrack" <${process.env.EMAIL_USER}>`,
      to: req.user.email,
      subject: `⏰ Follow up: ${job.title} at ${job.company}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0f0f18; color: #e8e8f0; border-radius: 12px;">
          <h2 style="color: #6c63ff; margin-bottom: 4px;">ApplyTrack Reminder</h2>
          <p style="color: #9090b0; margin-bottom: 24px;">Time to follow up on your application</p>
          
          <div style="background: #15151f; border: 1px solid #1e1e2e; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${job.title}</div>
            <div style="color: #9090b0; font-size: 14px;">@ ${job.company}</div>
            ${job.location ? `<div style="color: #5a5a7a; font-size: 13px; margin-top: 4px;">📍 ${job.location}</div>` : ''}
          </div>
          
          <p style="color: #e8e8f0;">You applied <strong style="color: #6c63ff;">${daysSince} days ago</strong> and haven't heard back yet.</p>
          <p style="color: #9090b0; font-size: 14px;">Consider sending a polite follow-up message to the hiring team.</p>
          
          ${job.contactName ? `
          <div style="background: #15151f; border-radius: 8px; padding: 12px; margin-top: 16px;">
            <div style="font-size: 13px; color: #5a5a7a; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">Contact</div>
            <div style="font-weight: 500;">${job.contactName}</div>
            ${job.contactPhone ? `<div style="color: #9090b0; font-size: 13px;">${job.contactPhone}</div>` : ''}
            ${job.contactLinkedin ? `<a href="${job.contactLinkedin}" style="color: #6c63ff; font-size: 13px;">LinkedIn Profile →</a>` : ''}
          </div>` : ''}
          
          ${job.url ? `<a href="${job.url}" style="display:inline-block; margin-top:16px; background:#6c63ff; color:white; padding:10px 18px; border-radius:8px; text-decoration:none; font-size:14px;">View Job Posting →</a>` : ''}
          
          <hr style="border: none; border-top: 1px solid #1e1e2e; margin: 24px 0;">
          <p style="font-size: 12px; color: #5a5a7a;">You're receiving this because you set a reminder in ApplyTrack.</p>
        </div>
      `,
    });

    // Mark reminder as sent
    await Job.findByIdAndUpdate(jobId, { reminderSent: true });

    res.json({ message: 'Reminder sent successfully' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

// GET /api/reminders/pending — jobs that need follow-up
router.get('/pending', async (req, res) => {
  try {
    const jobs = await Job.find({
      user: req.user._id,
      status: { $in: ['applied', 'in_progress'] },
      reminderSent: false,
    }).select('-cvData');

    const pending = jobs.filter(j => {
      const daysSince = Math.floor((Date.now() - new Date(j.appliedAt)) / 86400000);
      return daysSince >= (j.reminderDays || 7);
    });

    res.json({ pending, count: pending.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
