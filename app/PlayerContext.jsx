import React, { createContext, useContext, useState, useEffect } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

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
