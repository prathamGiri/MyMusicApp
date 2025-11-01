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
      name TEXT NOT NULL UNIQUE,
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

export const getAllSongsFromDBbyTime = async () => {
  const db = getDB();
  const result = await db.getAllAsync("SELECT * FROM songs ORDER BY modification_time DESC");
  return result;
};

export const getAllSongsFromDBByTitle = async () => {
  const db = getDB();
  const result = await db.getAllAsync("SELECT * FROM songs ORDER BY title ASC");
  return result;
};

// Create a new playlist
export const createPlaylist = async (name) => {
  await db.runAsync(`INSERT INTO playlists (name) VALUES (?)`, [name]);
};

// Get all playlists
export const getAllPlaylists = async () => {
  const rows = await db.getAllAsync(`SELECT * FROM playlists ORDER BY created_at DESC`);
  return rows;
};

// Add song to playlist
export const addSongToPlaylist = async (playlistId, songId) => {
  await db.runAsync(
    `INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)`,
    [playlistId, songId]
  );
};

// Get all songs in a playlist
export const getSongsInPlaylist = async (playlistId) => {
  return await db.getAllAsync(
    `SELECT s.* FROM songs s
     JOIN playlist_songs ps ON s.id = ps.song_id
     WHERE ps.playlist_id = ?`,
    [playlistId]
  );
};

// Remove a song from playlist
export const removeSongFromPlaylist = async (playlistId, songId) => {
  await db.runAsync(
    `DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?`,
    [playlistId, songId]
  );
};

// Delete playlist
export const deletePlaylist = async (playlistId) => {
  await db.runAsync(`DELETE FROM playlists WHERE id = ?`, [playlistId]);
};