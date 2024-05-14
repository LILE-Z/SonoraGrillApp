import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';

const BackgroundVideo = ({ source }) => {
  const videoRef = useRef(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // Reproducir el video cuando la pantalla está enfocada
      if (videoRef.current) {
        videoRef.current.playAsync();
      }
    } else {
      // Pausar el video cuando la pantalla no está enfocada
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    }
  }, [isFocused]);

  const handleVideoReady = async () => {
    if (videoRef.current) {
      await videoRef.current.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={source}
        style={styles.video}
        shouldPlay={false}
        isLooping
        resizeMode="cover"
        onReadyForDisplay={handleVideoReady}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  video: {
    flex: 1,
  },
});

export default BackgroundVideo;