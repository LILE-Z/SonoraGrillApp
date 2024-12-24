import React, { useEffect, useState, Suspense } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { Card, Button, Icon } from "@rneui/base";

export default function App() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider
        databaseName="mydb.db"
        assetSource={{ assetId: require("@/assets/mydb.db") }}
        useSuspense
      >
        <Comida />
      </SQLiteProvider>
    </Suspense>
  );
}

function Comida() {
  const { Categoria } = useLocalSearchParams();
  const [productos, setProductos] = useState([]);
  const db = useSQLiteContext();
  const router = useRouter();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const resultSet = await db.getAllAsync(
          "SELECT * FROM producto WHERE categoria = ?",
          [Categoria]
        );
        setProductos(resultSet);
      } catch (error) {
        console.error("Error fetching productos:", error);
      }
    };

    fetchProductos();
  }, [Categoria]);

  const handleProductPress = (producto) => {
    router.push(`/(tabs)/producto?Producto=${JSON.stringify(producto)}`);
  };

  const renderProductoItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleProductPress(item)}>
      <Card containerStyle={styles.cardContainer}>
        <Card.Image
          source={{ uri: item.imagen }}
          style={styles.productoImage}
          resizeMode="cover"
        />
        <Card.Title style={styles.productoName}>{item.nombre}</Card.Title>
        <Card.FeaturedSubtitle style={styles.productoPrecio}>
          ${item.precio.toFixed(2)}
        </Card.FeaturedSubtitle>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.categoria}>{Categoria}</Text>
      <FlatList
        data={productos}
        renderItem={renderProductoItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productosContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  categoria: {
    fontSize: 25,
    color: "white",
    backgroundColor: "#a65b39",
    padding: 10,
    textAlign: "center",
  },
  productosContainer: {
    padding: 10,
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 10,
  },
  productoImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productoName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#888",
  },
});