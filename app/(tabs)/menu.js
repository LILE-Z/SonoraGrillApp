import React, { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, Animated, Dimensions, FlatList, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const imagenes = [
  "https://i0.wp.com/statement.media/wp-content/uploads/2023/12/Sonora-Grill-Santa-Fe-Alan-Gonzalez-S-Statement_7182.jpg",
  "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/c5/22/7c/ordena-nuestro-senor.jpg",
  "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/a1/69/d1/sonora-prime-monterrey.jpg",
  "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/a1/69/dc/sonora-prime-monterrey.jpg",
  "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/c8/6b/e1/cheesecake-de-frutos.jpg"
];

const categorias = [
  "Entradas",
  "Alimentos",
  "Cortes",
  "Bebidas",
  "Postres"
];

const { width, height } = Dimensions.get('window');

// Tamaño del contenedor
const ESPACIO_CONTENEDOR = width * 0.7;
const ESPACIO = 10;
const ESPACIO_LATERAL = (width - ESPACIO_CONTENEDOR) / 2;
const ALTURA = height * 0.5;

function Backdrop({ scrollX }) {
  const backgroundImages = imagenes.map((imagen, index) => {
    const inputRange = [(index - 1) * ESPACIO_CONTENEDOR, index * ESPACIO_CONTENEDOR, (index + 1) * ESPACIO_CONTENEDOR];
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp'
    });

    return (
      <Animated.Image
        source={{ uri: imagen }}
        key={index}
        style={[
          {
            height: ALTURA,
            width,
            position: 'absolute',
            top: 0,
            opacity,
            marginVertical: 0
          }
        ]}
      />
    );
  });

  return (
    <View style={[{ height: ALTURA, width, position: 'absolute', top: 0 }, StyleSheet.absoluteFillObject]}>
      {backgroundImages}
    </View>
  );
}

export default function Menu() {
  const router = useRouter();
 
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleCategoryPress = (categoria) => {
    router.push(`/(tabs)/categoria?Categoria=${categoria}`);
  };
 

  return (
    <LinearGradient
      colors={['#1d2021', '#0d0d0d']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Menú</Text>
          <Image
            source={require('@/assets/images/sonora-grill-logo.png')}
            style={styles.logo}
          />
        </View>
        <Backdrop scrollX={scrollX} />
        <Animated.FlatList
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          data={imagenes}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 200, paddingHorizontal: ESPACIO_LATERAL }}
          decelerationRate={0}
          snapToInterval={ESPACIO_CONTENEDOR}
          scrollEventThrottle={16}
          keyExtractor={(item) => item}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * ESPACIO_CONTENEDOR,
              index * ESPACIO_CONTENEDOR,
              (index + 1) * ESPACIO_CONTENEDOR
            ];
            const outputRange = [0, -50, 0];
            const translateY = scrollX.interpolate({
              inputRange,
              outputRange,
              extrapolate: 'clamp'
            });

            return (
              <TouchableOpacity
                style={{ width: ESPACIO_CONTENEDOR }}
                onPress={() => handleCategoryPress(categorias[index])}
              >
                <Animated.View style={{
                  marginHorizontal: ESPACIO,
                  padding: ESPACIO,
                  marginVertical: 100,
                  borderRadius: 16,
                  backgroundColor: '#1d2021',
                  shadowColor: 'black',
                  shadowOffset: {
                    width: 0,
                    height: 2
                  },
                  shadowOpacity: 0.25,
                  alignItems: 'center',
                  transform: [{ translateY }]
                }}>
                  <Text style={styles.categoryText}>{categorias[index]}</Text>
                  <Image source={{ uri: item }} style={styles.posterImage} />
                </Animated.View>
              </TouchableOpacity>
            );
          }}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logo: {
    width,
    height: 34,
    resizeMode: 'contain',
    marginVertical: 12,
    left: 30,
  },
  posterImage: {
    width: "100%",
    height: ESPACIO_CONTENEDOR,
    borderRadius: 15,
    resizeMode: 'cover',
    marginBottom: ESPACIO,
  },
  categoryText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: ESPACIO,
    color: 'white',
  },
});