import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getUserData } from '@/utils/userData';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  backgroundColor: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
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
      </svg>
    </View>
  );
};

export default function HomeScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [targetCalories] = useState(2000);
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
        setTodayCalories(totalCalories);
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
        return 'trending-up';
      case 'weight_loss':
        return 'trending-down';
      case 'maintenance':
        return 'activity';
      default:
        return 'target';
    }
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'muscle_gain':
        return 'Muscle Gain';
      case 'weight_loss':
        return 'Weight Loss';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown Goal';
    }
  };

  const calorieProgress = Math.min((todayCalories / targetCalories) * 100, 100);

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.name}>{userData.name}</Text>
        </View>
        <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
          <Feather name="user" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Circular Progress Wheel */}
        <View style={styles.progressContainer}>
          <View style={styles.progressWheel}>
            <View style={styles.circularProgressContainer}>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { 
                  transform: [{ rotate: `${(calorieProgress * 3.6)}deg` }] 
                }]} />
              </View>
              <View style={styles.progressContent}>
                <Text style={styles.calorieCount}>{todayCalories}</Text>
                <Text style={styles.calorieLabel}>/ {targetCalories}</Text>
                <Text style={styles.calorieUnit}>calories</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.age}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.height}</Text>
            <Text style={styles.statLabel}>Height (cm)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.weight}</Text>
            <Text style={styles.statLabel}>Weight (kg)</Text>
          </View>
        </View>

        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIconContainer}>
              <Feather name={getGoalIcon(userData.fitnessGoal)} size={20} color="#007AFF" />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>Your Goal</Text>
              <Text style={styles.goalText}>{getGoalText(userData.fitnessGoal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/workout')}
          >
            <View style={styles.actionIconContainer}>
              <Feather name="activity" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Start Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/diet')}
          >
            <View style={styles.actionIconContainer}>
              <Feather name="coffee" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>View Diet Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 17,
    color: '#8E8E93',
    fontWeight: '400',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 17,
    color: '#8E8E93',
    fontWeight: '400',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressWheel: {
    alignItems: 'center',
  },
  circularProgressContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F2F2F7',
    position: 'absolute',
    overflow: 'hidden',
  },
  progressFill: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#007AFF',
    position: 'absolute',
    transformOrigin: 'center',
  },
  progressContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  calorieCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
  },
  calorieLabel: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  calorieUnit: {
    fontSize: 14,
    color: '#C6C6C8',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 2,
  },
  goalText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    marginRight: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});