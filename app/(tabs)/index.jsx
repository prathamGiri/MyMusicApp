import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as MediaLibrary from 'expo-media-library';
import MusicInfo from 'expo-music-info-2';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  FlatList, 
  Image, 
  Text, 
  TouchableOpacity, 
  View, 
  Dimensions, 
  StyleSheet,
  TextInput,
  Modal
 } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  getAllSongsFromDB, 
  getAllUris, 
  initDB, 
  saveSong, 
  createPlaylist,
  getAllPlaylists,
  getSongsInPlaylist,
  deletePlaylist
} from '../../utils/database';
import { saveArtwork } from '../../utils/saveImg';
import { usePlayer } from "../PlayerContext";

const { width } = Dimensions.get("window");
const boxSize = width / 2 - 30;

export default function SongsScreen() {

  const router = useRouter();

  const { player, status, song, setSong, setQueue, queue, setCurrentIndex } = usePlayer();
  const [activeTab, setActiveTab] = useState("Songs");
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const setupDB = async () => {
      await initDB();
    };
    setupDB();
  }, []);

  useEffect(() => {
    const setupDB = async () => {
      try {
        const hasDBInit = await AsyncStorage.getItem("db_initialized");

        if (!hasDBInit) {
          // Run init only the first time
          await createPlaylist("Favorites")
          await createPlaylist("Top30")
          console.log("Database initialized ✅ (first time)");

          // Set flag so it won’t run again
          await AsyncStorage.setItem("db_initialized", "true");
        } else {
          console.log("Database already initialized, skipping ✅");
        }
      } catch (error) {
        console.error("Error setting up DB:", error);
      }
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
      const playlists = await getAllPlaylists();
      setQueue(allFromDB);
      setPlaylists(playlists);

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

  };

  const handleDeletePlaylist = async (id) => {
    await deletePlaylist(id);
    const updatedPlaylists = await getAllPlaylists();
    setPlaylists(updatedPlaylists);
  }

  
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return; // ignore empty names
      await createPlaylist(newPlaylistName.trim());
      setModalVisible(false);
      setNewPlaylistName("");
      const updatedPlaylists = await getAllPlaylists();
      setPlaylists(updatedPlaylists);
  };

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


    // 🔹 Render Playlist Item
  const renderPlaylist = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        handleDeletePlaylist(item.id)
      }}

      style={{
        width: boxSize,
        height: boxSize,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
        backgroundColor: "#eec326", // main color
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6, // for Android shadow
        padding: 10,
      }}
    >
      <Ionicons name={item.icon || "musical-notes"} size={36} color="white" />
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          textAlign: "center",
          color: "#fff", // white text
          marginTop: 8,
          textShadowColor: 'rgba(0, 0, 0, 0.5)', // subtle text shadow
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.name}
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
        onPress={() => {
          if (activeTab === "Songs") {
            handleShuffle();
          } else {
            setModalVisible(true); // open dialog
          }
        }}
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

      {/* Playlist Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter Playlist Name</Text>
            <TextInput
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={handleCreatePlaylist}
              style={styles.createButton}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[styles.createButton, { backgroundColor: "#888", marginTop: 10 }]}
            >
              <Text style={{ color: "white" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  createButton: {
    width: "100%",
    backgroundColor: "#f5c542",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
});