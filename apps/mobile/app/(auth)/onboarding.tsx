import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Animated,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import { router } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import slide1 from "../../assets/onboarding/slide1.jpg";
import slide2 from "../../assets/onboarding/slide2.jpg";
import slide3 from "../../assets/onboarding/slide3.jpg";

interface Props {
  darkMode: boolean;
  toggleDark?: () => void;
  onFinish: () => void;
  onSkip: () => void;
}

const slides = [
  {
    img: slide1,
    title: "Find Happenings\nNearby",
    body: "Step outside and explore top-rated local spots and real-time events near you.",
    accent: "#A88AED",
  },
  {
    img: slide2,
    title: "Build Your\nCircles",
    body: "Staying active is easier together. Create groups, invite friends, and hold each other accountable.",
    accent: "#A88AED",
  },
  {
    img: slide3,
    title: "Track Progress\n& Win",
    body: "Build lasting habits. Unlock achievements as you push your limits and crush your weekly goals.",
    accent: "#A6C261",
  },
];

export default function OnboardingScreen({
  darkMode,
  toggleDark,
  onFinish,
  onSkip,
}: Props) {
  const [step, setStep] = useState<"carousel" | "permissions">("carousel");
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const bg = darkMode ? "#1A1A1A" : "#F4F0DD";
  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = darkMode ? "#B8B6AC" : "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";

  const goTo = (index: number) => {
    if (isAnimating || index === slideIndex) return;
    const dir = index > slideIndex ? -1 : 1;
    setIsAnimating(true);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: dir * 24,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSlideIndex(index);
      slide.setValue(dir * -24);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start(() => setIsAnimating(false));
    });
  };

  const handleNext = () => {
    if (slideIndex < slides.length - 1) {
      goTo(slideIndex + 1);
    } else {
      setStep("permissions");
    }
  };

  const handleTouchStart = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    touchStartX.current = e.nativeEvent.touches[0].pageX;
  };

  const handleTouchEnd = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (touchStartX.current === null) return;
    const dx = e.nativeEvent.changedTouches[0].pageX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && slideIndex < slides.length - 1) goTo(slideIndex + 1);
      if (dx > 0 && slideIndex > 0) goTo(slideIndex - 1);
    }
    touchStartX.current = null;
  };

  if (step === "permissions") {
    return router.push("/permissions");
  }

  const current = slides[slideIndex];
  const isLast = slideIndex === slides.length - 1;

  return (
    <View
      style={{ flex: 1, backgroundColor: bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip / dark toggle row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 12,
        }}
      >
        {toggleDark ? (
          <Pressable
            onPress={toggleDark}
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 15 }}>{darkMode ? "☀️" : "🌙"}</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable onPress={onSkip} hitSlop={8}>
          <Text style={{ color: muted, fontSize: 14, fontWeight: "600" }}>
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Hero image card */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <View
          style={{
            borderRadius: 24,
            overflow: "hidden",
            height: 260,
            backgroundColor: darkMode ? "#2a2a1e" : "#e8e4d4",
            borderWidth: 1,
            borderColor: border,
          }}
        >
          <Image
            source={current.img}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              opacity: darkMode ? 0.7 : 0.85,
            }}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Text content */}
      <Animated.View
        style={{
          flex: 1,
          paddingHorizontal: 28,
          paddingTop: 28,
          opacity: fade,
          transform: [{ translateX: slide }],
        }}
      >
        <Text
          style={{
            fontFamily: "Fredoka-SemiBold, sans-serif", // requires font loading
            fontSize: 36,
            fontWeight: "600",
            color: text,
            lineHeight: 40,
            letterSpacing: -0.5,
            marginBottom: 16,
          }}
        >
          {current.title}
        </Text>
        <Text style={{ fontSize: 15, color: muted, lineHeight: 24.5 }}>
          {current.body}
        </Text>
      </Animated.View>

      {/* Bottom controls */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 28,
          gap: 24,
        }}
      >
        {/* Pagination dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          }}
        >
          {slides.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => goTo(i)}
              style={{
                height: 8,
                width: i === slideIndex ? 28 : 8,
                borderRadius: 100,
                backgroundColor:
                  i === slideIndex
                    ? "#A88AED"
                    : darkMode
                      ? "rgba(250,248,240,0.2)"
                      : "rgba(36,34,27,0.18)",
              }}
            />
          ))}
        </View>

        {/* CTA button */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            backgroundColor: isLast ? "#A6C261" : "#A88AED",
            borderRadius: 18,
            paddingVertical: 17,
            alignItems: "center",
            opacity: pressed ? 0.9 : 1,
            shadowColor: isLast ? "#A6C261" : "#A88AED",
            shadowOpacity: 0.4,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          })}
        >
          <Text
            style={{
              color: "#FAF8F0",
              fontSize: 16,
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            {isLast ? "Go to Permissions" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
