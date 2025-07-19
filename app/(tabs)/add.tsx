import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddScreen() {
  const router = useRouter();

  const handleLogFood = () => {
    router.push('/log-food');
  };

  const handleAddWorkout = () => {
    router.push('/add-workout');
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Quick Add</Text>
        </View>

        <TouchableOpacity style={styles.actionCard} onPress={handleLogFood}>
          <View style={styles.actionIcon}>
            <Feather name="coffee" size={24} color="#007AFF" />
          </View>
          <Text style={styles.actionTitle}>Log Food</Text>
          <Text style={styles.actionSubtitle}>Track your meals and calories</Text>
          <Feather name="chevron-right" size={20} color="#C6C6C8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleAddWorkout}>
          <View style={styles.actionIcon}>
            <Feather name="activity" size={24} color="#007AFF" />
          </View>
          <Text style={styles.actionTitle}>Add Workout</Text>
          <Text style={styles.actionSubtitle}>Log your exercise session</Text>
          <Feather name="chevron-right" size={20} color="#C6C6C8" />
        </TouchableOpacity>
        </View>
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
  innerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  actionSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    flex: 1,
  },
});