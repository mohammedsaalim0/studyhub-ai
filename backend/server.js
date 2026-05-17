import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { db } from './db.js';
import { startDeadlineScheduler, getSimulatedSMSLogs, sendTaskSMS } from './smsService.js';
import { generateStudyPlan } from './aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'STUDY_HUB_ULTIMATE_NEON_SECRET_2026';

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support base64 file uploads in JSON

// Transparently strip Vercel's routePrefix (/_/backend) to support multi-service proxying
app.use((req, res, next) => {
  if (req.url.startsWith('/_/backend')) {
    req.url = req.url.substring('/_/backend'.length);
  }
  next();
});

// --- AUTHENTICATION MIDDLEWARE ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token found.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}

// --- AUTHENTICATION ENDPOINTS ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, password, phone } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide both username and password.' });
  }

  try {
    // Check if user already exists
    const existingUser = db.findOne('users', { username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save user
    const newUser = db.insert('users', {
      username: username.toLowerCase(),
      passwordHash,
      twilioConfig: {
        toPhone: phone || ''
      },
      geminiApiKey: ''
    });

    // Create token
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: newUser.id, username: newUser.username }
    });
  } catch (error) {
    console.error('Registration Exception:', error);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide username and password.' });
  }

  try {
    const user = db.findOne('users', { username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Login Exception:', error);
    res.status(500).json({ error: 'Server error during login. Please try again.' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.findOne('users', { id: req.user.id });
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({
    id: user.id,
    username: user.username,
    hasTwilioConfig: !!(user.twilioConfig?.accountSid && user.twilioConfig?.authToken),
    hasGeminiKey: !!user.geminiApiKey
  });
});


// --- TASKS ENDPOINTS ---

// Get User Tasks
app.get('/api/tasks', authenticateToken, (req, res) => {
  const tasks = db.find('tasks', { userId: req.user.id });
  res.json(tasks);
});

// Create Task
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, subject, deadline } = req.body;
  if (!title || !deadline) {
    return res.status(400).json({ error: 'Title and deadline are required.' });
  }

  const newTask = db.insert('tasks', {
    userId: req.user.id,
    title,
    description: description || '',
    subject: subject || 'General',
    deadline, // ISO string
    completed: false,
    smsSent: false
  });

  res.status(201).json(newTask);
});

// Update Task (Toggle complete, modify details)
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, subject, deadline, completed } = req.body;

  const task = db.findOne('tasks', { id, userId: req.user.id });
  if (!task) {
    return res.status(404).json({ error: 'Task not found or unauthorized.' });
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (subject !== undefined) updates.subject = subject;
  if (deadline !== undefined) {
    updates.deadline = deadline;
    // Reset smsSent if they change the deadline to a future date
    if (new Date(deadline) > new Date()) {
      updates.smsSent = false;
    }
  }
  if (completed !== undefined) updates.completed = completed;

  db.update('tasks', { id, userId: req.user.id }, updates);
  const updatedTask = db.findOne('tasks', { id });
  res.json(updatedTask);
});

// Delete Task
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const deletedCount = db.delete('tasks', { id, userId: req.user.id });
  
  if (deletedCount === 0) {
    return res.status(404).json({ error: 'Task not found or unauthorized.' });
  }
  res.json({ success: true, message: 'Task successfully deleted.' });
});

// Trigger Instant SMS for Testing
app.post('/api/tasks/:id/test-sms', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const task = db.findOne('tasks', { id, userId: req.user.id });
  const user = db.findOne('users', { id: req.user.id });

  if (!task || !user) {
    return res.status(404).json({ error: 'Task or User not found.' });
  }

  const smsResult = await sendTaskSMS(user, task);
  res.json({ success: true, ...smsResult });
});


// --- NOTES & LIBRARY ENDPOINTS ---

// Get Notes
app.get('/api/library/notes', authenticateToken, (req, res) => {
  const notes = db.find('library', { userId: req.user.id });
  res.json(notes);
});

// Create/Update Note
app.post('/api/library/notes', authenticateToken, (req, res) => {
  const { id, folderName, noteTitle, noteContent, fileData, fileName, fileType } = req.body;
  if (!folderName || !noteTitle) {
    return res.status(400).json({ error: 'Folder name and note title are required.' });
  }

  if (id) {
    // Update existing
    const existing = db.findOne('library', { id, userId: req.user.id });
    if (!existing) return res.status(404).json({ error: 'Note not found.' });

    const updates = { folderName, noteTitle, noteContent: noteContent || '' };
    if (fileData !== undefined) {
      updates.fileData = fileData;
      updates.fileName = fileName || null;
      updates.fileType = fileType || null;
    }

    db.update('library', { id, userId: req.user.id }, updates);
    res.json(db.findOne('library', { id }));
  } else {
    // Insert new
    const newNote = db.insert('library', {
      userId: req.user.id,
      folderName,
      noteTitle,
      noteContent: noteContent || '',
      fileData: fileData || null, // Stored inside database as base64 string
      fileName: fileName || null,
      fileType: fileType || null
    });
    res.status(201).json(newNote);
  }
});

// Delete Note
app.delete('/api/library/notes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const deletedCount = db.delete('library', { id, userId: req.user.id });
  
  if (deletedCount === 0) {
    return res.status(404).json({ error: 'Note not found.' });
  }
  res.json({ success: true, message: 'Note deleted.' });
});


// --- AI PLANNER ENDPOINTS ---

// Get generated plans
app.get('/api/ai/plans', authenticateToken, (req, res) => {
  const plans = db.find('study_plans', { userId: req.user.id });
  res.json(plans);
});

// Generate AI Study Plan
app.post('/api/ai/generate-plan', authenticateToken, async (req, res) => {
  const { subjectsUnits, deadline } = req.body;
  if (!subjectsUnits || !deadline) {
    return res.status(400).json({ error: 'Subjects/units and exam deadline are required.' });
  }

  try {
    const planContent = await generateStudyPlan(req.user.id, subjectsUnits, deadline);

    const savedPlan = db.insert('study_plans', {
      userId: req.user.id,
      subjectsUnits,
      deadline,
      planContent
    });

    res.json(savedPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate study plan: ' + error.message });
  }
});


// --- PROFILE & SETTINGS ENDPOINTS ---

// Get Settings
app.get('/api/settings', authenticateToken, (req, res) => {
  const user = db.findOne('users', { id: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found.' });

  // Mask sensitive credentials
  const mask = (str) => str ? '•'.repeat(8) + str.slice(-4) : '';
  const tw = user.twilioConfig || {};

  res.json({
    twilioConfig: {
      accountSid: tw.accountSid ? mask(tw.accountSid) : '',
      authToken: tw.authToken ? '••••••••••••••••' : '',
      fromPhone: tw.fromPhone || '',
      toPhone: tw.toPhone || ''
    },
    geminiApiKey: user.geminiApiKey ? '••••••••••••••••' : ''
  });
});

// Update Settings
app.put('/api/settings', authenticateToken, (req, res) => {
  const { twilioConfig, geminiApiKey } = req.body;
  const user = db.findOne('users', { id: req.user.id });

  if (!user) return res.status(404).json({ error: 'User not found.' });

  const updates = {};
  
  if (twilioConfig) {
    const currentTw = user.twilioConfig || {};
    // Only update Twilio fields if they aren't masked place-holders
    const nextTw = { ...currentTw };
    
    if (twilioConfig.accountSid && !twilioConfig.accountSid.includes('•')) {
      nextTw.accountSid = twilioConfig.accountSid;
    }
    if (twilioConfig.authToken && !twilioConfig.authToken.includes('•')) {
      nextTw.authToken = twilioConfig.authToken;
    }
    if (twilioConfig.fromPhone !== undefined) {
      nextTw.fromPhone = twilioConfig.fromPhone;
    }
    if (twilioConfig.toPhone !== undefined) {
      nextTw.toPhone = twilioConfig.toPhone;
    }

    updates.twilioConfig = nextTw;
  }

  if (geminiApiKey !== undefined) {
    // Only update if it's not the masked placeholder
    if (!geminiApiKey.includes('•')) {
      updates.geminiApiKey = geminiApiKey;
    }
  }

  db.update('users', { id: req.user.id }, updates);
  res.json({ success: true, message: 'Settings successfully updated!' });
});


// --- SYSTEM LOGS ENDPOINTS (FOR SIMULATION VISIBILITY) ---
app.get('/api/logs/sms', authenticateToken, (req, res) => {
  // Return simulated SMS alerts for this user's tasks
  const logs = getSimulatedSMSLogs();
  const userLogs = logs.filter(log => {
    const task = db.findOne('tasks', { id: log.taskId });
    return task && task.userId === req.user.id;
  });
  res.json(userLogs);
});


// --- APP INITS ---
app.listen(PORT, () => {
  console.log(`🚀 Study Hub Express Server running on http://localhost:${PORT}`);
  // Start the background deadline task checker
  startDeadlineScheduler();
});
