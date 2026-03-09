// Email reminder system using EmailJS (free tier)
// Users need to configure their EmailJS account

export function scheduleReminders(jobs, userEmail) {
  const reminders = [];
  const now = new Date();

  jobs.forEach(job => {
    if (job.status === 'applied' || job.status === 'in_progress') {
      const applied = new Date(job.appliedAt);
      const daysSince = Math.floor((now - applied) / 86400000);
      const nextCheck = job.reminderDays || 7;

      if (daysSince >= nextCheck) {
        reminders.push({
          jobId: job.id,
          title: job.title,
          company: job.company,
          daysSince,
          message: `You applied to ${job.title} at ${job.company} ${daysSince} days ago. Have you heard back?`
        });
      }
    }
  });

  return reminders;
}

export async function sendReminderEmail(to, jobTitle, company, daysSince, serviceId, templateId, publicKey) {
  // EmailJS integration - loaded via CDN in production
  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS not configured');
    return false;
  }

  try {
    if (typeof window.emailjs === 'undefined') {
      console.warn('EmailJS not loaded');
      return false;
    }
    await window.emailjs.send(serviceId, templateId, {
      to_email: to,
      job_title: jobTitle,
      company_name: company,
      days_since: daysSince,
      message: `You applied to ${jobTitle} at ${company} ${daysSince} days ago. Time to follow up!`,
    }, publicKey);
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

// Check reminders on page load and store last check
export function checkAndStoreReminders(jobs) {
  const lastCheck = localStorage.getItem('at_last_reminder_check');
  const now = Date.now();
  
  // Check once per day
  if (lastCheck && (now - parseInt(lastCheck)) < 86400000) return [];
  
  localStorage.setItem('at_last_reminder_check', now.toString());
  return scheduleReminders(jobs);
}
