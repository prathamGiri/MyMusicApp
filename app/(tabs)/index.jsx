import AsyncStorage from "@react-native-async-storage/async-storage";
import * as MediaLibrary from 'expo-media-library';
import MusicInfo from 'expo-music-info-2';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createPlaylist,
  deletePlaylist,
  getAllPlaylists,
  getAllSongsFromDBbyTime,
  getAllSongsFromDBByTitle,
  getAllUris,
  initDB,
  saveSong
} from '../../utils/database';

// Components
import AddPlaylist from "../../components/comps/AddPlaylist";
import Header from '../../components/comps/Header';
import MiniPlayer from '../../components/comps/MiniPlayer';
import ShuffleButton from '../../components/comps/ShuffleButton';
import SortBar from "../../components/comps/SortBar";
import TopTabs from '../../components/comps/TopTabs';
// functions
import PlaylistScreen from "../../components/comps/PlaylistScreen";
import SongList from "../../components/comps/SongList";
import { saveArtwork } from '../../utils/saveImg';
import { usePlayer } from "../PlayerContext";

export default function SongsScreen() {

  const router = useRouter();

  const { setQueue } = usePlayer();
  const [activeTab, setActiveTab] = useState("Songs");
  const [modalVisible, setModalVisible] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [sortOption, setSortOption] = useState("Title");
  

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
          console.log("Favorites, Top30, created for the first time");

          // Set flag so it won’t run again
          await AsyncStorage.setItem("db_initialized", "true");
        } else {
          console.log("Default Playlists already created, skipping ✅");
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
      if (sortOption === "Title") {
        const allFromDB = await getAllSongsFromDBByTitle();
        setQueue(allFromDB);
      }else if (sortOption === "Modified Time") {
        const allFromDB = await getAllSongsFromDBbyTime();
        setQueue(allFromDB);
      }
      const playlists = await getAllPlaylists();
      setPlaylists(playlists);
    };

    loadSongs();
  }, [sortOption]);


  const handleDeletePlaylist = async (id) => {
    await deletePlaylist(id);
    const updatedPlaylists = await getAllPlaylists();
    setPlaylists(updatedPlaylists);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0d0d1a" }}>
      <Header />

      <TopTabs 
        value={activeTab}
        setValue={setActiveTab}
      />
      
      {/* Content */}
      {activeTab === "Songs" ? (
        <View style={{ flex: 1 }}>
          <SortBar
            sortOption={sortOption}
            setSortOption={setSortOption}
          />

          <SongList 
            router={router}
          />
        </View>
      ) : (
        <PlaylistScreen 
          playlists={playlists}
        />
      )}

      <ShuffleButton 
        activeTab={activeTab}
        setModalVisible={setModalVisible}
      />

      <AddPlaylist 
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        setPlaylists={setPlaylists}
      />

      <MiniPlayer 
        router={router}
      />

    </SafeAreaView>
  );
}
