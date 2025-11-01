import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { usePlayer } from "@/app/PlayerContext";

export default function ShuffleButton({activeTab, setModalVisible, router}) {
    const { queue, setQueue, setCurrentIndex, setSong, setShuffle } = usePlayer();

    const handleShuffle = () => {
        if (!queue || queue.length === 0) return;

        // Shuffle using Fisher-Yates algorithm
        const shuffled = [...queue];
        for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Update queue and start playing the first song
        setShuffle(true);
        setQueue(shuffled);
        setCurrentIndex(0);
        setSong(shuffled[0]);
        router.push("/(tabs)/player");
    };

    return(
        <>
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
            
        </>
    )
}