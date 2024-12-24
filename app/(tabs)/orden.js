import React, { useEffect, useState, Suspense } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet } from 'react-native';
import { Card, Button, Icon, Overlay, BottomSheet } from '@rneui/themed';
import { useIsFocused } from '@react-navigation/native';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { EvilIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider
        databaseName="mydb.db"
        assetSource={{ assetId: require("@/assets/mydb.db") }}
        useSuspense
      >
        <OrdenPage />
      </SQLiteProvider>
    </Suspense>
  );
}

function OrdenPage() {
  const [orden, setOrden] = useState(null);
  const [productos, setProductos] = useState([]);
  const [nota, setNota] = useState('');
  const [showNotaOverlay, setShowNotaOverlay] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);

  const db = useSQLiteContext();
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchOrden = async () => {
      try {
        const userResultSet = await db.getAllAsync(
          "SELECT * FROM users WHERE sesion = 1"
        );
        if (userResultSet.length > 0) {
          const user = userResultSet[0];
          const ordenResultSet = await db.getAllAsync(
            "SELECT * FROM orden WHERE usuario_telefono = ? AND id NOT IN (SELECT orden_id FROM recibo)",
            [user.telefono]
          );
          if (ordenResultSet.length > 0) {
            const orden = ordenResultSet[0];
            setOrden(orden);

            const productosResultSet = await db.getAllAsync(
              "SELECT op.producto_id, p.nombre, op.cantidad, op.nota, op.precio, p.imagen " +
              "FROM orden_producto op " +
              "JOIN producto p ON op.producto_id = p.id " +
              "WHERE op.orden_id = ?",
              [orden.id]
            );
            setProductos(productosResultSet);
          }
        }
      } catch (error) {
        console.error("Error fetching orden:", error);
      }
    };

    if (isFocused) {
      fetchOrden();
    }
  }, [isFocused]);

  const handleCantidadChange = async (productoId, cantidad) => {
    try {
      await db.runAsync(
        "UPDATE orden_producto SET cantidad = ? WHERE orden_id = ? AND producto_id = ?",
        [cantidad, orden.id, productoId]
      );
      const updatedProductos = productos.map(producto => {
        if (producto.producto_id === productoId) {
          return { ...producto, cantidad };
        }
        return producto;
      });
      setProductos(updatedProductos);
    } catch (error) {
      console.error("Error updating cantidad:", error);
    }
  };

  const handleEliminarProducto = async (productoId) => {
    try {
      if (!orden) {
        alert("No existe una orden para eliminar productos.");
        return;
      }

      await db.runAsync(
        "DELETE FROM orden_producto WHERE orden_id = ? AND producto_id = ?",
        [orden.id, productoId]
      );
      const updatedProductos = productos.filter(producto => producto.producto_id !== productoId);
      setProductos(updatedProductos);
    } catch (error) {
      console.error("Error deleting producto:", error);
    }
  };

  const handleNotaChange = (text) => {
    setNota(text);
  };

  const handleGuardarNota = async () => {
    try {
      await db.runAsync(
        "UPDATE orden_producto SET nota = ? WHERE orden_id = ? AND producto_id = ?",
        [nota, orden.id, selectedProducto.producto_id]
      );
      const updatedProductos = productos.map(producto => {
        if (producto.producto_id === selectedProducto.producto_id) {
          return { ...producto, nota };
        }
        return producto;
      });
      setProductos(updatedProductos);
      setShowNotaOverlay(false);
      setSelectedProducto(null);
      setNota('');
    } catch (error) {
      console.error("Error updating nota:", error);
    }
  };

  const handleCancelarNota = () => {
    setShowNotaOverlay(false);
    setSelectedProducto(null);
    setNota('');
  };

  const handleComprar = async () => {
    try {
      if (!orden) {
        alert("No existe una orden para generar el recibo.");
        return;
      }

      const fecha = new Date().toISOString().split('T')[0];
      const hora = new Date().toLocaleTimeString();
      const total = productos.reduce((sum, producto) => sum + producto.precio * producto.cantidad, 0);

      const reciboResultSet = await db.runAsync(
        "INSERT INTO recibo (orden_id, fecha, hora, total) VALUES (?, ?, ?, ?)",
        [orden.id, fecha, hora, total]
      );

      const reciboId = reciboResultSet.insertId;

      alert(`Compra realizada con éxito 😀`);

      // Obtener el estado actualizado de la tabla recibo
      const recibosResultSet = await db.getAllAsync("SELECT * FROM recibo");
      console.log("Estado de la tabla recibo:", recibosResultSet);

      // Actualizar la página después de realizar la compra
      setOrden(null);
      setProductos([]);
    } catch (error) {
      console.error("Error generating recibo:", error);
    }
  };

  const renderProductoItem = (producto) => (
    <Card key={producto.producto_id}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: producto.imagen }} style={{ width: 80, height: 80, marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{producto.nombre}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.cantidadButton}
              onPress={() => handleCantidadChange(producto.producto_id, producto.cantidad - 1)}
              disabled={producto.cantidad === 1}
            >
              <AntDesign name="minus" size={20} color="black" />
            </TouchableOpacity>
            <Text style={styles.cantidadText}>{producto.cantidad}</Text>
            <TouchableOpacity
              style={styles.cantidadButton}
              onPress={() => handleCantidadChange(producto.producto_id, producto.cantidad + 1)}
            >
              <AntDesign name="plus" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <Text>Precio: ${producto.precio}</Text>
        </View>
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => handleEliminarProducto(producto.producto_id)}>
            <AntDesign name="delete" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setSelectedProducto(producto);
            setNota(producto.nota || '');
            setShowNotaOverlay(true);
          }}>
            <EvilIcons name="pencil" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#090909" }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 10, textAlign: 'center', color: "white" }}>Orden</Text>
      {productos.map(renderProductoItem)}
      <Button title="Comprar" onPress={handleComprar} containerStyle={{ marginTop: 40 }} />
      <Overlay isVisible={showNotaOverlay} onBackdropPress={handleCancelarNota}>
        <View style={{ width: '90%', height: '60%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Nota</Text>
          <TextInput
            value={nota}
            onChangeText={handleNotaChange}
            multiline
            style={{ flex: 1, borderWidth: 1, borderColor: 'gray', marginBottom: 10, padding: 10 }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <Button title="Guardar" onPress={handleGuardarNota} />
            <Button title="Cancelar" onPress={handleCancelarNota} />
          </View>
        </View>
      </Overlay>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cantidadButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 5,
    marginHorizontal: 5,
  },
  cantidadText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});