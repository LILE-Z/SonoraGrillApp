import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Animated, Dimensions, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';




const imagenes = [
  "https://sonoragrill.com.mx/nuestro-menu/assets/content/icon-alimentos.png",
  "https://sonoragrill.com.mx/nuestro-menu/assets/content/icon-bebidas.png",
  "https://sonoragrill.com.mx/nuestro-menu/assets/content/icon-postres.png",
  "https://sonoragrill.com.mx/nuestro-menu/assets/content/icon-alimentos.png",
  "https://images.otstatic.com/prod1/48485721/2/large.jpg",
  "https://primesteakclub.com.mx/menu/assets/content/corte.jpg"
];

{/* */}


const { width, height } = Dimensions.get('window');

// Tamaño del contenedor
const ESPACIO_CONTENEDOR = width * 0.8;
const ESPACIO = 10;
const ESPACIO_LATERAL = (width - ESPACIO_CONTENEDOR) / 2;
const ALTURA_BACKDROP = height * 0.5;

function Backdrop({ scrollX }) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          height: ALTURA_BACKDROP,
          top: 0,
          width: width,
        },
        StyleSheet.absoluteFillObject,
      ]}
    >
      {imagenes.map((imagen, index) => {
        const inputRange = [
          (index - 1) * ESPACIO_CONTENEDOR,
          index * ESPACIO_CONTENEDOR,
          (index + 1) * ESPACIO_CONTENEDOR,
        ];

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
        });

        return (
          <Animated.Image
            key={index}
            source={{ uri: imagen }}
            style={[
              { width: width, height: ALTURA_BACKDROP, opacity },
              StyleSheet.absoluteFillObject,
            ]}
          />
        );
      })}
      <LinearGradient
        colors={['transparent', 'white']}
        style={{
          width,
          height: ALTURA_BACKDROP,
          position: 'absolute',
          bottom: 0,
        }}
      />
    </View>
  );
}

export default function Menu() {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={styles.container}>
      <Backdrop scrollX={scrollX} />
      <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 20 }}>
        Menu
      </Text>
      <Animated.FlatList
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        data={imagenes}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 200,
          paddingHorizontal: ESPACIO_LATERAL,
        }}
        decelerationRate={0}
        snapToInterval={ESPACIO_CONTENEDOR}
        scrollEventThrottle={16}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * ESPACIO_CONTENEDOR,
            index * ESPACIO_CONTENEDOR,
            (index + 1) * ESPACIO_CONTENEDOR,
          ];
          const outputRange = [0, -50, 0];
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange,
            extrapolate: 'clamp',
          });

          return (
            <View style={{ width: ESPACIO_CONTENEDOR }}>
              <Animated.View
                style={{
                  marginHorizontal: ESPACIO,
                  padding: ESPACIO,
                  borderRadius: 34,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  transform: [{ translateY }],
                }}
              >
                <Image source={{ uri: item }} style={styles.posterImage} />
                <Text style={{ fontWeight: 'bold', fontSize: 26 }}>Título</Text>
              </Animated.View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  posterImage: {
    width: '100%',
    height: ESPACIO_CONTENEDOR * 1.2,
    resizeMode: 'cover',
    borderRadius: 24,
    margin: 0,
    marginBottom: 10,
  },
});