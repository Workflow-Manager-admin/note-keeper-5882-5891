const bcrypt = require('bcrypt');

const DB_PATH = process.env.NOTES_DB_PATH || './data/users.json';
const fs = require('fs');
const path = require('path');
const dbFile = path.resolve(DB_PATH);

function readUsers() {
  if (!fs.existsSync(dbFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  fs.writeFileSync(dbFile, JSON.stringify(users, null, 2), 'utf-8');
}

// PUBLIC_INTERFACE
async function createUser({ username, password }) {
  /** Create a new user with hashed password. */
  const users = readUsers();
  if (users.find((u) => u.username === username)) {
    throw new Error('Username already exists');
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), username, password: hashed };
  users.push(user);
  writeUsers(users);
  return { id: user.id, username: user.username };
}

// PUBLIC_INTERFACE
async function authenticate(username, password) {
  /** Validate user credentials. */
  const users = readUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return null;
  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;
  return { id: user.id, username: user.username };
}

// PUBLIC_INTERFACE
function getUserById(id) {
  /** Get user by unique id */
  const users = readUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  return { id: user.id, username: user.username };
}

// PUBLIC_INTERFACE
function getUserByUsername(username) {
  /** Get user by username */
  const users = readUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return null;
  return { id: user.id, username: user.username };
}

module.exports = { createUser, authenticate, getUserById, getUserByUsername };
