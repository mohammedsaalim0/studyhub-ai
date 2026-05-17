import twilio from 'twilio';
import { db } from './db.js';

// Dictionary to track active timers or logged simulated texts in memory
const simulatedSMSLogs = [];

export function getSimulatedSMSLogs() {
  return simulatedSMSLogs;
}

// Function to send SMS for a specific task
export async function sendTaskSMS(user, task) {
  const twilioConfig = user.twilioConfig || {};
  const { accountSid, authToken, fromPhone, toPhone } = twilioConfig;

  const messageText = `📚 STUDY ALERT: Your task "${task.title}" for subject "${task.subject || 'General'}" has reached its deadline! Time to study! 🎯`;

  if (accountSid && authToken && fromPhone && toPhone) {
    try {
      console.log(`[SMS Service] Sending real SMS via Twilio to ${toPhone}...`);
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        body: messageText,
        from: fromPhone,
        to: toPhone
      });
      console.log(`[SMS Service] Real SMS sent! Message SID: ${message.sid}`);
      return { success: true, sid: message.sid, real: true };
    } catch (error) {
      console.error('[SMS Service] Failed to send real SMS:', error.message);
      // Fallback to simulation log
      logSimulatedSMS(task, messageText, `FAILED REAL: ${error.message}`);
      return { success: false, error: error.message, simulated: true };
    }
  } else {
    // Simulated Mode
    logSimulatedSMS(task, messageText, 'SIMULATED (No Twilio keys configured in Settings)');
    return { success: true, simulated: true };
  }
}

function logSimulatedSMS(task, body, reason) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    id: Math.random().toString(36).substring(2, 9),
    taskTitle: task.title,
    taskId: task.id,
    subject: task.subject,
    body,
    timestamp,
    status: reason
  };
  simulatedSMSLogs.push(logEntry);
  // Keep logs capped at 100 entries
  if (simulatedSMSLogs.length > 100) {
    simulatedSMSLogs.shift();
  }

  console.log('\n======================================================');
  console.log(`📢 [SMS SIMULATION] ${reason.toUpperCase()}`);
  console.log(`🕒 Timestamp: ${timestamp}`);
  console.log(`💬 Message: "${body}"`);
  console.log('======================================================\n');
}

// Background scheduler running every 5 seconds to check for reached deadlines
export function startDeadlineScheduler() {
  console.log('[Scheduler] Deadline check scheduler started (running every 5 seconds)...');
  
  setInterval(() => {
    try {
      const now = new Date();
      // Find all tasks that are:
      // 1. Not completed
      // 2. Deadline is in the past or exactly now (<= now)
      // 3. SMS has NOT been sent yet
      const pendingTasks = db.find('tasks', (task) => {
        if (task.completed || task.smsSent) return false;
        const deadlineDate = new Date(task.deadline);
        return deadlineDate <= now;
      });

      if (pendingTasks.length > 0) {
        console.log(`[Scheduler] Found ${pendingTasks.length} task(s) that hit their deadline!`);
        
        pendingTasks.forEach(async (task) => {
          // Find the task's user
          const user = db.findOne('users', { id: task.userId });
          if (!user) {
            console.error(`[Scheduler] No user found for task ${task.id}, skipping.`);
            return;
          }

          // Send SMS
          await sendTaskSMS(user, task);

          // Update task smsSent to true
          db.update('tasks', { id: task.id }, { smsSent: true });
        });
      }
    } catch (error) {
      console.error('[Scheduler] Error in deadline scanning cycle:', error);
    }
  }, 5000); // 5 seconds interval
}
