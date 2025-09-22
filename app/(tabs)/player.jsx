
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { usePlayer } from "../PlayerContext";
// import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState} from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TextTicker from "react-native-text-ticker";
import { router } from "expo-router";


export default function PlayerScreen() {

  const { player, status, song, queue, currentIndex, setCurrentIndex } = usePlayer();

  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (player) {
        player.play();
    }
    }, [player]);
    

  const isPlaying = status.playing || false;
  const durationSeconds = status.duration ?? 0;        // in seconds
  const currentTime = status.currentTime ?? 0;


  useEffect(() => {
    if (!isSeeking) {
      setSliderValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  // Play / Pause
  const handlePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };  

  // Seek with slider
  const handleSeek = async (value) => {
    if (!player) return;
    try {
      await player.seekTo(value);
      player.play();
      setIsSeeking(false);
    } catch (error) {
      console.error("Seek error:", error);
    }
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // loop to first song
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(queue.length - 1); // loop to last song
    }
  };

  // Format time helper
  const formatTime = (timeSeconds) => {
    const mins = Math.floor(timeSeconds / 60);
    const secs = Math.floor(timeSeconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0d0d1a" }}>
{/* Top Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 15,
          paddingVertical: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/')}
        >
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>
        
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#aaa", fontSize: 12 }}>PLAYING FROM</Text>
          <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>
            {song.uri.split("/")[song.uri.split("/").length - 2]}
          </Text>
        </View>
        <MaterialIcons name="more-vert" size={24} color="white" />
      </View>

{/* Album Art */}
      <View
        style={{
          flex: 4,
          justifyContent: "center",
          alignItems: "center",
          marginVertical: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 4,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {song.artwork ? (
            <Image
              source={{ uri: song.artwork }}
              style={{ width: 280, height: 280, borderRadius: 4}}
            />
          ) : (
            <View
              style={{
                width: 280,
                height: 280,
                backgroundColor: "#555",
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="musical-notes" size={52} color="white" />
            </View>
          )}
        </View>
      </View>

{/* Song Info */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 25,
          marginBottom: 20,
        }}
      >
        <Ionicons name="heart-outline" size={26} color="white"/>
        <View style={{ alignItems: "center" , overflow: "hidden", width:"70%"}}>
            <TextTicker
                style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                duration={8000}       // speed of scrolling
                loop                  // repeat forever
                bounce={false}        // no bounce, continuous scroll
                scrollSpeed={50}
                repeatSpacer={50}
                marqueeDelay={1000}   // delay before scroll starts
            >
                {song.title}
            </TextTicker>
          <Text 
            style={{ color: "#aaa", fontSize: 14 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >{song.artist}</Text>
        </View>
        <MaterialIcons name="queue-music" size={26} color="white"/>
      </View>

{/* Progress Bar */}
      <View style={{ paddingHorizontal: 25 }}>
        <Slider
          minimumValue={0}
          maximumValue={durationSeconds}
          value={sliderValue}
          onSlidingStart={() => {
            setIsSeeking(true);
            player.pause();
          }}
          onValueChange={(val) => {
            setSliderValue(val);
          }}
          onSlidingComplete={(val) => {
            handleSeek(val);
          }}
          minimumTrackTintColor="#f5c542"
          maximumTrackTintColor="#555"
          thumbTintColor="white"
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>{formatTime(sliderValue)}</Text>
          <Text style={{ color: "white", fontSize: 12 }}>{formatTime(durationSeconds)}</Text>
        </View>
      </View>

{/* Controls */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          marginTop: 30,
          marginBottom: 20,
          marginLeft: 10,
          marginRight: 10,
        }}
      >
        <MaterialIcons name="repeat" size={22} color="white" />
        <TouchableOpacity
         onPress={handlePrev}
        >
          <MaterialIcons name="skip-previous" size={36} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          // onPress={handlePlayPause}
          onPress={handlePlayPause}
          style={{
            backgroundColor: "white",
            width: 70,
            height: 70,
            borderRadius: 35,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isPlaying ? (
            <MaterialIcons name="pause" size={40} color="black" />
          ) : (
            <MaterialIcons name="play-arrow" size={40} color="black" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
        >
          <MaterialIcons name="skip-next" size={36} color="white" />
        </TouchableOpacity>
        
        <Entypo name="shuffle" size={20} color="white" />
      </View>
    </SafeAreaView>
  );
}
 