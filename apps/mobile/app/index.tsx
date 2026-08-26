import { useEffect, useRef, useState } from "react";
import { Animated, View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../packages/firebase/src/config/firebase";

// Local asset or custom logo path
import AppLogo from "../../../packages/shared-ui/assets/logos/transparentBgLogo.png"; 

const MIN_SPLASH_DURATION = 2000; // Minimum time logo is visible (ms)
const EXIT_DURATION = 240;        // Fade out duration (ms)

export default function IndexRedirectScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? "light";
  const isDarkMode = scheme === "dark";

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Animation Refs
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // 1. Entrance animation & Auth listener
  useEffect(() => {
    // Play logo entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    // Listen for Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  // 2. Handle exit transition after auth resolves
  useEffect(() => {
    // Wait until auth state is determined
    if (isLoggedIn === null) return;

    const timer = setTimeout(() => {
      // Fade out screen
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          // Replace stack with target route
          router.replace(isLoggedIn ? "/(tabs)/(home)" : "/(auth)");
        }
      });
    }, MIN_SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [isLoggedIn, router, screenOpacity]);

  // Color theme definitions matching your app
  const bgSurface =  "#FAF8F0";
  const textColor =  "#24221B";
  const subtitleColor = "#605E55";

  return (
    <Animated.View style={{ flex: 1, opacity: screenOpacity, backgroundColor: bgSurface }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        {/* Animated Logo Container */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Image
            source={AppLogo}
            resizeMode="contain"
            style={{ width: 140, height: 140 }}
          />
        </Animated.View>

        {/* Title / Tagline */}
        <Animated.View style={{ opacity: logoOpacity, alignItems: "center", marginTop: 24 }}>
          <Text
           className="font-heading"
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: textColor,
              marginBottom: 6,
            }}
          >
            Get up & Go
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: subtitleColor,
            }}
          >
            Discover what’s right around you.
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}