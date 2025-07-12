import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getUserData } from '@/utils/userData';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface UserData {
  name: string;
  height: string;
  weight: string;
  age: string;
  workoutLevel: string;
  fitnessGoal: string;
  gender?: string;
  heightUnit?: string;
  weightUnit?: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await getUserData();
      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (!userData?.height || !userData?.weight) return 0;
    const heightInM = parseFloat(userData.height) / 100;
    const weightInKg = parseFloat(userData.weight);
    return (weightInKg / (heightInM * heightInM)).toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: 'Underweight', risk: 'Low', color: '#60A5FA' };
    if (bmi < 25) return { status: 'Normal Weight', risk: 'Average', color: '#4ADE80' };
    if (bmi < 30) return { status: 'Overweight', risk: 'Moderate', color: '#FBBF24' };
    return { status: 'Obese', risk: 'High', color: '#F87171' };
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'muscle_gain': return 'Gain Weight';
      case 'weight_loss': return 'Lose Weight';
      case 'maintenance': return 'Maintain';
      case 'build_muscle': return 'Build Muscle';
      default: return goal;
    }
  };

  const getActivityText = (level: string) => {
    switch (level) {
      case 'sedentary': return 'Sedentary';
      case 'low_active': return 'Low Active';
      case 'active': return 'Active';
      case 'very_active': return 'Very Active';
      default: return level;
    }
  };

  if (loading) {
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

  if (!userData) {
    return (
      <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No profile data found</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const bmi = parseFloat(calculateBMI());
  const bmiInfo = getBMIStatus(bmi);

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Feather name="user" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Feather name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* BMI Card */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.bmiCard}>
            <View style={styles.bmiCircle}>
              <LinearGradient
                colors={[bmiInfo.color, `${bmiInfo.color}80`]}
                style={styles.bmiGradient}
              >
                <Text style={styles.bmiValue}>{bmi}</Text>
                <Text style={styles.bmiLabel}>BMI</Text>
              </LinearGradient>
            </View>
            <Text style={styles.bmiStatus}>{bmiInfo.status}</Text>
            <Text style={styles.bmiRisk}>Risk of comorbidities: {bmiInfo.risk}</Text>
          </Animated.View>

          {/* Profile Stats */}
          <View style={styles.statsContainer}>
            <Animated.View entering={FadeInUp.delay(300)} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name="activity" size={20} color="#4ADE80" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Activity</Text>
                <Text style={styles.statValue}>{getActivityText(userData.workoutLevel)}</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(350)} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name="target" size={20} color="#4ADE80" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Goal</Text>
                <Text style={styles.statValue}>{getGoalText(userData.fitnessGoal)}</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400)} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name="scale" size={20} color="#4ADE80" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Weight</Text>
                <Text style={styles.statValue}>{userData.weight} {userData.weightUnit || 'kg'}</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(450)} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name="arrow-up" size={20} color="#4ADE80" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Height</Text>
                <Text style={styles.statValue}>{userData.height} {userData.heightUnit || 'cm'}</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500)} style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name="calendar" size={20} color="#4ADE80" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Age</Text>
                <Text style={styles.statValue}>{userData.age} years</Text>
              </View>
            </Animated.View>

            {userData.gender && (
              <Animated.View entering={FadeInUp.delay(550)} style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Feather name="user" size={20} color="#4ADE80" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Gender</Text>
                  <Text style={styles.statValue}>{userData.gender}</Text>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="edit-3" size={20} color="#4ADE80" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Feather name="share-2" size={20} color="#4ADE80" />
              <Text style={styles.actionButtonText}>Share Progress</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Bottom Navigation */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)')}>
            <Feather name="home" size={24} color="#666" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Feather name="bookmark" size={24} color="#666" />
            <Text style={styles.navLabel}>Diary</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
            <View style={styles.activeNavButton}>
              <Feather name="user" size={24} color="#000" />
            </View>
            <Text style={[styles.navLabel, styles.navLabelActive]}>Profile</Text>
          </TouchableOpacity>
        </Animated.View>
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
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  bmiCard: {
    alignItems: 'center',
    marginBottom: 40,
  },
  bmiCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bmiGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
  },
  bmiLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
  },
  bmiStatus: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  bmiRisk: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtons: {
    gap: 16,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ADE80',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navItemActive: {
    alignItems: 'center',
  },
  activeNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#4ADE80',
  },
});