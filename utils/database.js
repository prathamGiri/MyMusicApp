import * as SQLite from 'expo-sqlite';

// Open (or create) database
const db = SQLite.openDatabaseSync('musicplayer.db');

// Create tables
export const initDB = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_id INTEGER,
      modification_time FLOAT,
      uri TEXT NOT NULL,
      title TEXT,
      artist TEXT,
      album_id INTEGER,
      album TEXT,
      duration INTEGER,
      artwork TEXT
    );

     CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlist_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    );
  `);
};

export const getDB = () => db;

export const saveSong = async (song) => {
  const db = getDB();
  await db.runAsync(
    `INSERT INTO songs (song_id, modification_time, uri, title, artist, album_id, album, duration, artwork) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [song.song_id, song.modification_time, song.uri, song.title, song.artist,song.album_id, song.album, song.duration, song.artwork]
  );
};

export const getAllUris = async () => {
  const db = getDB();
  const rows = await db.getAllAsync(`SELECT uri FROM songs`);
  return rows.map(r => r.uri); // return array of existing uris
};

export const getAllSongsFromDB = async () => {
  const db = getDB();
  const result = await db.getAllAsync("SELECT * FROM songs ORDER BY id DESC");
  return result;
};
