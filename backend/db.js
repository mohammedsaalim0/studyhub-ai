import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let DB_FILE = path.join(__dirname, 'data.json');

// In production Render environment, attempt using the persistent mounted SSD path.
// If the folder is missing, we automatically create it. If we lack permission, 
// we fall back gracefully to local backend storage to prevent any server crash.
if (process.env.RENDER) {
  try {
    const renderPath = '/opt/db/data.json';
    const dir = path.dirname(renderPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Verify file creation capability
    fs.writeFileSync(renderPath, JSON.stringify({ users: [], tasks: [], library: [], study_plans: [] }, null, 2), { flag: 'wx' });
    DB_FILE = renderPath;
    console.log('📦 Using persistent Render SSD disk for DB:', DB_FILE);
  } catch (err) {
    // If the file already exists (flag wx throws EEXIST), it is completely safe and we use the persistent disk!
    if (err.code === 'EEXIST') {
      DB_FILE = '/opt/db/data.json';
      console.log('📦 Using existing persistent Render SSD disk for DB:', DB_FILE);
    } else {
      console.warn('⚠️ Writable Render SSD directory not ready, falling back to local server storage:', err.message);
    }
  }
}

// Initialize database file if it doesn't exist
function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      tasks: [],
      library: [],
      study_plans: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

// Read database
export function readDb() {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file, resetting...', error);
    const initialData = { users: [], tasks: [], library: [], study_plans: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

// Write database (atomic and safe)
export function writeDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Generate unique sequential or random ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Helper methods acting like a lightweight ORM
export const db = {
  find: (collection, queryFnOrObject) => {
    const data = readDb();
    const list = data[collection] || [];
    if (typeof queryFnOrObject === 'function') {
      return list.filter(queryFnOrObject);
    }
    if (typeof queryFnOrObject === 'object') {
      return list.filter(item => {
        for (const key in queryFnOrObject) {
          if (item[key] !== queryFnOrObject[key]) return false;
        }
        return true;
      });
    }
    return list;
  },

  findOne: (collection, queryFnOrObject) => {
    const data = readDb();
    const list = data[collection] || [];
    if (typeof queryFnOrObject === 'function') {
      return list.find(queryFnOrObject) || null;
    }
    if (typeof queryFnOrObject === 'object') {
      return list.find(item => {
        for (const key in queryFnOrObject) {
          if (item[key] !== queryFnOrObject[key]) return false;
        }
        return true;
      }) || null;
    }
    return list[0] || null;
  },

  insert: (collection, record) => {
    const data = readDb();
    if (!data[collection]) {
      data[collection] = [];
    }
    const newRecord = {
      id: generateId(),
      ...record,
      createdAt: new Date().toISOString()
    };
    data[collection].push(newRecord);
    writeDb(data);
    return newRecord;
  },

  update: (collection, queryFnOrObject, updates) => {
    const data = readDb();
    const list = data[collection] || [];
    let updatedCount = 0;
    
    const updatedList = list.map(item => {
      let matches = false;
      if (typeof queryFnOrObject === 'function') {
        matches = queryFnOrObject(item);
      } else if (typeof queryFnOrObject === 'object') {
        matches = true;
        for (const key in queryFnOrObject) {
          if (item[key] !== queryFnOrObject[key]) {
            matches = false;
            break;
          }
        }
      }
      
      if (matches) {
        updatedCount++;
        return { ...item, ...updates, updatedAt: new Date().toISOString() };
      }
      return item;
    });

    data[collection] = updatedList;
    writeDb(data);
    return updatedCount;
  },

  delete: (collection, queryFnOrObject) => {
    const data = readDb();
    const list = data[collection] || [];
    let deletedCount = 0;
    
    const filteredList = list.filter(item => {
      let matches = false;
      if (typeof queryFnOrObject === 'function') {
        matches = queryFnOrObject(item);
      } else if (typeof queryFnOrObject === 'object') {
        matches = true;
        for (const key in queryFnOrObject) {
          if (item[key] !== queryFnOrObject[key]) {
            matches = false;
            break;
          }
        }
      }
      if (matches) {
        deletedCount++;
        return false; // exclude
      }
      return true; // keep
    });

    data[collection] = filteredList;
    writeDb(data);
    return deletedCount;
  }
};
