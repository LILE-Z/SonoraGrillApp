import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Share, Linking, Platform, Alert, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function CustomDrawerContent(props: any) {
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Sonora Grill el mejor Restaurante , Hecho por Albert Zuñiga Neponuceno",
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Orden"
        onPress={() => {
          router.push("(tabs)/orden");
        }}
        icon={({ color, size }) => (
          <Ionicons name="basket" color={color} size={size} />
        )}
      />
      <DrawerItem
        label="User"
        onPress={() => {
          router.push("(tabs)/user");
        }}
        icon={({ color, size }) => (
          <Ionicons name="person" color={color} size={size} />
        )}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <DrawerItem
          label="Phone"
          onPress={() => {
            if (Platform.OS === "android") {
              Linking.openURL("tel: 2223602234");
            } else {
              Linking.openURL("telprompt: 123456789");
            }
          }}
          icon={({ color, size }) => (
            <Ionicons name="call" color={color} size={size} />
          )}
          labelStyle={{ color: "#623a27" }}
        />
        <DrawerItem
          label="Compartir"
          onPress={handleShare}
          icon={({ color, size }) => (
            <Ionicons name="share" color={color} size={size} />
          )}
          labelStyle={{ color: "#623a27" }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    CoreSans: require("../assets/fonts/CoreSans.otf"),
  });

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (loaded) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await SplashScreen.hideAsync();
      }
    };
    hideSplashScreen();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const handleButtonPress = () => {
    // Lógica que se ejecutará cuando se pulse el botón
    alert("Botón presionado");
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
          <Drawer.Screen
            name="registro"
            options={{
              drawerItemStyle: { display: "none" },
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name="index"
            options={{
              drawerItemStyle: { display: "none" },
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name="+not-found"
            options={{
              drawerItemStyle: { display: "none" },
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name="(tabs)"
            options={{
              title: "Home",
              drawerLabel: "Home",
              headerShown: false,
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
