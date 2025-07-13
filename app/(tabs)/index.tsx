import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getUserData } from '@/utils/userData';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface UserData {
  name: string;
  height: string;
  weight: string;
  age: string;
  workoutLevel: string;
  fitnessGoal: string;
}

interface FoodEntry {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroData {
  carbs: { current: number; target: number; color: string };
  fat: { current: number; target: number; color: string };
  protein: { current: number; target: number; color: string };
}

const CircularProgress = ({ size, strokeWidth, progress, color, backgroundColor }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <Circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </Svg>
    </View>
  );
};

export default function HomeScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [targetCalories] = useState(2000);
  const [macroData, setMacroData] = useState<MacroData>({
    carbs: { current: 50, target: 165, color: '#10B981' },
    fat: { current: 35, target: 65, color: '#8B5CF6' },
    protein: { current: 65, target: 85, color: '#F59E0B' },
  });
  const router = useRouter();

  useEffect(() => {
    loadUserData();
    loadTodayCalories();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
  };

  const loadTodayCalories = async () => {
    try {
      const entries = await AsyncStorage.getItem('foodEntries');
      if (entries) {
        const parsedEntries: FoodEntry[] = JSON.parse(entries);
        const today = new Date().toDateString();
        const todayEntries = parsedEntries.filter(entry => 
          new Date(entry.date).toDateString() === today
        );
        const totalCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
        const totalCarbs = todayEntries.reduce((sum, entry) => sum + entry.carbs, 0);
        const totalFat = todayEntries.reduce((sum, entry) => sum + entry.fat, 0);
        const totalProtein = todayEntries.reduce((sum, entry) => sum + entry.protein, 0);
        
        setTodayCalories(totalCalories);
        setMacroData(prev => ({
          carbs: { ...prev.carbs, current: Math.round(totalCarbs) },
          fat: { ...prev.fat, current: Math.round(totalFat) },
          protein: { ...prev.protein, current: Math.round(totalProtein) },
        }));
      }
    } catch (error) {
      console.error('Error loading today calories:', error);
    }
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'muscle_gain':
      case 'build_muscle':
        return 'trending-up';
      case 'weight_loss':
      case 'lose_weight':
        return 'trending-down';
      case 'maintenance':
      case 'maintain':
        return 'activity';
      default:
        return 'target';
    }
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'muscle_gain':
      case 'build_muscle':
        return 'Build Muscle';
      case 'weight_loss':
      case 'lose_weight':
        return 'Lose Weight';
      case 'maintenance':
      case 'maintain':
        return 'Maintain Weight';
      default:
        return 'Unknown Goal';
    }
  };

  const calorieProgress = Math.min((todayCalories / targetCalories) * 100, 100);

  if (!userData) {
    return (
      <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>{userData.name}</Text>
          </View>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <Feather name="user" size={18} color="#4ADE80" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Today Section */}
          <View style={styles.todaySection}>
            <View style={styles.todayHeader}>
              <Text style={styles.todayTitle}>Today</Text>
              <TouchableOpacity>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Macros Section */}
            <View style={styles.macrosSection}>
              <Text style={styles.macrosTitle}>Macros</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.macrosScroll}>
                {Object.entries(macroData).map(([key, macro]) => {
                  const progress = (macro.current / macro.target) * 100;
                  const remaining = Math.max(0, macro.target - macro.current);
                  const isOver = macro.current > macro.target;
                  
                  return (
                    <View key={key} style={styles.macroCard}>
                      <Text style={[styles.macroLabel, { color: macro.color }]}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <View style={styles.macroProgressContainer}>
                        <CircularProgress
                          size={80}
                          strokeWidth={6}
                          progress={Math.min(progress, 100)}
                          color={macro.color}
                          backgroundColor="rgba(255, 255, 255, 0.1)"
                        />
                        <View style={styles.macroProgressText}>
                          <Text style={styles.macroValue}>{macro.current}</Text>
                          <Text style={styles.macroTarget}>/{macro.target}g</Text>
                        </View>
                      </View>
                      <Text style={styles.macroRemaining}>
                        {isOver ? `${macro.current - macro.target}g over` : `${remaining}g left`}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>Steps</Text>
                <TouchableOpacity>
                  <Feather name="plus" size={16} color="#4ADE80" />
                </TouchableOpacity>
              </View>
              <View style={styles.statContent}>
                <View style={styles.statIcon}>
                  <Feather name="activity" size={16} color="#FF6B6B" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>6,342</Text>
                  <Text style={styles.statLabel}>Goal: 10,000 steps</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '63%', backgroundColor: '#FF6B6B' }]} />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statTitle}>Exercise</Text>
                <TouchableOpacity>
                  <Feather name="plus" size={16} color="#4ADE80" />
                </TouchableOpacity>
              </View>
              <View style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
                  <Feather name="zap" size={16} color="#FBBF24" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>400 cal</Text>
                  <View style={styles.exerciseTime}>
                    <Feather name="check-circle" size={12} color="#4ADE80" />
                    <Text style={styles.exerciseTimeText}>1:01 hr</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Goal Card */}
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <Feather name={getGoalIcon(userData.fitnessGoal)} size={18} color="#4ADE80" />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>Your Goal</Text>
                <Text style={styles.goalText}>{getGoalText(userData.fitnessGoal)}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/workout')}
            >
              <View style={styles.actionIconContainer}>
                <Feather name="activity" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Start Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/diet')}
            >
              <View style={styles.actionIconContainer}>
                <Feather name="coffee" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>View Diet Plan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  todaySection: {
    marginBottom: 24,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButton: {
    fontSize: 14,
    color: '#4ADE80',
    fontWeight: '600',
  },
  macrosSection: {
    marginBottom: 20,
  },
  macrosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  macrosScroll: {
    marginHorizontal: -10,
  },
  macroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    width: 120,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  macroProgressContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  macroProgressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  macroTarget: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  macroRemaining: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  exerciseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseTimeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  goalText: {
    fontSize: 16,
    color: '#4ADE80',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionIconContainer: {
    marginRight: 4,
  },
  actionText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
});