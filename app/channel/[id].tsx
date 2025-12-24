import { generateId } from "@/lib/id";
import { useQuery, useZero } from "@rocicorp/zero/react";
import { mutators, queries } from "@zslack/shared";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthModal, { type AuthModalRef } from "../../components/AuthModal";
import MessageInput from "../../components/MessageInput";
import MessageItem from "../../components/MessageItem";

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const zero = useZero();

  return !zero.context ? <></> : <ChannelScreenList id={id} />;
}

function ChannelScreenList({ id }: { id: string }) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();

  const zero = useZero();

  const authModalRef = useRef<AuthModalRef>(null);

  const [channel] = useQuery(queries.channelWithMessages(id));

  useEffect(() => {
    // Show channel title in header
    nav.setOptions({ title: channel ? `# ${channel.name}` : "Channel" });
  }, [nav, channel]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
      keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
    >
      <FlatList
        data={channel?.messages.slice() ?? []}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MessageItem message={item} sender={item.sender ?? null} />
        )}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        inverted
        initialNumToRender={20}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 100,
        }}
        keyboardShouldPersistTaps="handled"
      />
      <View
        style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      >
        <MessageInput
          placeholder={`Message #${channel?.name ?? ""}`}
          onSend={async (text) => {
            if (!channel) {
              throw new Error("Channel not found");
            }

            await zero.mutate(
              mutators.message.sendMessage({
                id: generateId(),
                channelId: channel.id,
                body: text,
                createdAt: Date.now(),
              }),
            ).client;
          }}
        />
      </View>
      <AuthModal ref={authModalRef} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  list: { flex: 1 },
  listContent: {
    // Inverted lists flip paddings visually; use paddingTop for bottom spacing
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
});
