import React from 'react';
import { Text,Input,Button } from '@rneui/base';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundVideo from '@/components/BackgroundVideo';
export default function Registro() {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Registro</Text>
        <Input placeholder="Nombre" 
        leftIcon={{ name: 'user', type: 'font-awesome' }} />
        
        <Input placeholder="Número de teléfono"
        leftIcon={{ name: 'phone', type: 'font-awesome' }} />
        
        <Input placeholder="Contraseña" 
        leftIcon={{ name: 'lock', type: 'font-awesome' }}
        />
        <Input placeholder="Confirmar contraseña" 
        leftIcon={{ name: 'lock', type: 'font-awesome' }}
        />
        <Input placeholder="Dirección" 
        leftIcon={{ name: 'map-marker', type: 'font-awesome' }}
        />
        <Button>Registrarse</Button>

        </SafeAreaView>
    );
    }