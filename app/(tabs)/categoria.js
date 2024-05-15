import React from "react";
import { View, Text, Button } from "react-native";
import {useLocalSearchParams} from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context";
export default function Comida() {
    
    const {Categoria}=useLocalSearchParams();

    return (

        <SafeAreaView>
        <Text style={{fontSize:25,color:"white"}} >{Categoria}</Text>
        <Button title="Comprar" />
        </SafeAreaView>
    );
}