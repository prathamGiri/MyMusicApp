// saveArtwork.js
import { File, Paths } from 'expo-file-system';
import { decode as b64Decode } from 'base-64'; // tiny polyfill; `npm i base-64`


function base64ToUint8Array(base64) {
  const binary = b64Decode(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Save artwork base64 (data URI or raw base64) as a file and return its URI.
 * @param {string} pictureData - data:image/jpeg;base64,... OR raw base64 string
 * @param {string|number} songId - used to build filename (unique per song)
 * @returns {string|null} fileUri or null on failure
 */
export async function saveArtwork(pictureData, songId) {
  if (!pictureData) return null;

  try {
    // strip data URI header if present
    const base64 = pictureData.includes(',') ? pictureData.split(',')[1] : pictureData;
    const bytes = base64ToUint8Array(base64);

    // create a File instance in the app document directory
    // NOTE: Paths.document is the new Paths API (same as documentDirectory)
    const filename = `artwork_${songId}.jpg`; // change ext if mime says png
    const file = new File(Paths.document, filename);

    // create (will throw if there's an unexpected issue)
    // options: { overwrite: true } if you want to always replace
    try {
      file.create({ overwrite: true });
    } catch (err) {
      // ignore if creation fails because file already exists; write() will overwrite if needed
    }

    // write accepts string or Uint8Array
    file.write(bytes); // synchronous-style API per docs; will throw on error

    // file.uri now points to something like "file:///.../artwork_123.jpg"
    return file.uri;
  } catch (err) {
    console.error('saveArtwork failed:', err);
    return null;
  }
}
