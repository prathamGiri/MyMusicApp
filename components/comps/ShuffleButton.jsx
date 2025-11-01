import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ShuffleButton({activeTab, setModalVisible}) {

    const handleShuffle = () => {

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