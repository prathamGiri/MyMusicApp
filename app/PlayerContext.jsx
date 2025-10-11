import React, { createContext, useContext, useState, useEffect } from "react";
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from "expo-audio";
// import { Audio } from "expo-av";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [song, setSong] = useState({});
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState({});

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
  }, [currentIndex, queue])

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
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0); // loop to start
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
      setCurrentIndex 
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
