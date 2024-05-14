import React, { Suspense, useState } from 'react';
import { Text, Input, Button } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundVideo from '@/components/BackgroundVideo';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

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

  const handleSubmit = async () => {
    // Validar los campos antes de enviar el formulario
    if (nombre.trim() === '' || telefono.trim() === '' || password.trim() === '' || confirmPassword.trim() === '' || direccion.trim() === '') {
      console.log('Por favor, complete todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      console.log('Las contraseñas no coinciden');
      return;
    }

    try {
      // Insertar los datos del usuario en la base de datos
      await db.runAsync(
        'INSERT INTO users (nombre, telefono, password, direccion, sesion) VALUES (?, ?, ?, ?, ?)',
        [nombre, telefono, password, direccion, 0]
      );

      console.log('Registro exitoso');

      // Obtener los datos actualizados de la base de datos
      const result = await db.getAllAsync("SELECT * FROM users");
      console.log("Datos actualizados:", result);

      // Aquí puedes redirigir al usuario a la página de inicio de sesión o realizar otras acciones
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      // Manejo de errores en caso de que ocurra algún problema con la inserción en la base de datos
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <BackgroundVideo source={require('@/assets/Videos/pasion-carne.mp4')} />
      <Text>Registro</Text>
      <Input
        placeholder="Nombre"
        leftIcon={{ name: 'user', type: 'font-awesome' }}
        value={nombre}
        onChangeText={setNombre}
      />
      <Input
        placeholder="Número de teléfono"
        leftIcon={{ name: 'phone', type: 'font-awesome' }}
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <Input
        placeholder="Contraseña"
        leftIcon={{ name: 'lock', type: 'font-awesome' }}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Input
        placeholder="Confirmar contraseña"
        leftIcon={{ name: 'lock', type: 'font-awesome' }}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Input
        placeholder="Dirección"
        leftIcon={{ name: 'map-marker', type: 'font-awesome' }}
        value={direccion}
        onChangeText={setDireccion}
      />
      <Button title="Registrarse" onPress={handleSubmit} />
    </SafeAreaView>
  );
}