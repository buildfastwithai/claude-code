import { useTheme } from "@/hooks/useTheme";
import { lightTheme } from "@/lib/theme";
import StreakCalendarModal from "@/components/streak-calendar-modal";
import { Audio } from "expo-av";
import clickSound from "../../../../assets/audios/click.wav";
import {
  ApiError,
  fetchTopics,
  Topic,
  fetchUserStats,
  getUserInterests,
  UserInterest,
} from "@/utils/api";
import { useUser, useAuth } from "@clerk/clerk-expo";
import Play from "../../../../assets/icons/play.svg";
import Clock from "../../../../assets/icons/clock.svg";
import ArrowRight from "../../../../assets/icons/arrow-right.svg";
import Flame from "../../../../assets/icons/flame.svg";
import Bookmark from "../../../../assets/icons/archive.svg";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useStreakStore } from "@/store/streak-store";
import { useUserStats } from "@/hooks/useStreakQueries";
import {
  useContinueLearning,
  useRefreshContinueLearning,
} from "@/hooks/useContinueLearningQueries";
import Svg, { Circle } from "react-native-svg";
import { eventEmitter } from "@/utils/eventEmitter";

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

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id ?? null;
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const clickSoundRef = useRef<Audio.Sound | null>(null);

  const { stats } = useStreakStore();

  // Use React Query hook to fetch user stats - this will auto-refetch when invalidated
  // The select function automatically updates the Zustand store, which will update the UI
  const { data: userStatsData, refetch: refetchUserStats } = useUserStats();

  // Use the latest data from React Query if available, otherwise fall back to Zustand store
  const currentStreak =
    userStatsData?.current_streak ?? stats?.current_streak ?? 0;

  // Fetch continue learning data with auto-refresh
  const { data: continueLearningData, isLoading: continueLearningLoading } =
    useContinueLearning();
  const { refresh: refreshContinueLearning } = useRefreshContinueLearning();

  // Refresh both continue learning and streak data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshContinueLearning();
      // Also refetch user stats to ensure streak is up to date
      refetchUserStats();
    }, [refetchUserStats])
  );

  // listen for concept completion events
  useEffect(() => {
    const handleConceptCompleted = () => {
      console.log("Concept completed - refreshing home data");
      loadTopics();
      loadUserInterests();
      refreshContinueLearning();
    };

    eventEmitter.on("conceptCompleted", handleConceptCompleted);

    return () => {
      eventEmitter.off("conceptCompleted", handleConceptCompleted);
    };
  }, []);

  const getInitials = () => {
    if (!user) return "??";

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    } else if (user.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.substring(0, 2).toUpperCase();
    }

    return "??";
  };

  useEffect(() => {
    loadTopics();
    loadUserInterests();
  }, []);

  const loadUserInterests = async () => {
    try {
      setInterestsLoading(true);
      const token = await getToken();
      if (!token) {
        console.log("No token available for fetching interests");
        setInterestsLoading(false);
        return;
      }

      const interests = await getUserInterests(token);
      setUserInterests(interests);
    } catch (err) {
      console.error("Error loading user interests:", err);
      // Don't show error alert for interests, just log it
    } finally {
      setInterestsLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const fetchedTopics = await fetchTopics(token ?? undefined);
      console.log("Fetched topics:", fetchedTopics);
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

  useEffect(() => {
    let isMounted = true;

    const loadClick = async () => {
      const { sound } = await Audio.Sound.createAsync(clickSound);
      if (isMounted) clickSoundRef.current = sound;
    };

    loadClick();

    return () => {
      isMounted = false;
      clickSoundRef.current?.unloadAsync();
    };
  }, []);

  const handleTopicPress = async (topicId: number) => {
    const sound = clickSoundRef.current;
    if (sound) {
      await sound.replayAsync();
    }
    router.push(`/(protected)/concepts/${topicId}`);
  };

  const getCardSize = (index: number) => {
    // Every 3rd card is full width, others are half width
    return (index + 1) % 3 === 0 ? "full" : "half";
  };

  const handleProfilePress = () => {
    router.push("/(protected)/profile");
  };

  const renderCuratedForYou = () => {
    if (interestsLoading) {
      return (
        <View style={styles.curatedSection}>
          <View style={styles.sectionHeaderContainer}>
            <Text
              style={[
                styles.sectionHeader,
                { color: theme.colors.text.primary },
              ]}
            >
              Curated for you
            </Text>
          </View>
          <View style={styles.curatedLoadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        </View>
      );
    }

    if (userInterests.length === 0) {
      return null;
    }

    return (
      <View style={styles.curatedSection}>
        <View style={styles.sectionHeaderContainer}>
          <Text
            style={[styles.sectionHeader, { color: theme.colors.text.primary }]}
          >
            Curated for you
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.curatedScrollContent}
        >
          {userInterests.map((interest, index) => {
            return (
              <Pressable
                key={interest.id}
                style={[
                  styles.curatedBentoCard,
                  { width: 260, minHeight: 160 },
                ]}
                onPress={() => handleTopicPress(interest.topics.id)}
                android_ripple={{ color: "rgba(255,255,255,0.3)" }}
              >
                <ImageBackground
                  source={{
                    uri:
                      interest.topics.cover_image ||
                      "https://via.placeholder.com/400x200/8157F9/FFFFFF?text=No+Image",
                  }}
                  style={styles.topicImageBackground}
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]}
                    style={styles.topicGradientOverlay}
                  >
                    <View style={styles.curatedBentoContent}>
                      <View style={styles.curatedBentoInfo}>
                        <Text
                          style={styles.curatedBentoTitle}
                          numberOfLines={2}
                        >
                          {interest.topics.title}
                        </Text>
                        {/* <Text style={styles.curatedBentoProgressText}>
                          Progress
                        </Text> */}
                      </View>
                      <View style={styles.curatedBentoProgress}>
                        <CircularProgress
                          progress={interest.topics.completion_percentage || 0}
                          size={42}
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderUnrotYourself = () => {
    if (loading) {
      return null;
    }

    // Get topic IDs that are already in user interests
    const userInterestTopicIds = new Set(
      userInterests.map((interest) => interest.topics.id)
    );

    // Filter topics to exclude those in user interests
    const filteredTopics = topics.filter(
      (topic) => !userInterestTopicIds.has(topic.id)
    );

    // Get 4-6 topics that are not in curated section
    const displayTopics = filteredTopics.slice(0, 6);

    if (displayTopics.length === 0) return null;

    return (
      <View style={styles.unrotSection}>
        <View style={styles.sectionHeaderContainer}>
          <Text
            style={[styles.sectionHeader, { color: theme.colors.text.primary }]}
          >
            Unrot yourself
          </Text>
          <Pressable
            onPress={() => router.push("/(protected)/(tabs)/explore" as any)}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.unrotGrid}>
          {displayTopics.map((topic, index) => {
            return (
              <Pressable
                style={[
                  styles.unrotBentoCardContainer,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
                key={topic.id}
                onPress={() => handleTopicPress(topic.id)}
                android_ripple={{ color: "rgba(255,255,255,0.3)" }}
              >
                <View style={[styles.unrotBentoCard, { minHeight: 140 }]}>
                  <ImageBackground
                    source={{
                      uri:
                        topic.cover_image ||
                        "https://via.placeholder.com/400x200/8157F9/FFFFFF?text=No+Image",
                    }}
                    style={styles.topicImageBackground}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(0,0,0,0.1)",
                        "rgba(0,0,0,0.2)",
                        "rgba(0,0,0,0.4)",
                      ]}
                      style={styles.topicGradientOverlay}
                    >
                      <View style={styles.unrotBentoContent}>
                        <View style={styles.unrotBentoProgress}>
                          <CircularProgress
                            progress={topic.completion_percentage || 0}
                            size={40}
                          />
                        </View>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </View>
                <View style={styles.unrotBentoInfo}>
                  <Text
                    style={[
                      styles.unrotBentoTitle,
                      { color: theme.colors.text.primary },
                    ]}
                    numberOfLines={2}
                  >
                    {topic.title}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderContinueLearning = () => {
    // If no data or loading, show a placeholder
    if (continueLearningLoading) {
      return (
        <View style={styles.continueSection}>
          <View style={styles.continueSectionHeader}>
            <Text
              style={[
                styles.continueSectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              Pick Where You Left Off 🚀
            </Text>
          </View>
          <View
            style={[
              styles.continueLoadingCard,
              {
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
              },
            ]}
          >
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text
              style={[
                styles.continueLoadingText,
                { color: theme.colors.text.primary },
              ]}
            >
              Loading...
            </Text>
          </View>
        </View>
      );
    }

    if (!continueLearningData) {
      return (
        <View style={styles.continueSection}>
          {/* <View style={styles.continueSectionHeader}>
            <Text
              style={[
                styles.continueSectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              Start Your Learning Journey 🚀
            </Text>
            <Pressable
              onPress={() => router.push("/(protected)/(tabs)/explore" as any)}
            >
              <Text style={styles.viewAllText}>Browse Topics</Text>
            </Pressable>
          </View> */}
          <Pressable
            style={[
              styles.continueCard,
              {
                backgroundColor: theme.colors.cardBackground,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            onPress={() => router.push("/(protected)/(tabs)/explore" as any)}
            android_ripple={{ color: "rgba(0,0,0,0.05)" }}
          >
            <View style={styles.continueCardLeft}>
              <Text
                style={[
                  styles.continueTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                No recent activity. Start learning now!
              </Text>
              <Text
                style={[
                  styles.continueMetaText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                Choose a topic to begin your journey
              </Text>
            </View>
            <View style={styles.continueCardRight}>
              <View style={styles.playButton}>
                <Play height={24} width={24} color={lightTheme.colors.white} />
              </View>
            </View>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.continueSection}>
        <Pressable
          style={[
            styles.continueCard,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.cardBorder,
            },
          ]}
          onPress={() => {
            router.push(
              `/(protected)/concept/${continueLearningData.concept_id}` as any
            );
          }}
          android_ripple={{ color: "rgba(0,0,0,0.05)" }}
        >
          <View style={styles.continueCardLeft}>
            {/* <View style={styles.continueProgress}>
              <View
                style={[
                  styles.continueProgressBar,
                  { backgroundColor: theme.colors.gray[200] },
                ]}
              >
                <View
                  style={[
                    styles.continueProgressFill,
                    { width: `${continueLearningData.progress_percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.continueProgressText}>
                {continueLearningData.progress_percentage}% complete
              </Text>
            </View> */}
            <Text
              style={[
                styles.continueSectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              Pick Where You Left Off
            </Text>
            <Text
              style={[
                styles.continueTitle,
                { color: theme.colors.text.tertiary },
              ]}
            >
              {continueLearningData.concept_title}
            </Text>
            <View style={styles.continueMeta}>
              <View style={styles.continueMetaItem}>
                <Clock
                  height={15}
                  width={15}
                  color={theme.colors.text.tertiary}
                />
                <Text
                  style={[
                    styles.continueMetaText,
                    { color: theme.colors.text.tertiary },
                  ]}
                >
                  {continueLearningData.time_remaining_minutes} min left
                </Text>
              </View>
              <View
                style={[
                  styles.continueMetaDot,
                  { backgroundColor: theme.colors.text.tertiary },
                ]}
              />
              <Text style={styles.continueCategory}>
                {continueLearningData.topic_title}
              </Text>
            </View>
          </View>
          <View style={styles.continueCardRight}>
            <View style={styles.playButton}>
              <ArrowRight
                height={24}
                width={24}
                color={lightTheme.colors.white}
              />
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  // const renderTopics = () => {
  //   if (loading) {
  //     return (
  //       <View style={styles.loadingContainer}>
  //         <ActivityIndicator size="large" color={theme.colors.primary} />
  //         <Text style={styles.loadingText}>Loading topics...</Text>
  //       </View>
  //     );
  //   }

  //   if (error && topics.length === 0) {
  //     return (
  //       <View style={styles.errorContainer}>
  //         <Text style={styles.errorText}>{error}</Text>
  //         <Pressable style={styles.retryButton} onPress={loadTopics}>
  //           <Text style={styles.retryButtonText}>Retry</Text>
  //         </Pressable>
  //       </View>
  //     );
  //   }

  //   if (topics.length === 0) {
  //     return (
  //       <View style={styles.emptyContainer}>
  //         <Text style={styles.emptyText}>No topics available</Text>
  //       </View>
  //     );
  //   }

  //   return (
  //     <View style={styles.topicsContainer}>
  //       <Text style={styles.sectionHeader}>Explore Learning Paths</Text>
  //       <View style={styles.topicsBentoGrid}>
  //         {topics.map((topic, index) => {
  //           const cardSize = getCardSize(index);
  //           const isFullWidth = cardSize === "full";
  //           const cardWidth = isFullWidth
  //             ? width - lightTheme.spacing.lg * 2
  //             : (width - lightTheme.spacing.lg * 2 - lightTheme.spacing.sm) / 2;

  //           return (
  //             <Pressable
  //               key={topic.id}
  //               style={[
  //                 styles.topicBentoCard,
  //                 {
  //                   width: cardWidth,
  //                   minHeight: isFullWidth ? 160 : 140,
  //                 },
  //               ]}
  //               onPress={() => handleTopicPress(topic.id)}
  //               android_ripple={{ color: "rgba(255,255,255,0.3)" }}
  //             >
  //               <ImageBackground
  //                 source={{
  //                   uri:
  //                     topic.cover_image ||
  //                     "https://via.placeholder.com/400x200/8157F9/FFFFFF?text=No+Image",
  //                 }}
  //                 style={styles.topicImageBackground}
  //               >
  //                 <LinearGradient
  //                   colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]}
  //                   style={styles.topicGradientOverlay}
  //                 >
  //                   <View
  //                     style={[
  //                       styles.topicBentoContent,
  //                       isFullWidth && styles.topicBentoContentFull,
  //                     ]}
  //                   >
  //                     <View
  //                       style={[
  //                         styles.topicBentoInfo,
  //                         isFullWidth && styles.topicBentoInfoFull,
  //                       ]}
  //                     >
  //                       <Text
  //                         style={[
  //                           styles.topicBentoTitle,
  //                           isFullWidth && styles.topicBentoTitleFull,
  //                         ]}
  //                         numberOfLines={2}
  //                       >
  //                         {topic.title}
  //                       </Text>
  //                       <Text
  //                         style={[
  //                           styles.topicBentoMeta,
  //                           isFullWidth && styles.topicBentoMetaFull,
  //                         ]}
  //                       >
  //                         {topic._count?.concepts || topic.total_concepts || 0}{" "}
  //                         concepts
  //                       </Text>
  //                     </View>
  //                     <View
  //                       style={[
  //                         styles.topicBentoProgress,
  //                         isFullWidth && styles.topicBentoProgressFull,
  //                       ]}
  //                     >
  //                       <CircularProgress progress={0} size={24} />
  //                     </View>
  //                   </View>
  //                 </LinearGradient>
  //               </ImageBackground>
  //             </Pressable>
  //           );
  //         })}
  //       </View>
  //     </View>
  //   );
  // };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={theme.colors.background}
      />

      {/* Custom Header */}
      <View
        style={[
          styles.customHeader,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text
            style={[styles.welcomeText, { color: theme.colors.text.primary }]}
          >
            Welcome back! 👋
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push("/(protected)/bookmarks" as any)}
            style={[
              styles.bookmarkButton,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Bookmark
              height={18}
              width={18}
              color={theme.colors.text.secondary}
            />
          </Pressable>
          <Pressable
            onPress={() => setStreakModalVisible(true)}
            style={[
              styles.streakButton,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.streakIconContainer}>
              <Flame height={19} width={19} color="#FF6B35" />
            </View>
            <Text
              style={[styles.streakText, { color: theme.colors.text.primary }]}
            >
              {currentStreak}
            </Text>
          </Pressable>
          <Pressable
            style={styles.avatarContainer}
            onPress={handleProfilePress}
          >
            <View style={styles.avatar}>
              <Text
                style={[
                  styles.avatarText,
                  { color: theme.colors.text.primary },
                ]}
              >
                {getInitials()}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <StreakCalendarModal
        visible={streakModalVisible}
        onClose={() => setStreakModalVisible(false)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {renderContinueLearning()}
          {renderCuratedForYou()}
          {renderUnrotYourself()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  customHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.sm,
    paddingBottom: lightTheme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: lightTheme.spacing.xs * 1.2,
  },
  bookmarkButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: lightTheme.borderRadius.full,
    paddingHorizontal: lightTheme.spacing.sm * 1.2,
    paddingVertical: lightTheme.spacing.xs * 1.8,
  },
  streakButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: lightTheme.borderRadius.full,
    paddingHorizontal: lightTheme.spacing.sm * 1.2,
    paddingVertical: lightTheme.spacing.xs * 1.2,
  },
  streakIconContainer: {
    marginRight: lightTheme.spacing.xs / 2,
  },
  streakText: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.bold,
  },
  welcomeText: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontFamily: lightTheme.typography.fontFamily.bold,
  },
  avatarContainer: {
    marginLeft: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: lightTheme.borderRadius.full,
    backgroundColor: lightTheme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-5deg" }],
  },
  avatarText: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.bold,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingTop: lightTheme.spacing.sm,
    paddingBottom: lightTheme.spacing.sm,
  },
  curatedSection: {
    marginBottom: lightTheme.spacing.xl,
  },
  curatedLoadingContainer: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    alignItems: "center",
  },
  curatedScrollContent: {
    paddingHorizontal: lightTheme.spacing.lg,
  },
  // curatedCard: {
  //   width: 260,
  //   height: 160,
  //   borderRadius: lightTheme.borderRadius.xl,
  //   marginRight: lightTheme.spacing.md,
  //   overflow: "hidden",
  // },
  // curatedCardContent: {
  //   flex: 1,
  //   padding: lightTheme.spacing.lg,
  //   justifyContent: "space-between",
  // },
  // curatedCardIcon: {
  //   fontSize: 40,
  //   marginBottom: lightTheme.spacing.sm,
  // },
  // curatedCardTitle: {
  //   fontSize: lightTheme.typography.fontSize.lg,
  //   fontFamily: lightTheme.typography.fontFamily.bold,
  //   color: lightTheme.colors.white,
  //   lineHeight: 24,
  //   flex: 1,
  // },
  // curatedCardFooter: {
  //   marginTop: "auto",
  // },
  // curatedCardProgress: {
  //   fontSize: lightTheme.typography.fontSize.xs,
  //   fontFamily: lightTheme.typography.fontFamily.semibold,
  //   color: lightTheme.colors.white,
  //   opacity: 0.9,
  //   marginBottom: lightTheme.spacing.xs,
  // },
  // curatedProgressContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   gap: lightTheme.spacing.xs,
  // },
  // curatedProgressBar: {
  //   flex: 1,
  //   height: 6,
  //   backgroundColor: "rgba(255, 255, 255, 0.3)",
  //   borderRadius: 3,
  //   overflow: "hidden",
  // },
  // curatedProgressFill: {
  //   height: "100%",
  //   backgroundColor: lightTheme.colors.white,
  // },
  // curatedProgressText: {
  //   fontSize: lightTheme.typography.fontSize.xs,
  //   fontFamily: lightTheme.typography.fontFamily.bold,
  //   color: lightTheme.colors.white,
  //   minWidth: 30,
  // },
  // Unrot Yourself Section
  unrotSection: {
    marginBottom: lightTheme.spacing.xl,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: lightTheme.spacing.md,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  unrotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: lightTheme.spacing.sm,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  // unrotCard: {
  //   width: "47%",
  //   aspectRatio: 1,
  //   borderRadius: lightTheme.borderRadius.xl,
  //   overflow: "hidden",
  // },
  // unrotCardContent: {
  //   flex: 1,
  //   padding: lightTheme.spacing.md,
  //   justifyContent: "space-between",
  // },
  // unrotCardIcon: {
  //   fontSize: 32,
  //   marginBottom: lightTheme.spacing.sm,
  // },
  // unrotCardTitle: {
  //   fontSize: lightTheme.typography.fontSize.base,
  //   fontFamily: lightTheme.typography.fontFamily.bold,
  //   color: lightTheme.colors.white,
  //   lineHeight: 20,
  //   flex: 1,
  // },
  // unrotCardFooter: {
  //   marginTop: "auto",
  // },
  // unrotProgressContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   gap: lightTheme.spacing.xs,
  // },
  // unrotProgressBar: {
  //   flex: 1,
  //   height: 6,
  //   backgroundColor: "rgba(255, 255, 255, 0.3)",
  //   borderRadius: 3,
  //   overflow: "hidden",
  // },
  // unrotProgressFill: {
  //   height: "100%",
  //   backgroundColor: lightTheme.colors.white,
  // },
  // unrotProgressText: {
  //   fontSize: lightTheme.typography.fontSize.xs,
  //   fontFamily: lightTheme.typography.fontFamily.bold,
  //   color: lightTheme.colors.white,
  //   minWidth: 30,
  // },
  // Continue Learning Section
  continueSection: {
    marginBottom: lightTheme.spacing.xl,
    paddingHorizontal: lightTheme.spacing.lg,
  },
  continueSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: lightTheme.spacing.md,
  },
  continueSectionTitle: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontFamily: lightTheme.typography.fontFamily.bold,
  },
  viewAllText: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontFamily: lightTheme.typography.fontFamily.semibold,
    color: lightTheme.colors.primary,
    textTransform: "uppercase",
  },
  continueCard: {
    // backgroundColor applied dynamically inline
    borderRadius: lightTheme.borderRadius.xl,
    // borderWidth: 3,
    // borderColor applied dynamically inline

    padding: lightTheme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: lightTheme.spacing.md,
    transform: [{ rotate: "-0.5deg" }],
  },
  continueLoadingCard: {
    // backgroundColor applied dynamically inline
    // borderRadius: lightTheme.borderRadius.xl,
    // borderWidth: 3,
    // borderColor applied dynamically inline
    padding: lightTheme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: lightTheme.spacing.md,
  },
  continueLoadingText: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.medium,
    // color applied dynamically inline
  },
  continueCardLeft: {
    flex: 1,
  },
  continueProgress: {
    marginBottom: lightTheme.spacing.md,
  },
  continueProgressBar: {
    height: 8,
    // backgroundColor applied dynamically inline
    // borderRadius: lightTheme.borderRadius.sm,
    // borderWidth: 2,
    // borderColor: lightTheme.colors.black,
    overflow: "hidden",
    marginBottom: lightTheme.spacing.xs,
  },
  continueProgressFill: {
    height: "100%",
    backgroundColor: lightTheme.colors.success,
  },
  continueProgressText: {
    fontSize: lightTheme.typography.fontSize.xs,
    fontFamily: lightTheme.typography.fontFamily.semibold,
    color: lightTheme.colors.success,
    textTransform: "uppercase",
  },
  continueTitle: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.bold,
    // color applied dynamically inline
    marginBottom: lightTheme.spacing.sm,
    marginTop: lightTheme.spacing.md,
    lineHeight: 22,
  },
  continueMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: lightTheme.spacing.sm,
  },
  continueMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  continueMetaText: {
    fontSize: lightTheme.typography.fontSize.xs,
    fontFamily: lightTheme.typography.fontFamily.regular,
    // color applied dynamically inline
  },
  continueMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    // backgroundColor applied dynamically inline
  },
  continueCategory: {
    fontSize: lightTheme.typography.fontSize.xs,
    fontFamily: lightTheme.typography.fontFamily.medium,
    color: lightTheme.colors.primary,
  },
  continueCardRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: lightTheme.borderRadius.full,
    backgroundColor: lightTheme.colors.primary,
    // borderWidth: 3,
    // borderColor: lightTheme.colors.black,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "5deg" }],
  },
  sectionHeader: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontFamily: lightTheme.typography.fontFamily.bold,
    // color applied dynamically inline
  },
  // Topics View
  topicsContainer: {
    gap: lightTheme.spacing.lg,
  },
  topicsBentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: lightTheme.spacing.sm,
  },
  topicBentoCard: {
    borderRadius: lightTheme.borderRadius.xl,
    overflow: "hidden",
    marginBottom: lightTheme.spacing.sm,
  },
  topicImageBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  topicGradientOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  topicBentoContent: {
    padding: lightTheme.spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  topicBentoContentFull: {
    paddingHorizontal: lightTheme.spacing.xl,
  },
  topicBentoInfo: {
    flex: 1,
  },
  topicBentoInfoFull: {
    alignItems: "flex-start",
  },
  topicBentoTitle: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.bold,
    color: lightTheme.colors.white,
    textAlign: "left",
    lineHeight: 20,
    marginBottom: lightTheme.spacing.xs / 2,
  },
  topicBentoTitleFull: {
    fontSize: lightTheme.typography.fontSize.lg,
    lineHeight: 24,
  },
  topicBentoMeta: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontFamily: lightTheme.typography.fontFamily.medium,
    color: lightTheme.colors.white,
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
  // Curated Bento Cards
  curatedBentoCard: {
    borderRadius: lightTheme.borderRadius.xl,
    overflow: "hidden",
    marginRight: lightTheme.spacing.md,
  },
  curatedBentoContent: {
    // flex: 1,
    marginTop: "auto",
    padding: lightTheme.spacing.sm,
    paddingLeft: lightTheme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  curatedBentoInfo: {
    flex: 1,
  },
  curatedBentoTitle: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontFamily: lightTheme.typography.fontFamily.bold,
    color: lightTheme.colors.white,
    textAlign: "left",
    lineHeight: 24,
    marginBottom: lightTheme.spacing.xs / 2,
  },
  // curatedBentoProgressText: {
  //   fontSize: lightTheme.typography.fontSize.xs,
  //   fontFamily: lightTheme.typography.fontFamily.semibold,
  //   color: lightTheme.colors.white,
  //   opacity: 0.9,
  //   textAlign: "left",
  // },
  curatedBentoProgress: {
    alignItems: "center",
    justifyContent: "center",
  },
  // Unrot Bento Cards
  unrotBentoCardContainer: {
    marginBottom: lightTheme.spacing.sm,
    width: "48.5%",
    padding: lightTheme.spacing.xs,
    borderRadius: lightTheme.borderRadius.xl,
    paddingBottom: lightTheme.spacing.md,
    gap: lightTheme.spacing.sm,
  },
  unrotBentoCard: {
    borderRadius: lightTheme.borderRadius.xl * 0.9,
    overflow: "hidden",
  },
  unrotBentoContent: {
    padding: lightTheme.spacing.sm,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  unrotBentoInfo: {
    flex: 1,
  },
  unrotBentoTitle: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.bold,
    // textAlign: "center",
    margin: lightTheme.spacing.xs,
    lineHeight: 20,
    // marginBottom: lightTheme.spacing.xs / 2,
  },
  unrotBentoProgress: {
    alignItems: "center",
    justifyContent: "center",
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
    color: lightTheme.colors.text.secondary,
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
    color: lightTheme.colors.error,
    textAlign: "center",
    marginBottom: lightTheme.spacing.md,
  },
  retryButton: {
    backgroundColor: lightTheme.colors.primary,
    paddingHorizontal: lightTheme.spacing.lg,
    paddingVertical: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    borderWidth: 2,
    borderColor: lightTheme.colors.black,
  },
  retryButtonText: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.bold,
    color: lightTheme.colors.white,
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
    color: lightTheme.colors.text.secondary,
  },
});
