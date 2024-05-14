import React, { Suspense, useState,useEffect } from "react";
import { Text} from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import BackgroundVideo from '@/components/BackgroundVideo';
import { SafeAreaView } from "react-native-safe-area-context";
import { Input,Button } from "@rneui/base";
import { Link ,useRouter} from "expo-router";
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
        router.push('/(tabs)');
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
        await db.execAsync(
          "UPDATE users SET sesion = 1 WHERE telefono = ?",
          [phoneNumber]
        );

        // Redirigir al usuario a la página principal
        router.push('/(tabs)');
      } else {
        // Las credenciales son incorrectas o el usuario ya ha iniciado sesión anteriormente
        console.log("Credenciales incorrectas");
        // Puedes mostrar un mensaje de error al usuario
      }
    } catch (error) {
      console.error("Error al ejecutar la consulta:", error);
    }
  };
 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)', paddingTop:20 }}>
      <BackgroundVideo source={require('@/assets/Videos/pasion-carne.mp4')} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#ffffff', textAlign: 'center' }}>
        Inicio de sesión
      </Text>
      <Input
        style={{ marginBottom: 8, padding: 8, backgroundColor: "#ffffffaf", borderRadius: 10 }}
        placeholder="Número de teléfono"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        leftIcon={{ name: "phone", type: "font-awesome" }}
      />
      <Input
        style={{ marginBottom: 16, padding: 8, backgroundColor: "#ffffffaf", borderRadius: 10 }}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        leftIcon={{ name: "lock", type: "font-awesome" }}
      />
      <Button
        title="Iniciar sesión"
        buttonStyle={{
          backgroundColor: 'black',
          borderWidth: 2,
          borderColor: 'white',
          borderRadius: 10,
        }}
        containerStyle={{
          marginHorizontal: 50,
          marginVertical: 10,
        }}
        titleStyle={{ fontWeight: 'bold' }}
        onPress={handleLogin}
      />
      <Text style={{ color: '#ffffff', textAlign: 'center', marginTop: 10, fontSize:15 }}>
        ¿No tienes una cuenta? 
        <Link href="/registro" style={{ color: 'blue' }}> Regístrate</Link>
      </Text>
    </SafeAreaView>
  );
} 