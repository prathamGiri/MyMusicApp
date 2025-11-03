import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SortBar({sortOption, setSortOption}) {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

    const handleSort = (option) => {
        setSortOption(option);
        setDropdownVisible(false);
        AsyncStorage.setItem("past_session_sort_option", option);
    };

    return(
        <>
        {/* --- Sort Bar --- */}
        <View style={styles.sortBar}>
            <Text style={styles.sortLabel}>Sort by: {sortOption}</Text>

            <TouchableOpacity onPress={toggleDropdown}>
                <MaterialIcons name="sort" size={20} color="white" />
            </TouchableOpacity>
        </View>

        {/* Dropdown Menu */}
        {dropdownVisible && (
            <View style={styles.dropdown}>
                {["Title","Modified Time"].map(
                (option) => (
                    <TouchableOpacity
                    key={option}
                    onPress={() => handleSort(option)}
                    style={styles.dropdownItem}
                    >
                    <Text style={styles.dropdownText}>{option}</Text>
                    </TouchableOpacity>
                )
                )}
            </View>
        )}
        </>
    )
}

const styles = StyleSheet.create({
  sortBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#222",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sortLabel: {
    color: "white",
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: "#222",
    position: "absolute",
    right: 16,
    top: 55,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  dropdownText: {
    color: "white",
    fontSize: 15,
  },

})