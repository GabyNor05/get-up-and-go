import { View, Pressable, Text } from "react-native";
import { authService } from "../../../../../packages/firebase/src/services/authService";
import { useState } from "react";
import { router } from "expo-router";

export default function SettingsScreen(){
    const [loading, setLoading] = useState(false);

    function handleLogout(){
        try{
            authService.logout();
            router.navigate("../../../index");
        }catch (error: any) {
      alert(error.message || "Failed to logout.");
    }
    };


    return(
        <View className="mt-12">
            <Pressable style={{margin: 20}} onPress={handleLogout} >
                <Text>Log out</Text>
            </Pressable>
        </View>
    );
}