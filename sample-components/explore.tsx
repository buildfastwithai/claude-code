import { useTheme } from "@/hooks/useTheme";
import { lightTheme } from "@/lib/theme";
import { ApiError, fetchTopics, Topic } from "@/utils/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import clickSound from "../../../../assets/audios/click.wav";
import Svg, { Circle } from "react-native-svg";

// Circular Progress Component
const CircularProgress = ({ progress = 0, size = 32, strokeWidth = 3 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const clamped = Math.max(0, Math.min(100, progress));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg width={size} height={size}>
        {/* Background */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Text */}
      <Text
        style={{
          position: "absolute",
          fontSize: size * 0.25,
          color: "white",
          fontFamily: lightTheme.typography.fontFamily.bold,
        }}
      >
        {Math.round(clamped)}%
      </Text>
    </View>
  );
};

export default function LearnScreen() {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clickSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadClickSound = async () => {
      const { sound } = await Audio.Sound.createAsync(clickSound);
      if (mounted) clickSoundRef.current = sound;
    };

    loadClickSound();

    return () => {
      mounted = false;
      clickSoundRef.current?.unloadAsync();
    };
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTopics = await fetchTopics();
      setTopics(fetchedTopics);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Failed to load topics. Please try again.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage, [
        { text: "Retry", onPress: loadTopics },
        { text: "OK", style: "cancel" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicPress = async (topicId: number) => {
    const snd = clickSoundRef.current;
    if (snd) await snd.replayAsync();
    router.push(`/(protected)/concepts/${topicId}`);
  };

  const getCardSize = (index: number) => {
    // Every 3rd card is full width, others are half width
    return (index + 1) % 3 === 0 ? "full" : "half";
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                isSmallDevice && styles.titleSmall,
                { color: theme.colors.text.primary },
              ]}
            >
              Explore Topics
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.text.secondary }]}
            >
              Discover new learning paths
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                Loading topics...
              </Text>
            </View>
          ) : error && topics.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.borderDark,
                  },
                ]}
                onPress={loadTopics}
              >
                <Text
                  style={[
                    styles.retryButtonText,
                    { color: theme.colors.text.inverse },
                  ]}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : topics.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                No topics available
              </Text>
            </View>
          ) : (
            <View style={styles.topicsBentoGrid}>
              {topics.map((topic, index) => {
                const cardSize = getCardSize(index);
                const isFullWidth = cardSize === "full";
                const cardWidth = isFullWidth
                  ? width - lightTheme.spacing.lg * 2
                  : (width -
                      lightTheme.spacing.lg * 2 -
                      lightTheme.spacing.sm) /
                    2;

                return (
                  <Pressable
                    key={topic.id}
                    style={[
                      styles.topicBentoCard,
                      {
                        width: cardWidth,
                        backgroundColor: theme.colors.cardBackground,
                      },
                    ]}
                    onPress={() => handleTopicPress(topic.id)}
                    android_ripple={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    <ImageBackground
                      source={{
                        uri:
                          topic.cover_image ||
                          "https://via.placeholder.com/400x200/8157F9/FFFFFF?text=No+Image",
                      }}
                      style={[
                        styles.topicImageBackground,
                        { minHeight: isFullWidth ? 160 : 140 },
                      ]}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(0,0,0,0.1)",
                          "rgba(0,0,0,0.2)",
                          "rgba(0,0,0,0.4)",
                        ]}
                        style={styles.topicGradientOverlay}
                      >
                        <View
                          style={[
                            styles.topicBentoContent,
                            // isFullWidth && styles.topicBentoContentFull,
                          ]}
                        >
                          <View
                            style={[
                              styles.topicBentoProgress,
                              isFullWidth && styles.topicBentoProgressFull,
                            ]}
                          >
                            <CircularProgress progress={topic.completion_percentage || 0} size={40} />
                          </View>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                    <View
                      style={[
                        styles.topicBentoInfo,
                        isFullWidth && styles.topicBentoInfoFull,
                      ]}
                    >
                      <Text
                        style={[
                          styles.topicBentoTitle,
                          isFullWidth && styles.topicBentoTitleFull,
                          { color: theme.colors.text.primary },
                        ]}
                        numberOfLines={2}
                      >
                        {topic.title}
                      </Text>
                      <Text
                        style={[
                          styles.topicBentoMeta,
                          isFullWidth && styles.topicBentoMetaFull,
                          { color: theme.colors.text.tertiary },
                        ]}
                      >
                        {topic._count?.concepts || topic.total_concepts || 0}{" "}
                        concepts
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.sm,
    paddingBottom: lightTheme.spacing.sm,
  },
  header: {
    marginBottom: lightTheme.spacing.xl,
  },
  title: {
    fontSize: lightTheme.typography.fontSize["3xl"],
    fontFamily: lightTheme.typography.fontFamily.bold,
    marginBottom: -lightTheme.spacing.xs,
  },
  titleSmall: {
    fontSize: lightTheme.typography.fontSize["2xl"],
  },
  subtitle: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.regular,
  },
  topicsBentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: lightTheme.spacing.sm,
  },
  topicBentoCard: {
    borderRadius: lightTheme.borderRadius.xl,
    overflow: "hidden",
    padding: lightTheme.spacing.xs,
    marginBottom: lightTheme.spacing.sm,
  },
  topicImageBackground: {
    borderRadius: lightTheme.borderRadius.xl * 0.9,
    overflow: "hidden",
    flex: 1,
    justifyContent: "flex-end",
  },
  topicGradientOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  topicBentoContent: {
    padding: lightTheme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  // topicBentoContentFull: {
  //   paddingHorizontal: lightTheme.spacing.xl,
  // },
  topicBentoInfo: {
    flex: 1,
    padding: lightTheme.spacing.sm,
  },
  topicBentoInfoFull: {
    alignItems: "flex-start",
  },
  topicBentoTitle: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.bold,
    textAlign: "left",
    lineHeight: 20,
    marginBottom: lightTheme.spacing.xs / 2,
  },
  topicBentoTitleFull: {
    fontSize: lightTheme.typography.fontSize.lg,
    lineHeight: 24,
  },
  topicBentoMeta: {
    marginTop: -lightTheme.spacing.xs,
    fontSize: lightTheme.typography.fontSize.sm,
    fontFamily: lightTheme.typography.fontFamily.medium,
    opacity: 0.9,
    textAlign: "left",
  },
  topicBentoMetaFull: {
    textAlign: "left",
  },
  topicBentoProgress: {
    alignItems: "center",
    justifyContent: "center",
  },
  topicBentoProgressFull: {
    alignItems: "flex-end",
  },
  loadingContainer: {
    padding: lightTheme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  loadingText: {
    marginTop: lightTheme.spacing.md,
    fontSize: lightTheme.typography.fontSize.sm,
    fontFamily: lightTheme.typography.fontFamily.medium,
    // color applied dynamically inline
  },
  errorContainer: {
    padding: lightTheme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  errorText: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.medium,
    // color applied dynamically inline
    textAlign: "center",
    marginBottom: lightTheme.spacing.md,
  },
  retryButton: {
    // backgroundColor applied dynamically inline
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    borderWidth: 2,
    // borderColor applied dynamically inline
  },
  retryButtonText: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.bold,
    // color applied dynamically inline
  },
  emptyContainer: {
    padding: lightTheme.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  emptyText: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.medium,
    // color applied dynamically inline
  },
});
