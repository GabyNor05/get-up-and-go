import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Timestamp, GeoPoint } from "firebase/firestore";
import { happeningService } from "@get-up-and-go/firebase/src/services/happeningService";
import { HappeningCategory } from "@get-up-and-go/firebase/src/types/happening";

export default function DevHappeningScreen() {
  const [partnerId, setPartnerId] = useState("101");
  const [title, setTitle] = useState("Tech Meetup & Drinks");
  const [description, setDescription] = useState("Networking, tech talks, and free beverages.");
  const [locationName, setLocationName] = useState("Innovation Hub Mainstage");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://images.unsplash.com/photo-1511578314322-379afb476865");
  const [category, setCategory] = useState<HappeningCategory>("COMMUNITY" as HappeningCategory);

  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form submit handler
  const handleCreateHappening = async () => {
    if (!title || !partnerId) {
      Alert.alert("Error", "Please fill in at least Title and Partner ID.");
      return;
    }

    setLoading(true);
    try {
      const parsedPartnerId = parseInt(partnerId, 10);

      const newId = await happeningService.createHappening({
        partner_id: isNaN(parsedPartnerId) ? 101 : parsedPartnerId,
        title,
        description,
        locationName,
        thumbnail_url: thumbnailUrl,
        google_maps_link: "https://maps.google.com",
        dateTime: Timestamp.now(),
        coordinates: new GeoPoint(-33.9249, 18.4241), // Default coords
        rsvps: [],
        attendees: [],
        category,
      });

      setCreatedEventId(newId);
      Alert.alert("Success!", `Created Happening ID: ${newId}`);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to create happening.");
    } finally {
      setLoading(false);
    }
  };

  // Content encoded inside the QR Code (Matching the drawer scanner format)
  const qrPayload = `partner:${partnerId}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>⚡ Dev Tools: Create Happening</Text>
      
      {/* Dynamic QR Code Display */}
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Partner Scan QR Code</Text>
        <Text style={styles.qrSubtitle}>Payload: {qrPayload}</Text>
        
        <View style={styles.qrWrapper}>
          <QRCode value={qrPayload} size={180} />
        </View>

        {createdEventId && (
          <View style={styles.successBadge}>
            <Text style={styles.successText}>Last Created ID: {createdEventId}</Text>
          </View>
        )}
      </View>

      {/* Happening Form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Partner ID (Number)</Text>
        <TextInput
          style={styles.input}
          value={partnerId}
          onChangeText={setPartnerId}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Location Name</Text>
        <TextInput
          style={styles.input}
          value={locationName}
          onChangeText={setLocationName}
        />

        <Text style={styles.label}>Thumbnail Image URL</Text>
        <TextInput
          style={styles.input}
          value={thumbnailUrl}
          onChangeText={setThumbnailUrl}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 70 }]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Pressable
          onPress={handleCreateHappening}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && { opacity: 0.8 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FAF8F0" />
          ) : (
            <Text style={styles.submitBtnText}>Create & Save to Firestore</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#24221B",
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FAF8F0",
    marginBottom: 16,
    marginTop: 20,
  },
  qrCard: {
    backgroundColor: "#3a382c",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  qrTitle: {
    color: "#FAF8F0",
    fontSize: 16,
    fontWeight: "700",
  },
  qrSubtitle: {
    color: "#A88AED",
    fontSize: 12,
    marginVertical: 4,
    fontWeight: "600",
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 12,
  },
  successBadge: {
    marginTop: 12,
    backgroundColor: "rgba(166,194,97,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  successText: {
    color: "#A6C261",
    fontSize: 12,
    fontWeight: "600",
  },
  formGroup: {
    gap: 10,
  },
  label: {
    color: "#FAF8F0",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(250,248,240,0.08)",
    borderRadius: 10,
    padding: 12,
    color: "#FAF8F0",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(250,248,240,0.12)",
  },
  submitBtn: {
    backgroundColor: "#A88AED",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: {
    color: "#FAF8F0",
    fontWeight: "700",
    fontSize: 15,
  },
});