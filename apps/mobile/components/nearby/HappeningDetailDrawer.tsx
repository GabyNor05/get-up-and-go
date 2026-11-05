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
  ActivityIndicator,
  Linking,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import { Image } from "expo-image";
import { Share2, MapPin, Clock, ThumbsUp, QrCode, Image as ImageIcon, Check } from "lucide-react-native";
import { CHECK_IN_GP, happeningService } from "../../../../packages/firebase/src/services/happeningService";
import { Happening } from "../../../../packages/firebase/src/types/happening";
import { useGoer } from "../../hooks/useGoer"; // Adjust path as needed
import QRScannerModal from "./QRScannerModal";
import { useAppTheme } from "@/hooks/useAppTheme";
import { circleFeedService } from "../../../../packages/firebase/src/services/circleFeedService";

interface Props {
  darkMode: boolean;
  eventId: string | null;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 120;

export default function HappeningDetailDrawer({ darkMode, eventId, onClose }: Props) {
  // Use Goer details instead of standard auth user
  const { goerId, username } = useGoer();
  const { t } = useAppTheme();

  const visible = eventId !== null;
  const [mounted, setMounted] = useState(visible);
  const [going, setGoing] = useState(false);
  const [event, setEvent] = useState<Happening | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dragStartY = useRef<number | null>(null);
  const dragOffset = useRef(0);

  useEffect(() => {
    if (visible && eventId) {
      setMounted(true);
      setGoing(false);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14 }).start();

      setLoading(true);
      happeningService
        .getById(eventId)
        .then((fetched) => {
          setEvent(fetched);
          if (fetched && goerId) {
            setGoing(fetched.rsvps?.includes(goerId) ?? false);
          }
        })
        .catch((err) => console.error("Error fetching detail:", err))
        .finally(() => setLoading(false));
    } else if (mounted) {
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true }).start(() => {
        setMounted(false);
        setEvent(null);
      });
    }
  }, [visible, eventId, goerId]);

  const handleClose = () => {
    Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 220, useNativeDriver: true }).start(() => {
      setMounted(false);
      setEvent(null);
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

  // SHARE WITH GOER'S USERNAME
  const handleShare = () => {
    if (!event) return;
    const shareMessage = `${username} invited you to ${event.title}! Location: ${event.locationName || "See app for details"}`;
    Share.share({ message: shareMessage }).catch(() => {});
  };

  const handleToggleRsvp = async () => {
    if (!event || !goerId) {
      Alert.alert("Authentication Required", "Please sign in to RSVP.");
      return;
    }
    const nextState = !going;
    setGoing(nextState);
    try {
      await happeningService.toggleRsvp(event.id, goerId, going);
      if (nextState) {
        circleFeedService.postToMyCircles({
          goerUid: goerId,
          username,
          type: "rsvp",
          happeningId: event.id,
          happeningTitle: event.title,
        });
      }
    } catch (err) {
      setGoing(going);
      Alert.alert("RSVP Error", "Failed to update RSVP status.");
    }
  };

  const handleOpenMap = () => {
    if (event?.google_maps_link) {
      Linking.openURL(event.google_maps_link).catch(() => {});
    }
  };

  // QR CHECK-IN WITH GOER ID
  const handleQrSuccess = async (scannedData: string) => {
    if (!event || !goerId) {
      throw new Error("You must be logged in to check in.");
    }

    const cleanData = scannedData.trim();
    const matchesEvent = cleanData === event.id;
    const matchesPartner = cleanData === `partner:${event.partner_id}` || cleanData === String(event.partner_id);

    if (matchesEvent || matchesPartner) {
      const result = await happeningService.checkInAndAwardGp(event.id, goerId);
      if (result === "already_checked_in") {
        Alert.alert("Already checked in", `You've already earned your Go-Points for ${event.title}.`);
        return;
      }
      circleFeedService.postToMyCircles({
        goerUid: goerId,
        username,
        type: "check_in",
        happeningId: event.id,
        happeningTitle: event.title,
      });
      Alert.alert(`+${CHECK_IN_GP} GP · Checked in!`, `Enjoy ${event.title}.`);
    } else {
      throw new Error("Invalid QR Code for this venue or happening.");
    }
  };

  if (!mounted) return null;

  const surface = t.bgSurface;
  const text = t.textPrimary;
  const muted = t.textSecondary;
  const border = t.borderSubtle;
  const placeholderBg = darkMode ? "#3a382c" : "#dcdcdc";

  const formattedDate = event?.dateTime?.toDate
    ? event.dateTime.toDate().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <>
      <Modal transparent visible={mounted} animationType="none" onRequestClose={handleClose}>
        <View style={{ flex: 1 }}>
          <Pressable
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(26,26,26,0.5)" }}
            onPress={handleClose}
          />

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
            <View
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              style={{ paddingTop: 10, paddingBottom: 6, alignItems: "center" }}
            >
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: border }} />
            </View>

            {loading || !event ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color={t.textBrand} />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
                <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
                  <View
                    style={{
                      height: 190,
                      borderRadius: 20,
                      backgroundColor: placeholderBg,
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {event.thumbnail_url ? (
                      <Image
                        source={{ uri: event.thumbnail_url }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <ImageIcon size={40} color={muted} />
                    )}
                  </View>
                </View>

                <View
                  style={{
                    paddingHorizontal: 24,
                    paddingTop: 18,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Text style={{ fontFamily: "Fredoka-SemiBold", fontSize: 22, color: text, flex: 1, marginRight: 12 }}>
                    {event.title}
                  </Text>
                  <Pressable
                    onPress={handleShare}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: border,
                      borderRadius: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Share2 size={14} color={text} />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: text }}>Share</Text>
                  </Pressable>
                </View>

                <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 8 }}>
                  {event.locationName && (
                    <Pressable onPress={handleOpenMap} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <MapPin size={14} color={t.textBrand} />
                      <Text style={{ fontSize: 13, color: t.textBrand, fontWeight: "600", textDecorationLine: event.google_maps_link ? "underline" : "none" }}>
                        {event.locationName}
                      </Text>
                    </Pressable>
                  )}
                  {formattedDate !== "" && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Clock size={14} color={muted} />
                      <Text style={{ fontSize: 13, color: muted }}>{formattedDate}</Text>
                    </View>
                  )}
                </View>

                <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
                  <Text style={{ fontSize: 14, color: text, lineHeight: 22 }}>{event.description}</Text>
                </View>

                <View style={{ paddingHorizontal: 24, paddingTop: 22, flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={handleToggleRsvp}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      backgroundColor: going ? t.actionSecondary : t.actionPrimary,
                      borderRadius: 14,
                      paddingVertical: 14,
                    }}
                  >
                    {going ? <Check size={16} color={t.onActionSecondary} /> : <ThumbsUp size={16} color={t.onActionPrimary} />}
                    <Text style={{ color: going ? t.onActionSecondary : t.onActionPrimary, fontSize: 14, fontWeight: "700" }}>{going ? "Going" : "RSVP Yes"}</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setQrModalVisible(true)}
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
            )}
          </Animated.View>
        </View>
      </Modal>

      <QRScannerModal
        visible={qrModalVisible}
        happeningTitle={event?.title}
        onClose={() => setQrModalVisible(false)}
        onSuccess={handleQrSuccess}
      />
    </>
  );
}