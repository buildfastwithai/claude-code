import { useTheme } from "@/hooks/useTheme";
import { lightTheme } from "@/lib/theme";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStats, useStreakCalendar } from "@/hooks/useStreakQueries";
import { useMemo } from "react";

export default function ProgressScreen() {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useUserStats();

  // Fetch current month's calendar
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const { data: calendarData, isLoading: calendarLoading } = useStreakCalendar(
    currentYear,
    currentMonth
  );

  // Calculate last 7 days data
  const last7DaysData = useMemo(() => {
    if (!calendarData?.calendar) return [];

    const sortedCalendar = [...calendarData.calendar].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const entry = sortedCalendar.find((item) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === date.getTime();
      });

      last7Days.push({
        date,
        concepts_completed: entry?.concepts_completed || 0,
        dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    return last7Days;
  }, [calendarData]);

  const maxConcepts = Math.max(
    ...last7DaysData.map((d) => d.concepts_completed),
    1
  );

  const isLoading = statsLoading || calendarLoading;

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
              Your Progress
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.text.secondary }]}
            >
              Track your learning journey
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.statValue}>
                    {userStats?.total_concepts_completed || 0}
                  </Text>
                  <Text style={styles.statLabel}>Concepts</Text>
                </>
              )}
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.accent },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.black} />
              ) : (
                <>
                  <Text style={styles.statValue}>
                    {userStats?.total_xp || 0}
                  </Text>
                  <Text style={styles.statLabel}>Total XP</Text>
                </>
              )}
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.success || "#10B981" },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.statValue}>
                    {userStats?.current_streak || 0}
                  </Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </>
              )}
            </View>

            <View style={[styles.statCard, { backgroundColor: "#F59E0B" }]}>
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.statValue}>
                    {userStats?.longest_streak || 0}
                  </Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </>
              )}
            </View>
          </View>

          {/* 7-Day Progress Graph */}
          <View
            style={[
              styles.graphCard,
              { backgroundColor: theme.colors.cardBackground },
            ]}
          >
            <Text
              style={[styles.graphTitle, { color: theme.colors.text.primary }]}
            >
              Last 7 Days Activity
            </Text>
            <Text
              style={[
                styles.graphSubtitle,
                { color: theme.colors.text.secondary },
              ]}
            >
              Concepts completed per day
            </Text>

            {isLoading ? (
              <View style={styles.graphLoading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <View style={styles.graphContainer}>
                {last7DaysData.map((day, index) => {
                  const barHeight =
                    maxConcepts > 0
                      ? (day.concepts_completed / maxConcepts) * 100
                      : 0;
                  const isToday = index === last7DaysData.length - 1;

                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${Math.max(barHeight, 5)}%`,
                              backgroundColor: isToday
                                ? theme.colors.primary
                                : day.concepts_completed > 0
                                ? theme.colors.accent
                                : theme.colors.gray[100],
                            },
                          ]}
                        >
                          {day.concepts_completed > 0 && (
                            <Text
                              style={[
                                styles.barValue,
                                { color: theme.colors.text.primary },
                              ]}
                            >
                              {day.concepts_completed}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.barLabel,
                          { color: theme.colors.text.secondary },
                          isToday && {
                            color: theme.colors.primary,
                            fontFamily: lightTheme.typography.fontFamily.bold,
                          },
                        ]}
                      >
                        {day.dayLabel}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Today's Progress */}
          <View
            style={[
              styles.todayCard,
              { backgroundColor: theme.colors.cardBackground },
            ]}
          >
            <Text
              style={[styles.todayTitle, { color: theme.colors.text.primary }]}
            >
              Today's Progress
            </Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <View style={styles.todayStats}>
                  <View style={styles.todayStat}>
                    <Text
                      style={[
                        styles.todayValue,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {userStats?.concepts_completed_today || 0}
                    </Text>
                    <Text
                      style={[
                        styles.todayLabel,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      Completed
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.todayDivider,
                      { backgroundColor: theme.colors.gray[300] },
                    ]}
                  />
                  <View style={styles.todayStat}>
                    <Text
                      style={[
                        styles.todayValue,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {userStats?.daily_goal || 3}
                    </Text>
                    <Text
                      style={[
                        styles.todayLabel,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      Daily Goal
                    </Text>
                  </View>
                </View>
                {userStats && (
                  <View
                    style={[
                      styles.progressBarContainer,
                      {
                        backgroundColor: theme.colors.gray[200],
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(
                            (userStats.concepts_completed_today /
                              userStats.daily_goal) *
                              100,
                            100
                          )}%`,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor applied dynamically inline
  },
  container: {
    flex: 1,
    // backgroundColor applied dynamically inline
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: lightTheme.spacing.lg,
    paddingTop: lightTheme.spacing.sm,
    paddingBottom: lightTheme.spacing.sm, // Minimal padding for last item above tab bar
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -lightTheme.spacing.xs,
    marginBottom: lightTheme.spacing.lg,
  },
  statCard: {
    width: "48%",
    marginHorizontal: "1%",
    marginBottom: lightTheme.spacing.sm,
    padding: lightTheme.spacing.lg,
    borderRadius: lightTheme.borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    // ...lightTheme.shadows.md,
  },
  statValue: {
    fontSize: lightTheme.typography.fontSize["2xl"],
    fontFamily: lightTheme.typography.fontFamily.bold,
    color: lightTheme.colors.white,
    marginBottom: lightTheme.spacing.xs,
  },
  statLabel: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontFamily: lightTheme.typography.fontFamily.semibold,
    color: lightTheme.colors.white,
    textTransform: "uppercase",
  },
  graphCard: {
    padding: lightTheme.spacing.lg,
    borderRadius: lightTheme.borderRadius.lg,
    marginBottom: lightTheme.spacing.lg,
    // ...lightTheme.shadows.md,
  },
  graphTitle: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontFamily: lightTheme.typography.fontFamily.bold,
    marginBottom: lightTheme.spacing.xs,
  },
  graphSubtitle: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontFamily: lightTheme.typography.fontFamily.regular,
    marginBottom: lightTheme.spacing.lg,
  },
  graphLoading: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  graphContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    paddingTop: lightTheme.spacing.md,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  barWrapper: {
    width: "100%",
    height: 170,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "100%",
    minHeight: 5,
    borderRadius: lightTheme.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  barValue: {
    fontSize: lightTheme.typography.fontSize.xs,
    fontFamily: lightTheme.typography.fontFamily.bold,
  },
  barLabel: {
    fontSize: lightTheme.typography.fontSize.xs,
    fontFamily: lightTheme.typography.fontFamily.medium,
    marginTop: lightTheme.spacing.xs,
    textAlign: "center",
  },
  todayCard: {
    padding: lightTheme.spacing.lg,
    borderRadius: lightTheme.borderRadius.lg,
    marginBottom: lightTheme.spacing.md,
    // ...lightTheme.shadows.md,
  },
  todayTitle: {
    fontSize: lightTheme.typography.fontSize.xl,
    fontFamily: lightTheme.typography.fontFamily.bold,
    marginBottom: lightTheme.spacing.md,
  },
  todayStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: lightTheme.spacing.md,
  },
  todayStat: {
    alignItems: "center",
  },
  todayValue: {
    fontSize: lightTheme.typography.fontSize["2xl"],
    fontFamily: lightTheme.typography.fontFamily.bold,
    marginBottom: lightTheme.spacing.xs,
  },
  todayLabel: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontFamily: lightTheme.typography.fontFamily.medium,
    textTransform: "uppercase",
  },
  todayDivider: {
    width: 2,
    marginHorizontal: lightTheme.spacing.md,
  },
  progressBarContainer: {
    height: 20,
    borderRadius: lightTheme.borderRadius.full,
    overflow: "hidden",
    marginTop: lightTheme.spacing.sm,
  },
  progressBar: {
    height: "100%",
  },
  placeholderTextSmall: {
    fontSize: lightTheme.typography.fontSize.xl,
  },
  placeholderSubtext: {
    fontSize: lightTheme.typography.fontSize.base,
    fontFamily: lightTheme.typography.fontFamily.regular,
    textAlign: "center",
  },
});
