import type { Channel } from "@zlack/shared";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

function ChannelListItem({ channel }: { channel: Channel }) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>#</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.title}>#{channel.name}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {channel.name ?? "Channel description"}
        </Text>
      </View>
    </View>
  );
}

export default memo(ChannelListItem);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  avatarText: { fontWeight: "700", color: "#6B7280" },
  meta: { marginLeft: 12, flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 2 },
  subtitle: { fontSize: 13, color: "#6B7280" },
});
