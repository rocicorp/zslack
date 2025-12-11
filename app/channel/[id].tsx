import { useSession } from "@/lib/auth";
import { generateId } from "@/lib/id";
import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries, type Mutators, type Schema } from "@zslack/shared";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Alert,
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

  const authData = useSession();

  return authData.isPending ? <></> : <ChannelScreenList id={id} />;
}

function ChannelScreenList({ id }: { id: string }) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();

  const z = useZero<Schema, Mutators>();

  const authData = useSession();
  const authModalRef = useRef<AuthModalRef>(null);

  const [channel] = useQuery(queries.channelWithMessages(authData.data, id));

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
        style={[
          styles.inputBar,
          { paddingBottom: Math.max(insets.bottom, 8) },
          !authData.data && { opacity: 0.5 },
        ]}
      >
        <MessageInput
          placeholder={`Message #${channel?.name ?? ""}`}
          onSend={async (text) => {
            if (!authData.data) {
              Alert.alert("Login required", "Please log in to send messages.", [
                { text: "Cancel", style: "cancel" },
                { text: "Log in", onPress: () => authModalRef.current?.open() },
              ]);
              return;
            }

            if (!channel) {
              throw new Error("Channel not found");
            }

            await z.mutate.message.sendMessage({
              id: generateId(),
              channelId: channel.id,
              body: text,
              createdAt: Date.now(),
            }).client;
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
