import React, { Suspense, useState } from 'react';
import { Text, Input, Button, Alert } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundVideo from '@/components/BackgroundVideo';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <SQLiteProvider
        databaseName="mydb.db"
        assetSource={{ assetId: require("../assets/mydb.db") }}
        useSuspense
      >
        <Registro />
      </SQLiteProvider>
    </Suspense>
  );
}
function Registro() {
  const db = useSQLiteContext();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [direccion, setDireccion] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    // Validar los campos antes de enviar el formulario
    if (nombre.trim().length < 5) {
      alert('El nombre debe tener al menos 5 letras');
      return;
    }

    if (telefono.trim().length !== 10) {
      alert('El número de teléfono debe tener 10 dígitos');
      return;
    }

    if (password.trim().length < 5) {
      alert('La contraseña debe tener al menos 5 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (direccion.trim().length < 15) {
      alert('La dirección debe tener al menos 15 caracteres');
      return;
    }

    try {
      // Verificar si el número de teléfono ya existe en la base de datos
      const existingUser = await db.getAllAsync(
        'SELECT * FROM users WHERE telefono = ?',
        [telefono]
      );

      if (existingUser.length > 0) {
        alert('El número de teléfono ya está registrado');
        return;
      }

      // Insertar los datos del usuario en la base de datos
      await db.runAsync(
        'INSERT INTO users (nombre, telefono, password, direccion, sesion) VALUES (?, ?, ?, ?, ?)',
        [nombre, telefono, password, direccion, 0]
      );

      alert('Registro exitoso');

      // Obtener los datos actualizados de la base de datos
      const result = await db.getAllAsync("SELECT * FROM users");
      console.log("Datos actualizados:", result);

      setTimeout(() => {
        console.log('Registro exitoso');
        router.push('/');
      }, 1000);

      // Aquí puedes redirigir al usuario a la página de inicio de sesión o realizar otras acciones
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <BackgroundVideo source={require('@/assets/Videos/pasion-carne.mp4')} />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Registro</Text>
        <Input
          placeholder="Nombre"
          leftIcon={{ name: 'user', type: 'font-awesome' }}
          value={nombre}
          onChangeText={setNombre}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
        />
        <Input
          placeholder="Número de teléfono"
          leftIcon={{ name: 'phone', type: 'font-awesome' }}
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
        />
        <Input
          placeholder="Contraseña"
          leftIcon={{ name: 'lock', type: 'font-awesome' }}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
        />
        <Input
          placeholder="Confirmar contraseña"
          leftIcon={{ name: 'lock', type: 'font-awesome' }}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
        />
        <Input
          placeholder="Dirección"
          leftIcon={{ name: 'map-marker', type: 'font-awesome' }}
          value={direccion}
          onChangeText={setDireccion}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
        />
        <Button title="Registrarse" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  inputText: {
    color: 'black',
  },
});