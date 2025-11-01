import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { usePlayer } from "../../app/PlayerContext";

export default function MiniPlayer({router}) {

    const { player, status, song} = usePlayer();

    const handlePlayPause = () => {
        if (!player) return;
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
    };  
    
    return (
        <>
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
                // marginBottom: -16
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
        </>
    )
}