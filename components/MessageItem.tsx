import type { Message, User } from "@zlack/shared";
import { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { formatTime } from "../lib/time";

function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MessageItem({
  message,
  sender,
}: {
  message: Message;
  sender: User | null;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.avatarWrap}>
        {sender?.image ? (
          <Image source={{ uri: sender.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitials}>
              {initials(sender?.name ?? sender?.email ?? "")}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.bubbleArea}>
        <View style={styles.header}>
          <Text style={styles.user}>{sender?.name ?? sender?.email ?? ""}</Text>
          <Text style={styles.time}>{formatTime(message.createdAt ?? 0)}</Text>
        </View>
        <Text style={styles.text}>{message.body}</Text>
      </View>
    </View>
  );
}

export default memo(MessageItem);

const styles = StyleSheet.create({
  row: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8 },
  avatarWrap: { paddingTop: 2 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  avatarInitials: { fontWeight: "700", color: "#4B5563" },
  bubbleArea: { flex: 1, marginLeft: 10 },
  header: { flexDirection: "row", alignItems: "baseline" },
  user: { fontWeight: "700", color: "#111827", marginRight: 6 },
  time: { color: "#6B7280", fontSize: 12 },
  text: { color: "#111827", fontSize: 15, marginTop: 2, lineHeight: 20 },
});
