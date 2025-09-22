
// import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
// import Slider from "@react-native-community/slider";
// import { Audio } from "expo-av";
// import { useLocalSearchParams } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import { Image, Text, TouchableOpacity, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import TextTicker from "react-native-text-ticker";
// // import song from "@/assets/audio/audio-clip.mp3"


// export default function PlayerScreen() {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const { song } = useLocalSearchParams();
//   const songData = JSON.parse(song);
//   const [sound, setSound] = useState(null);
//   const [position, setPosition] = useState(0); // current slider value (seconds)
//   const [duration, setDuration] = useState(songData.duration);

//   const soundRef = useRef(null);

// // Load audio
//   async function loadAudio() {
//     if (soundRef.current) {
//       await soundRef.current.unloadAsync();
//     }
//     const { sound: newSound } = await Audio.Sound.createAsync(
//       { uri: songData.uri }, // <-- local or remote file
//       { shouldPlay: true }
//     );
//     soundRef.current = newSound;
//     setSound(newSound);

//     // Get duration
//     const status = await newSound.getStatusAsync();
//     setDuration(status.durationMillis);

//     // Listen for position updates
//     newSound.setOnPlaybackStatusUpdate((status) => {
//       if (status.isLoaded) {
//         setPosition(status.positionMillis);
//         setDuration(status.durationMillis);
//         setIsPlaying(status.isPlaying);
//       }
//     });
//   }

//   useEffect(() => {
//     loadAudio();
//     return () => {
//       if (soundRef.current) {
//         soundRef.current.unloadAsync();
//       }
//     };
//   }, []);

//   // Play / Pause
//   const handlePlayPause = async () => {
//     if (!soundRef.current) return;
//     const status = await soundRef.current.getStatusAsync();
//     if (status.isLoaded){
//       if (status.isPlaying) {
//           await soundRef.current.pauseAsync();
//         } else {
//           await soundRef.current.playAsync();
//         }
//       }
//   }   

//   // Seek with slider
//   const handleSeek = async (value) => {
//     if (soundRef.current) {
//       await soundRef.current.setPositionAsync(value);
//     }
//   };


//   // Format seconds → mm:ss
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };
//   const formatMillisTime = (millis) => {
//     let seconds = millis / 1000;
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#0d0d1a" }}>
// {/* Top Bar */}
//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-between",
//           alignItems: "center",
//           paddingHorizontal: 15,
//           paddingVertical: 10,
//         }}
//       >
//         <Ionicons name="chevron-down" size={28} color="white" />
//         <View style={{ alignItems: "center" }}>
//           <Text style={{ color: "#aaa", fontSize: 12 }}>PLAYING FROM</Text>
//           <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>
//             {songData.uri.split("/")[songData.uri.split("/").length - 2]}
//           </Text>
//         </View>
//         <MaterialIcons name="more-vert" size={24} color="white" />
//       </View>

// {/* Album Art */}
//       <View
//         style={{
//           flex: 4,
//           justifyContent: "center",
//           alignItems: "center",
//           marginVertical: 20,
//         }}
//       >
//         <View
//           style={{
//             backgroundColor: "rgba(255,255,255,0.1)",
//             borderRadius: 4,
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           {songData.artwork ? (
//             <Image
//               source={{ uri: songData.artwork }}
//               style={{ width: 280, height: 280, borderRadius: 4}}
//             />
//           ) : (
//             <View
//               style={{
//                 width: 280,
//                 height: 280,
//                 backgroundColor: "#555",
//                 borderRadius: 4,
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//             >
//               <Ionicons name="musical-notes" size={52} color="white" />
//             </View>
//           )}
//         </View>
//       </View>

// {/* Song Info */}
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "space-between",
//           paddingHorizontal: 25,
//           marginBottom: 20,
//         }}
//       >
//         <Ionicons name="heart-outline" size={26} color="white"/>
//         <View style={{ alignItems: "center" , overflow: "hidden", width:"70%"}}>
//             <TextTicker
//                 style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
//                 duration={8000}       // speed of scrolling
//                 loop                  // repeat forever
//                 bounce={false}        // no bounce, continuous scroll
//                 scrollSpeed={50}
//                 repeatSpacer={50}
//                 marqueeDelay={1000}   // delay before scroll starts
//             >
//                 {songData.title}
//             </TextTicker>
//           <Text 
//             style={{ color: "#aaa", fontSize: 14 }}
//             numberOfLines={1}
//             ellipsizeMode="tail"
//           >{songData.artist}</Text>
//         </View>
//         <MaterialIcons name="queue-music" size={26} color="white"/>
//       </View>

// {/* Progress Bar */}
//       <View style={{ paddingHorizontal: 25 }}>
//         <Slider
//           minimumValue={0}
//           maximumValue={duration}
//           value={position}
//           onValueChange={val => setPosition(val)}
//           minimumTrackTintColor="#f5c542"
//           maximumTrackTintColor="#555"
//           thumbTintColor="white"
//           onSlidingComplete={handleSeek}
//         />
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             marginTop: 5,
//           }}
//         >
//           <Text style={{ color: "white", fontSize: 12 }}>{formatMillisTime(position)}</Text>
//           <Text style={{ color: "white", fontSize: 12 }}>{formatTime(songData.duration)}</Text>
//         </View>
//       </View>

// {/* Controls */}
//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-around",
//           alignItems: "center",
//           marginTop: 30,
//           marginBottom: 20,
//           marginLeft: 10,
//           marginRight: 10,
//         }}
//       >
//         <MaterialIcons name="repeat" size={22} color="white" />
//         <MaterialIcons name="skip-previous" size={36} color="white" />
//         <TouchableOpacity
//           // onPress={handlePlayPause}
//           onPress={handlePlayPause}
//           style={{
//             backgroundColor: "white",
//             width: 70,
//             height: 70,
//             borderRadius: 35,
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           {isPlaying ? (
//             <MaterialIcons name="pause" size={40} color="black" />
//           ) : (
//             <MaterialIcons name="play-arrow" size={40} color="black" />
//           )}
//         </TouchableOpacity>
//         <MaterialIcons name="skip-next" size={36} color="white" />
//         <Entypo name="shuffle" size={20} color="white" />
//       </View>
//     </SafeAreaView>
//   );
// }
 