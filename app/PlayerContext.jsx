import React, { createContext, useContext, useState, useEffect } from "react";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync} from "expo-audio";
// import { Audio } from "expo-av";
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [song, setSong] = useState({}); // current song playing
  const [queue, setQueue] = useState([]); // Queue for next songs
  const [songsDisplayed, setSongsDisplayed] = useState([]) // songs displayed in songs list
  const [currentIndex, setCurrentIndex] = useState(0); // index of the current song in the queue
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const player = useAudioPlayer(song.uri || undefined, {
    updateInterval : 500
  });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    async function setupAudio() {
      await await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionModeAndroid: 'duckOthers',
        interruptionMode: 'mixWithOthers'
      }).catch(err => console.error('Failed to set audio mode:', err));
    }
    setupAudio();
  }, []);

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < queue.length){
      setSong(queue[currentIndex])
    }
  }, [currentIndex])


  useEffect(() => {
    if (player && song.uri) {     
      player.replace(song.uri);
      player.play();
    }
  }, [player, song]);

  useEffect(() => {
    if (!status) return;

    if (status.currentTime >= status.duration && status.duration > 0) {
      // auto next
      if (!repeat){
        if (currentIndex < queue.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0); // loop to start
        }
      }else{
        player.seekTo(0);
      }    
    }
  }, [status.currentTime, status.duration]);

  return (
    <PlayerContext.Provider value={{ 
      player, 
      status, 
      song, 
      setSong, 
      queue, 
      setQueue, 
      currentIndex, 
      setCurrentIndex,
      songsDisplayed,
      setSongsDisplayed,
      shuffle, 
      setShuffle,
      repeat, 
      setRepeat
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
