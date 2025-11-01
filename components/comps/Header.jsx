import React from "react"
import { View, Text } from "react-native"
import { Ionicons} from "@expo/vector-icons";

export default function Header() {
    return (
        <>
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
        </>
        
    )
    
}