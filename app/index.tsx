import { Schema } from "@/schema";
import { useQuery, useZero } from "@rocicorp/zero/react";
import { Button, Text, View } from "react-native";

export default function Index() {
  const zero = useZero<Schema>();
  const [messages] = useQuery(zero.query.message);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
      }}
    >
      <View style={{ flex: 1, alignItems: "center" }}>
        {messages.map((message) => (
          <Text key={message.id}>{message.body}</Text>
        ))}
      </View>
      <Button
        title="Add User"
        onPress={() => {
          zero.mutate.message.upsert({
            id: id(),
            senderID: "9ogaDuDNFx",
            body: `Hello, world ${id()}!`,
            labels: [],
            timestamp: new Date().getTime(),
            mediumID: "b7rqt_8w_H",
          });
        }}
      />
    </View>
  );
}

const id = () => Math.random().toString(36).substring(2, 15);
