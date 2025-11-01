import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { usePlayer } from "../../app/PlayerContext";

export default function SongList({router}) {
      const { setQueue, setSong, queue, setCurrentIndex, songsDisplayed, setShuffle } = usePlayer();

    const handleSongPress = (selectedSong) => {

        const sameQueue = queue.length === songsDisplayed.length && queue.every((q, i) => q.id === songsDisplayed[i].id);

        if (!sameQueue) {
            setQueue(songsDisplayed);
            setShuffle(false);
        }

        const index = songsDisplayed.findIndex(song => song.id === selectedSong.id);

        if (index !== -1) {
            setCurrentIndex(index);
            setSong(songsDisplayed[index]);
        }

        router.push("/(tabs)/player");
    };

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
            style={{ flexDirection: "row", alignItems: "center", width:"90%"}}
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
            <Text style={{ color: "#aaa", fontSize: 13, marginLeft: 5}}>
                • {formatTime(item.duration)}
            </Text>
            </View>
        </View>

        </TouchableOpacity>
        <TouchableOpacity
            style={{ marginLeft: 5}}
        >
            <MaterialIcons name="more-vert" size={24} color="white" />
        </TouchableOpacity>
        </View>
    );
    return(
        <>
            {/* --- Song List --- */}
            <FlatList
                key={"songs"}
                data={songsDisplayed}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 10 }}
            />
        </>
    )
}