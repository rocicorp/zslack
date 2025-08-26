import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function MessageInput({
  placeholder,
  onSend,
}: {
  placeholder?: string;
  onSend?: (text: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");

  return (
    <View style={styles.wrap}>
      <TextInput
        placeholder={placeholder ?? "Message"}
        value={value}
        onChangeText={setValue}
        style={styles.input}
        multiline
        accessibilityLabel="Message input"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send message"
        onPress={async () => {
          await onSend?.(value.trim());
          setValue("");
        }}
        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, padding: 6 }]}
      >
        <Ionicons name="send" size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 6,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 140,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    marginRight: 8,
    fontSize: 15,
  },
});
