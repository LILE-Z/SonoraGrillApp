import React, { Suspense, useState, useEffect } from "react";
import { Text, StyleSheet, View } from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import BackgroundVideo from '@/components/BackgroundVideo';
import { SafeAreaView } from "react-native-safe-area-context";
import { Input, Button } from "@rneui/base";
import { Link, useRouter, useFocusEffect } from "expo-router";

export default function App() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider
        databaseName="mydb.db"
        assetSource={{ assetId: require("../assets/mydb.db") }}
        useSuspense
      >
        <LoginScreen />
      </SQLiteProvider>
    </Suspense>
  );
}

function LoginScreen() {
  const db = useSQLiteContext();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const result = await db.getAllAsync(
        "SELECT * FROM users WHERE sesion = 1"
      );

      if (result.length > 0) {
        // El usuario ya ha iniciado sesión anteriormente
        console.log("Sesión activa");
        // Redirigir al usuario a la página principal
        router.push('/(tabs)/menu');
      }
    } catch (error) {
      console.error("Error al verificar la sesión:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await db.getAllAsync(
        "SELECT * FROM users WHERE telefono = ? AND password = ? AND sesion = 0",
        [phoneNumber, password]
      );

      if (result.length > 0) {
        // El inicio de sesión es exitoso
        console.log("Inicio de sesión exitoso");
        
        // Actualizar el campo "secion" a 1 para indicar que el usuario ha iniciado sesión
        await db.runAsync(
          "UPDATE users SET sesion = 1 WHERE telefono = ?",
          [phoneNumber]
        );

        // Redirigir al usuario a la página principal
        router.push('/(tabs)/menu');
      } else {
        // Las credenciales son incorrectas
        console.log("Credenciales incorrectas");
        alert("Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al ejecutar la consulta:", error);
    }
  };

  const refreshData = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM users");
      console.log("Datos actualizados:", result);
    } catch (error) {
      console.error("Error al obtener los datos actualizados:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundVideo source={require('@/assets/Videos/pasion-carne.mp4')} />
      <View style={styles.content}>
        <Text style={styles.title}>Inicio de sesión</Text>
        <Input
          containerStyle={styles.input}
          placeholder="Número de teléfono"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          leftIcon={{ name: "phone", type: "font-awesome" }}
        />
        <Input
          containerStyle={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          leftIcon={{ name: "lock", type: "font-awesome" }}
        />
        <Button
          title="Iniciar sesión"
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
          titleStyle={styles.buttonTitle}
          onPress={handleLogin}
        />
        <Text style={styles.registerText}>
          ¿No tienes una cuenta?{' '}
          <Link href="/registro" style={styles.registerLink}>Regístrate</Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    paddingTop: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: 'black',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  registerLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});