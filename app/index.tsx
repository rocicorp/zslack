import { signOut, useSession } from "@/lib/auth";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@zslack/shared";
import { Link, useNavigation, type Href } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import AuthModal, { type AuthModalRef } from "../components/AuthModal";
import ChannelListItem from "../components/ChannelListItem";

export default function ChannelsScreen() {
  const nav = useNavigation();
  const authModalRef = useRef<AuthModalRef>(null);

  const authData = useSession();
  const [channels] = useQuery(queries.allChannels());

  useEffect(() => {
    nav.setOptions({
      headerLeft: () =>
        authData.data ? (
          <Pressable
            onPress={() => signOut()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Text style={styles.headerLogoutText}>Logout</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => authModalRef.current?.open()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Log in"
          >
            <Text style={styles.headerLoginText}>Login</Text>
          </Pressable>
        ),
    });
  }, [nav, authData.data]);

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) =>
          authData.data ? (
            <Link href={`/channel/${item.id}` as Href} asChild>
              <Pressable>
                <ChannelListItem channel={item} />
              </Pressable>
            </Link>
          ) : (
            <Pressable
              onPress={() =>
                Alert.alert(
                  "Login required",
                  "Please log in to view this channel.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Log in",
                      onPress: () => authModalRef.current?.open(),
                    },
                  ],
                )
              }
              style={({ pressed }) => [{ opacity: pressed ? 0.4 : 0.5 }]}
              accessibilityRole="button"
              accessibilityLabel="Channel (login required)"
            >
              <ChannelListItem channel={item} />
            </Pressable>
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <AuthModal ref={authModalRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  listContent: { paddingVertical: 8 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 64,
  },
  headerRightButton: { paddingLeft: 8 },
  headerLogoutText: { color: "#EF4444", fontWeight: "600" },
  headerLoginText: { color: "#0EA5E9", fontWeight: "700" },
});
