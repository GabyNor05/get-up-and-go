import { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  Share,
  Alert,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import { Share2, MapPin, Clock, ThumbsUp, QrCode, Image as ImageIcon, Check } from "lucide-react-native";
import { HAPPENINGS } from "../../../data/happenings-data";

interface Props {
  darkMode: boolean;
  eventId: number | null;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 120;

export default function HappeningDetailDrawer({ darkMode, eventId, onClose }: Props) {
  const visible = eventId !== null;
  const [mounted, setMounted] = useState(visible);
  const [going, setGoing] = useState(false);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragStartY = useRef<number | null>(null);
  const dragOffset = useRef(0);

  const event = eventId !== null ? HAPPENINGS.find((h) => h.id === eventId) : undefined;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setGoing(false);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14 }).start();
    } else if (mounted) {
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true }).start(() =>
        setMounted(false)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true }).start(() => {
      setMounted(false);
      onClose();
    });
  };

  const handleDragStart = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    dragStartY.current = e.nativeEvent.touches[0].pageY;
  };

  const handleDragMove = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (dragStartY.current === null) return;
    const dy = e.nativeEvent.touches[0].pageY - dragStartY.current;
    dragOffset.current = Math.max(0, dy);
    translateY.setValue(dragOffset.current);
  };

  const handleDragEnd = () => {
    if (dragOffset.current > DISMISS_THRESHOLD) {
      handleClose();
    } else {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    }
    dragStartY.current = null;
    dragOffset.current = 0;
  };

  const handleShare = () => {
    if (!event) return;
    Share.share({ message: `${event.title} — ${event.location}, ${event.date}` }).catch(() => {});
  };

  const handleScanQr = () => {
    Alert.alert("Scan QR Code", "Camera would open here to check in at this Happening.");
  };

  if (!mounted || !event) return null;

  const surface = darkMode ? "#24221B" : "#FAF8F0";
  const text = darkMode ? "#FAF8F0" : "#24221B";
  const muted = "#605E55";
  const border = darkMode ? "rgba(250,248,240,0.08)" : "rgba(36,34,27,0.08)";
  const placeholderBg = darkMode ? "#3a382c" : "#dcdcdc";

  return (
    <Modal transparent visible={mounted} animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1 }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(26,26,26,0.5)" }} onPress={handleClose} />

        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: "88%",
            backgroundColor: surface,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            transform: [{ translateY }],
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -6 },
            elevation: 12,
          }}
        >
          {/* Drag handle — swipe down here to dismiss */}
          <View
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{ paddingTop: 10, paddingBottom: 6, alignItems: "center" }}
          >
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: border }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
            {/* Hero image */}
            <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
              <View style={{ height: 190, borderRadius: 20, backgroundColor: placeholderBg, alignItems: "center", justifyContent: "center" }}>
                <ImageIcon size={40} color={muted} />
              </View>
            </View>

            {/* Title + Share */}
            <View style={{ paddingHorizontal: 24, paddingTop: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={{ fontFamily: "Fredoka-SemiBold", fontSize: 22, fontWeight: "700", color: text, flex: 1, marginRight: 12 }}>
                {event.title}
              </Text>
              <Pressable
                onPress={handleShare}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: border, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14 }}
              >
                <Share2 size={14} color={text} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: text }}>Share</Text>
              </Pressable>
            </View>

            {/* Location + Date */}
            <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MapPin size={14} color="#A88AED" />
                <Text style={{ fontSize: 13, color: "#A88AED", fontWeight: "600", textDecorationLine: "underline" }}>
                  {event.location}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Clock size={14} color={muted} />
                <Text style={{ fontSize: 13, color: muted }}>{event.date}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
              <Text style={{ fontSize: 14, color: text, lineHeight: 22 }}>{event.description}</Text>
            </View>

            {/* RSVP / QR buttons */}
            <View style={{ paddingHorizontal: 24, paddingTop: 22, flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => setGoing((v) => !v)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: going ? "#A6C261" : "#A88AED",
                  borderRadius: 14,
                  paddingVertical: 14,
                }}
              >
                {going ? <Check size={16} color="#FAF8F0" /> : <ThumbsUp size={16} color="#FAF8F0" />}
                <Text style={{ color: "#FAF8F0", fontSize: 14, fontWeight: "700" }}>{going ? "Going" : "RSVP Yes"}</Text>
              </Pressable>
              <Pressable
                onPress={handleScanQr}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderWidth: 1.5,
                  borderColor: border,
                  borderRadius: 14,
                  paddingVertical: 14,
                }}
              >
                <QrCode size={16} color={text} />
                <Text style={{ color: text, fontSize: 14, fontWeight: "700" }}>Scan QR Code</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
