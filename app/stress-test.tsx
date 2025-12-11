import { useSession } from "@/lib/auth";
import { generateId } from "@/lib/id";
import { storageProvider } from "@/lib/storage";
import { getRandomMessage } from "@/lib/stress-test-messages";
import { useQuery, useZero } from "@rocicorp/zero/react";
import { builder, queries, type Mutators, type Schema } from "@zslack/shared";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface StressTestMetrics {
  totalReads: number;
  totalWrites: number;
  successfulReads: number;
  successfulWrites: number;
  failedReads: number;
  failedWrites: number;
  duration: number;
  startTime: number | null;
  endTime: number | null;
  messageCount: number;
}

const TEST_DURATION = 5_000;

export default function StressTestScreen() {
  const nav = useNavigation();
  const authData = useSession();
  const z = useZero<Schema, Mutators>();

  const [storage] = useState(storageProvider());

  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<StressTestMetrics>({
    totalReads: 0,
    totalWrites: 0,
    successfulReads: 0,
    successfulWrites: 0,
    failedReads: 0,
    failedWrites: 0,
    duration: 0,
    startTime: null,
    endTime: null,
    messageCount: 0,
  });

  const [existingChannels] = useQuery(queries.allChannels(), { ttl: 5_000 });

  useEffect(() => {
    nav.setOptions({
      title: "Stress Test",
    });
  }, [nav]);

  const resetMetrics = () => {
    setMetrics({
      totalReads: 0,
      totalWrites: 0,
      successfulReads: 0,
      successfulWrites: 0,
      failedReads: 0,
      failedWrites: 0,
      duration: 0,
      startTime: null,
      endTime: null,
      messageCount: 0,
    });
  };

  const runStressTest = async () => {
    if (!authData.data) {
      Alert.alert("Login required", "Please log in to run the stress test.");
      return;
    }

    setIsRunning(true);
    resetMetrics();

    const startTime = Date.now();

    // Initialize metrics with start time
    setMetrics((prev) => ({
      ...prev,
      startTime,
    }));

    if (!existingChannels || existingChannels.length === 0) {
      Alert.alert(
        "No channels",
        "No channels found. Please create some channels first."
      );
      setIsRunning(false);
      return;
    }

    const channelIds = existingChannels.map((c) => c.id);
    const messageIds = existingChannels.flatMap((c) =>
      c.messages.map((m) => m.id)
    );

    let totalWrites = 0;
    let totalReads = 0;
    let successfulWrites = 0;
    let successfulReads = 0;
    let failedWrites = 0;
    let failedReads = 0;

    const runWrites = async () => {
      const writes: Promise<void>[] = [];

      for (let i = 0; i < 5; i++) {
        writes.push(
          (async () => {
            while (Date.now() - startTime < TEST_DURATION) {
              const randomChannelId =
                channelIds[Math.floor(Math.random() * channelIds.length)];

              try {
                const messageId = generateId();

                await z.mutate.message.sendMessage({
                  id: messageId,
                  channelId: randomChannelId,
                  body: getRandomMessage(),
                  createdAt: Date.now(),
                }).client;

                messageIds.push(messageId);

                successfulWrites++;
              } catch (error) {
                console.error("error sending message", error);
                failedWrites++;
              } finally {
                totalWrites++;
              }
            }
          })()
        );
      }

      await Promise.all(writes);
    };

    const runReads = async () => {
      const reads: Promise<void>[] = [];

      for (let i = 0; i < 5; i++) {
        reads.push(
          (async () => {
            while (Date.now() - startTime < TEST_DURATION) {
              try {
                const randomMessageId =
                  messageIds[Math.floor(Math.random() * messageIds.length)];

                // run local-only query
                const result = await z.run(
                  builder.messages
                    .where("id", "=", randomMessageId)
                    .related("channel")
                    .related("sender")
                    .one(),
                  {
                    type: "unknown",
                    ttl: "none",
                  }
                );

                if (result?.id !== randomMessageId) {
                  throw new Error("Message ID mismatch");
                }

                successfulReads++;
              } catch (error) {
                console.error("error reading channel", error);
                failedReads++;
              } finally {
                totalReads++;
              }
            }
          })()
        );
      }

      await Promise.all(reads);
    };

    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      // Run reads and writes in parallel without blocking each other
      await Promise.all([runWrites(), runReads()]);
    } catch (error) {
      console.error("Stress test error:", error);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    setMetrics((prev) => ({
      ...prev,
      duration,
      endTime,
      messageCount: messageIds.length,
      totalReads,
      totalWrites,
      successfulReads,
      successfulWrites,
      failedReads,
      failedWrites,
    }));
    setIsRunning(false);
  };

  const totalOps = metrics.totalReads + metrics.totalWrites;
  const opsPerSecond =
    metrics.duration > 0
      ? (totalOps / (metrics.duration / 1000)).toFixed(2)
      : 0;
  const readSuccessRate =
    metrics.totalReads > 0
      ? ((metrics.successfulReads / metrics.totalReads) * 100).toFixed(1)
      : 0;
  const writeSuccessRate =
    metrics.totalWrites > 0
      ? ((metrics.successfulWrites / metrics.totalWrites) * 100).toFixed(1)
      : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>
          This stress test will perform rapid reads and writes against Zero for{" "}
          {Math.floor(TEST_DURATION / 1000)} seconds to measure throughput and
          performance.
        </Text>

        <View style={styles.buttonContainer}>
          {!isRunning ? (
            <Pressable
              style={styles.stressTestButton}
              onPress={runStressTest}
              disabled={!authData.data}
            >
              <Text style={styles.stressTestButtonText}>Start Stress Test</Text>
            </Pressable>
          ) : (
            <></>
          )}
        </View>

        {!authData.data && (
          <Text style={styles.warning}>
            You must be logged in to run the stress test.
          </Text>
        )}

        {isRunning && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>🔥 Test running...</Text>
          </View>
        )}

        {totalOps > 0 && (
          <View style={styles.metricsContainer}>
            <Text style={styles.metricsTitle}>Performance Metrics</Text>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Duration:</Text>
              <Text style={styles.metricValue}>
                {(metrics.duration / 1000).toFixed(2)}s
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Row Count:</Text>
              <Text style={styles.metricValue}>{metrics.messageCount}</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total Operations:</Text>
              <Text style={styles.metricValue}>{totalOps}</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Operations/sec:</Text>
              <Text style={styles.metricValueHighlight}>{opsPerSecond}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Read Operations:</Text>
              <Text style={styles.metricValue}>{metrics.totalReads}</Text>
            </View>

            <View style={styles.metricSubRow}>
              <Text style={styles.metricSubLabel}>Successful:</Text>
              <Text style={styles.metricSuccess}>
                {metrics.successfulReads}
              </Text>
            </View>

            <View style={styles.metricSubRow}>
              <Text style={styles.metricSubLabel}>Failed:</Text>
              <Text style={styles.metricError}>{metrics.failedReads}</Text>
            </View>

            <View style={styles.metricSubRow}>
              <Text style={styles.metricSubLabel}>Success Rate:</Text>
              <Text style={styles.metricValue}>{readSuccessRate}%</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Write Operations:</Text>
              <Text style={styles.metricValue}>{metrics.totalWrites}</Text>
            </View>

            <View style={styles.metricSubRow}>
              <Text style={styles.metricSubLabel}>Successful:</Text>
              <Text style={styles.metricSuccess}>
                {metrics.successfulWrites}
              </Text>
            </View>

            <View style={styles.metricSubRow}>
              <Text style={styles.metricSubLabel}>Failed:</Text>
              <Text style={styles.metricError}>{metrics.failedWrites}</Text>
            </View>

            <View style={styles.metricSubRow}>
              <Text style={styles.metricSubLabel}>Success Rate:</Text>
              <Text style={styles.metricValue}>{writeSuccessRate}%</Text>
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What this test does:</Text>
          <Text style={styles.infoText}>
            • Creates messages in random channels
          </Text>
          <Text style={styles.infoText}>
            • Queries a random message with sender and channel
          </Text>
          <Text style={styles.infoText}>
            • Measures throughput and success rates
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  stressTestButton: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  stressTestButtonSecondary: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  stressTestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  warning: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  statusContainer: {
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
  },
  metricsContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingLeft: 16,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  metricSubLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  metricValueHighlight: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0EA5E9",
  },
  metricSuccess: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  metricError: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#1E40AF",
    marginBottom: 4,
  },
});
