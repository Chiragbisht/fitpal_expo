import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AddScreen() {
  const router = useRouter();

  const handleLogFood = () => {
    router.push('/log-food');
  };

  const handleAddWorkout = () => {
    router.push('/add-workout');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Add</Text>
      </View>

      <View style={styles.content}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  actionSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 2,
    flex: 1,
  },
});