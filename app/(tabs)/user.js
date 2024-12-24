import React, { useState, useEffect, Suspense } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Card,Icon } from '@rneui/base';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function App() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider
        databaseName="mydb.db"
        assetSource={{ assetId: require("@/assets/mydb.db") }}
        useSuspense
      >
        <OrdersScreen />
      </SQLiteProvider>
    </Suspense>
  );
}

function OrdersScreen() {
  const [receipts, setReceipts] = useState([]);
  const [user, setUser] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState('');
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    fetchReceipts();
  }, [isFocused]);

  const fetchUser = async () => {
    try {
      const resultSet = await db.getAllAsync(
        "SELECT nombre, direccion FROM users WHERE sesion = ?",
        [true]
      );
      console.log('User result set:', resultSet);
      if (resultSet.length > 0) {
        setUser(resultSet[0]);
        console.log('User set:', resultSet[0]);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchReceipts = async () => {
    try {
      console.log('Fetching receipts for user:', user);
      const resultSet = await db.getAllAsync(
        `SELECT r.id, r.fecha, r.hora, r.total
        FROM recibo r
        JOIN orden o ON r.orden_id = o.id
        JOIN users u ON o.usuario_telefono = u.telefono
        WHERE u.sesion = ?`,
        [true]
      );
      console.log('Receipts result set:', resultSet);
      setReceipts(resultSet);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  };

  const updateUserAddress = async () => {
    try {
      await db.runAsync(
        "UPDATE users SET direccion = ? WHERE sesion = ?",
        [editedAddress, true]
      );
      setUser({ ...user, direccion: editedAddress });
      setIsEditingAddress(false);
    } catch (error) {
      console.error('Error updating user address:', error);
    }
  };

  const logOut = async () => {
    try {
      await db.runAsync(
        "UPDATE users SET sesion = ? WHERE sesion = ?",
        [false, true]
      );
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  const renderReceiptItem = ({ item }) => (
    <Card containerStyle={styles.cardContainer}>
      <Card.Title style={styles.cardTitle}>{item.fecha} - {item.hora}</Card.Title>
      <Card.Divider />
      <View style={styles.cardContent}>
        <Text style={styles.totalText}>Total: ${item.total}</Text>
      </View>
    </Card>
  );

  console.log('User state:', user);
  console.log('Receipts state:', receipts);

  return (
    <LinearGradient colors={['#623a27', '#a65b39', '#ecdab9']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Mis Compras</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Bienvenido, {user.nombre}!</Text>
            {isEditingAddress ? (
              <View style={styles.editAddressContainer}>
                <Text styles={{
                  fontSize: 16,
                  color: "white",
                }}>
                  Dirección:
                </Text>
                <TextInput
                  style={styles.editAddressInput}
                  value={editedAddress}
                  onChangeText={setEditedAddress}
                />
                <TouchableOpacity onPress={updateUserAddress}>
                  <Icon name="save" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addressContainer}>
                <Text style={styles.addressText}>{user.direccion}</Text>
                <TouchableOpacity onPress={() => {
                  setEditedAddress(user.direccion);
                  setIsEditingAddress(true);
                }}>
                  <Icon name="edit" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.logOutButton} onPress={logOut}>
  <Text style={styles.logOutButtonText}>Log Out</Text>
</TouchableOpacity>
          </View>
        )}
        <FlatList
          data={receipts}
          renderItem={renderReceiptItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: "white",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 5,
    color: "white",
    backgroundColor: "rgba(166, 91, 57, 0.8)",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  userInfo: {
    marginBottom: 20,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  addressText: {
    fontSize: 16,
    color: "white",
    marginRight: 10,
  },
  editAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  editAddressInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    color: "white",
  },
  listContent: {
    paddingBottom: 20,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardContent: {
    alignItems: "center",
    paddingVertical: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logOutButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  logOutButtonText: {
    color: '#a65b39',
    fontSize: 16,
    fontWeight: 'bold',
  },
});