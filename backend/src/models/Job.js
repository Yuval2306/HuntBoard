const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  field: {
    type: String,
    enum: [
      'Software Development', 'Information Systems', 'IT / Infra',
      'Data Engineering', 'Machine Learning / AI', 'DevOps / Cloud',
      'Cybersecurity', 'QA / Testing', 'Frontend', 'Backend',
      'Full Stack', 'Mobile', 'Other'
    ],
    default: 'Software Development',
  },
  status: {
    type: String,
    enum: ['applied', 'in_progress', 'interview', 'offer', 'rejected', 'ghosted'],
    default: 'applied',
  },
  url: { type: String, default: '' },
  location: { type: String, default: '' },
  salary: { type: String, default: '' },
  description: { type: String, default: '' },
  requirements: { type: String, default: '' },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-time',
  },
  experienceLevel: {
    type: String,
    enum: ['Junior', 'Mid', 'Senior', 'Not specified'],
    default: 'Junior',
  },
  // Contact person
  contactName: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactLinkedin: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  // CV stored as base64 (consider S3 for production)
  cvFileName: { type: String, default: '' },
  cvData: { type: String, default: '' }, // base64
  // Notes & reminders
  notes: { type: String, default: '' },
  reminderDays: { type: Number, default: 7 },
  reminderSent: { type: Boolean, default: false },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes for common queries
jobSchema.index({ user: 1, status: 1 });
jobSchema.index({ user: 1, appliedAt: -1 });
jobSchema.index({ user: 1, company: 1 });

module.exports = mongoose.model('Job', jobSchema);
