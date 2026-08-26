import { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X } from "lucide-react-native";

interface Props {
  visible: boolean;
  happeningTitle?: string;
  onClose: () => void;
  onSuccess: (scannedData: string) => Promise<void>;
}

export default function QRScannerModal({ visible, happeningTitle, onClose, onSuccess }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  // 1. Permission Check
  if (!permission) {
    return null; // Camera permissions still loading
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionSub}>
            We need your permission to use the camera to scan event QR codes for check-in.
          </Text>
          <Pressable style={styles.grantBtn} onPress={requestPermission}>
            <Text style={styles.grantBtnText}>Grant Permission</Text>
          </Pressable>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  // 2. Barcode Scanned Handler
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      await onSuccess(data);
      onClose();
    } catch (err: any) {
      Alert.alert("Check-in Failed", err.message || "Invalid QR code or error checking in.", [
        { text: "Try Again", onPress: () => setScanned(false) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        {/* Viewfinder Overlay */}
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.iconButton}>
              <X color="#FAF8F0" size={24} />
            </Pressable>
            <Text style={styles.headerTitle}>Check-in QR Scanner</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.instruction}>
            Align the QR code within the frame to check in to {happeningTitle || "this event"}
          </Text>

          {/* Square Target Frame */}
          <View style={styles.targetSquare} />

          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#A88AED" />
              <Text style={{ color: "#FAF8F0", marginTop: 8, fontWeight: "600" }}>
                Checking in...
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#FAF8F0", fontSize: 18, fontWeight: "700" },
  iconButton: { padding: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)" },
  instruction: { color: "rgba(250,248,240,0.8)", fontSize: 14, textAlign: "center" },
  targetSquare: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: "#A88AED",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  loadingBox: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
    backgroundColor: "rgba(36,34,27,0.9)",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#24221B",
  },
  permissionTitle: { fontSize: 20, fontWeight: "700", color: "#FAF8F0", marginBottom: 12 },
  permissionSub: { fontSize: 14, color: "#605E55", textAlign: "center", marginBottom: 24 },
  grantBtn: { backgroundColor: "#A88AED", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
  grantBtnText: { color: "#FAF8F0", fontWeight: "700", fontSize: 16 },
  closeBtn: { marginTop: 16 },
  closeBtnText: { color: "#605E55", fontSize: 14 },
});