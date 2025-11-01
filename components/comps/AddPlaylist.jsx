import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet} from "react-native"
import { useState } from "react";
import {
  createPlaylist,
  getAllPlaylists
} from '../../utils/database';

export default function AddPlaylist({modalVisible, setModalVisible, setPlaylists}) {
    const [newPlaylistName, setNewPlaylistName] = useState("");

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return; // ignore empty names
        await createPlaylist(newPlaylistName.trim());
        setModalVisible(false);
        setNewPlaylistName("");
        const updatedPlaylists = await getAllPlaylists();
        setPlaylists(updatedPlaylists);
    };
    
    return(
        <>
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
        </>
    )
}

const styles = StyleSheet.create({
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
})
