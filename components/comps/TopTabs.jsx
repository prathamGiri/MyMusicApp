import {View, Text, TouchableOpacity} from 'react-native'

export default function TopTabs({value, setValue}) {

    return (
        <>
        {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 10,
          borderBottomWidth: 0.5,
          borderColor: "#444",
        }}
      >
         {["Songs", "Playlists"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setValue(tab)}>
            <Text
              style={{
                color: value === tab ? "#f5c542" : "white",
                fontWeight: value === tab ? "bold" : "normal",
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
        </>
    )
}