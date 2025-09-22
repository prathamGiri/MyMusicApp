import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as MediaLibrary from 'expo-media-library';
import MusicInfo from 'expo-music-info-2';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View, Dimensions, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  getAllSongsFromDB, 
  getAllUris, 
  initDB, 
  saveSong, 
  createPlaylist,
  getAllPlaylists,
  getSongsInPlaylist
} from '../../utils/database';
import { saveArtwork } from '../../utils/saveImg';
import { usePlayer } from "../PlayerContext";

  const { width } = Dimensions.get("window");
  const boxSize = width / 2 - 30;

export default function SongsScreen() {

  const router = useRouter();

  const { player, status, song, setSong, setQueue, queue, setCurrentIndex } = usePlayer();
  const [activeTab, setActiveTab] = useState("Songs");

  useEffect(() => {
    const setupDB = async () => {
      await initDB();
      console.log("Database initialized ✅");
    };

    setupDB();
  }, []);

  useEffect(() => {
    const loadSongs = async () => {
      const newSongs = await getAllNewSongs();

      // 1. Fetch metadata for all new songs in parallel
      const songsWithMetadata = await Promise.all(
        newSongs.map(async (asset) => {
          try {
            const metadata = await MusicInfo.getMusicInfoAsync(asset.uri, {
              title: true,
              artist: true,
              album: true,
              genre: true,
              picture: true,
            });

            const artworkUri = metadata.picture?.pictureData
            ? await saveArtwork(metadata.picture.pictureData, asset.id)
            : null;

            return {
              song_id: asset.id,
              modification_time: asset.modificationTime,
              uri: asset.uri,
              title: metadata.title || asset.filename,
              artist: metadata.artist || "Unknown Artist",
              album_id: asset.albumId,
              album: metadata.album || "Unknown Album",
              duration: metadata.duration || asset.duration || 0,
              artwork: artworkUri || null,
            };
          } catch (error) {
            console.error(`Failed to fetch metadata for ${asset.uri}`, error);
            return {
              song_id: asset.id,
              modification_time: asset.modificationTime,
              uri: asset.uri,
              title: asset.filename,
              artist: "Unknown Artist",
              album_id: asset.albumId,
              album: "Unknown Album",
              duration: asset.duration || 0,
              artwork: null,
            };
          }
        })
      );

      // 2. Save all songs to DB
      for (let song of songsWithMetadata) {
        await saveSong(song);
      }

      // 3. Fetch everything from DB and update UI
      const allFromDB = await getAllSongsFromDB();
      setQueue(allFromDB);
    };

    loadSongs();
  }, []);

  const handleSongPress = (selectedSong) => {
    const index = queue.findIndex((song) => song.id === selectedSong.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
    setSong(selectedSong);        // set and play the song
    router.push("/(tabs)/player"); // navigate to player screen
  };

  const handlePlayPause = () => {
    if (!player) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };  

  const handleShuffle = () => {

  }

  const handleAddPlaylist = async () => {
    await createPlaylist("Chill Vibes");
  }

  async function requestPermission() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  async function getAllNewSongs() {
    const hasPermission = await requestPermission();
    if (!hasPermission) return [];

    const media = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
      first: 1000, // number of songs to fetch at once
      sortBy: ['modificationTime'], 
    });

    // Fetch URIs already in DB
    const existingUris = await getAllUris();

    // Filter: keep only songs not in DB
    const newSongs = media.assets.filter(asset => !existingUris.includes(asset.uri));

    return newSongs;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderColor: "#333",
      }}
    >
      <TouchableOpacity
        onPress={() => handleSongPress(item)} 
        style={{ flexDirection: "row", alignItems: "center"}}
      >
        {/* Song Image here */}
        {item.artwork ? (
          <Image
            source={{ uri: item.artwork }}
            style={{ width: 50, height: 50, borderRadius: 4, marginRight: 12 }}
          />
        ) : (
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: "#555",
              borderRadius: 4,
              marginRight: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="musical-notes" size={24} color="white" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          {/* Title - single line */}
          <Text
            style={{ color: "white", fontSize: 16 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>

        {/* Artist + duration in one line */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{ color: "#aaa", fontSize: 13, flex: 1 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.artist}
          </Text>
          <Text style={{ color: "#aaa", fontSize: 13, marginLeft: 5 }}>
            • {formatTime(item.duration)}
          </Text>
        </View>
      </View>

      </TouchableOpacity>
      <TouchableOpacity>
        <MaterialIcons name="more-vert" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

    // 🔹 Playlists Data
  const playlists = [
    {
      id: "favorites",
      title: "Favorites",
      icon: "heart",
      color: "#f5425d",
    },
    {
      id: "top30",
      title: "Top 30 Songs",
      icon: "star",
      color: "#f5c542",
    },
  ];

    // 🔹 Render Playlist Item
  const renderPlaylist = ({ item }) => (
    <TouchableOpacity
      style={{
        width: boxSize,
        height: boxSize,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
        elevation: 3, // for Android shadow
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        backgroundColor: item.color,
      }}
    >
      <Ionicons name={item.icon} size={36} color="white" />
      <Text
        style={styles.text}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0d0d1a" }}>
{/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 15,
        }}
      >
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          Vibes
        </Text>
        <Ionicons name="search" size={22} color="white" />
      </View>

{/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 10,
          borderBottomWidth: 0.5,
          borderColor: "#444",
        }}
      >
         {["Songs", "Playlists"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={{
                color: activeTab === tab ? "#f5c542" : "white",
                fontWeight: activeTab === tab ? "bold" : "normal",
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    {/* Content */}
      {activeTab === "Songs" ? (
        <FlatList
          key={"songs"}
          data={queue}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 10 }}
        />
      ) : (
        <FlatList
          key={"playlists"}
          data={playlists}
          renderItem={renderPlaylist}
          keyExtractor={(item) => item.id}
          numColumns={2} // fixed, won’t change on the fly
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

{/* Shuffle Button */}
      <TouchableOpacity
      onPress={()=>{
        if (activeTab === "Songs") {
          handleShuffle()
        } else {
          handleAddPlaylist()
        }
      }
      }
        style={{
          position: "absolute",
          bottom: 80,
          right: 20,
          backgroundColor: "#f5c542",
          width: 55,
          height: 55,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
        }}
      >
        {activeTab === "Songs" ? (
          <MaterialIcons name="shuffle" size={28} color="black" />
        ) : (
          <MaterialIcons name="add" size={28} color="black" />
        )}
      </TouchableOpacity>

      {/* Mini Player */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent:"space-around",
          padding: 10,
          backgroundColor: "#1a1a2e",
          borderTopWidth: 0.5,
          borderColor: "#444",
          marginBottom: -16
        }}
      >
        <TouchableOpacity
        onPress={() => router.push("/(tabs)/player")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "85%"
          }}
        >
          {song.artwork ? (
            <Image
              source={{ uri: song.artwork }}
              style={{ width: 35, height: 35, borderRadius: 4, marginLeft: 8 }}
            />
          ) : (
            <View
              style={{
                width: 35,
                height: 35,
                backgroundColor: "#555",
                borderRadius: 4,
                marginLeft: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="musical-notes" size={24} color="white" />
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text 
              style={{ color: "white" }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{song.title}</Text>
            <Text 
              style={{ color: "#aaa", fontSize: 12 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{song.artist}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handlePlayPause}
          style = {{
            marginRight : 10
          }}
        >
           {
              status.playing ? (
                <MaterialIcons name="pause" size={28} color="white" />
              ) : (
                <MaterialIcons name="play-arrow" size={28} color="white" />
              )
            }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  row: {
    marginTop: 20,
    justifyContent: "space-around",
  },

  text: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});