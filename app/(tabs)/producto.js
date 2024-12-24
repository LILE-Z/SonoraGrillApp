import React, { useState, useEffect, useRef, Suspense } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from "react-native";
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
        <Producto />
      </SQLiteProvider>
    </Suspense>
  );
}

function Producto() {
  const { Producto } = useLocalSearchParams();
  const producto = JSON.parse(decodeURIComponent(Producto));
  const db = useSQLiteContext();
  const router = useRouter();
  const [cantidad, setCantidad] = useState(1);
  const [productoAgregado, setProductoAgregado] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const verificarProductoAgregado = async () => {
      try {
        const usuarioSesion = await db.getFirstAsync(
          "SELECT * FROM users WHERE sesion = ?",
          [1]
        );

        if (usuarioSesion) {
          const usuarioTelefono = usuarioSesion.telefono;

          const ordenSinRecibo = await db.getFirstAsync(
            "SELECT * FROM orden WHERE usuario_telefono = ? AND id NOT IN (SELECT orden_id FROM recibo)",
            [usuarioTelefono]
          );

          if (ordenSinRecibo) {
            const ordenId = ordenSinRecibo.id;

            const productoEnOrden = await db.getAllAsync(
              "SELECT * FROM orden_producto WHERE orden_id = ? AND producto_id = ?",
              [ordenId, producto.id]
            );

            setProductoAgregado(productoEnOrden.length > 0);
          } else {
            setProductoAgregado(false);
          }
        } else {
          setProductoAgregado(false);
        }
      } catch (error) {
        console.error("Error al verificar si el producto ha sido agregado:", error);
        setProductoAgregado(false);
      }
    };

    verificarProductoAgregado();
  }, [producto]);


  const handleAgregar = async () => {
    if (productoAgregado) {
      console.log("El producto ya ha sido agregado a la orden");
      return;
    }

    try {
      const usuarioSesion = await db.getFirstAsync(
        "SELECT * FROM users WHERE sesion = ?",
        [1]
      );

      if (usuarioSesion) {
        const usuarioTelefono = usuarioSesion.telefono;

        const ordenSinRecibo = await db.getFirstAsync(
          "SELECT * FROM orden WHERE usuario_telefono = ? AND id NOT IN (SELECT orden_id FROM recibo)",
          [usuarioTelefono]
        );

        if (ordenSinRecibo) {
          const ordenId = ordenSinRecibo.id;

          await db.runAsync(
            "INSERT INTO orden_producto (orden_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)",
            [ordenId, producto.id, cantidad, producto.precio * cantidad]
          );
          console.log("Producto agregado a la orden");
        } else {
          const fecha = new Date().toISOString().slice(0, 10);
          await db.runAsync(
            "INSERT INTO orden (usuario_telefono, fecha) VALUES (?, ?)",
            [usuarioTelefono, fecha]
          );
          const ordenId = (await db.getFirstAsync("SELECT last_insert_rowid() AS id")).id;
          await db.runAsync(
            "INSERT INTO orden_producto (orden_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)",
            [ordenId, producto.id, cantidad, producto.precio * cantidad]
          );
          console.log("Producto agregado a la orden");
        }

        setProductoAgregado(true);
      } else {
        console.log("No hay usuario con sesión iniciada");
      }
    } catch (error) {
      console.error("Error al agregar el producto a la orden:", error);
    }
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [300, 0],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Card.Image source={{ uri: producto.imagen }} style={styles.productoImage} />
      </Animated.View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <Card containerStyle={styles.cardContainer}>
            <Card.Title style={styles.productoName}>{producto.nombre}</Card.Title>
            <Card.Divider />
            <Text style={styles.productoIngredientes}>{producto.ingredientes}</Text>
            <Card.Divider />
            <Text style={styles.productoDescripcion}>{producto.descripcion}</Text>
            <Card.Divider />
            <Text style={styles.productoPrecio}>${producto.precio.toFixed(2)}</Text>
            <Card.Divider />
            <View style={styles.cantidadContainer}>
              <TouchableOpacity
                style={styles.cantidadButton}
                onPress={() => setCantidad(cantidad - 1)}
                disabled={cantidad === 1}
              >
                <Icon name="minus" type="font-awesome" size={20} />
              </TouchableOpacity>
              <Text style={styles.cantidadText}>{cantidad}</Text>
              <TouchableOpacity
                style={styles.cantidadButton}
                onPress={() => setCantidad(cantidad + 1)}
              >
                <Icon name="plus" type="font-awesome" size={20} />
              </TouchableOpacity>
            </View>
            {productoAgregado ? (
      <Text style={styles.productoAgregadoText}>El producto ya ha sido agregado a la orden</Text>
    ) : (
      <Button
        title="Agregar"
        buttonStyle={styles.agregarButton}
        onPress={handleAgregar}
      />
    )} 
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  productoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scrollContainer: {
    paddingTop: 300,
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  cardContainer: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  productoName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  productoIngredientes: {
    fontSize: 16,
    marginBottom: 10,
  },
  productoDescripcion: {
    fontSize: 16,
    marginBottom: 10,
  },
  productoPrecio: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cantidadContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  cantidadButton: {
    backgroundColor: "#eee",
    borderRadius: 5,
    padding: 5,
  },
  cantidadText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  agregarButton: {
    borderRadius: 10,
    marginHorizontal: 20,
  },
  productoAgregadoText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
}); 