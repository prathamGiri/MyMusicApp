import { FlatList, TouchableOpacity, Dimensions, Text, StyleSheet } from "react-native"
import { Ionicons} from "@expo/vector-icons";
import { useState } from "react";

const { width } = Dimensions.get("window");
const boxSize = width / 2 - 30;

export default function PlaylistScreen({playlists}) {


    const renderPlaylist = ({ item }) => (
        <TouchableOpacity
            // onPress={() => {
            //   handleDeletePlaylist(item.id)
            // }}
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
        <>
            <FlatList
                key={"playlists"}
                data={playlists}
                renderItem={renderPlaylist}
                keyExtractor={(item) => item.id}
                numColumns={2} // fixed, won’t change on the fly
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
            />
        </>
    )
}

const styles = StyleSheet.create({
  row: {
    marginTop: 20,
    justifyContent: "space-around",
  },
})