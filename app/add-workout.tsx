import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutEntry {
  id: string;
  date: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
}

export default function AddWorkoutScreen() {
  const [workout, setWorkout] = useState({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    notes: '',
  });
  const router = useRouter();

  const handleSave = async () => {
    if (!workout.exercise.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    const entry: WorkoutEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercise: workout.exercise,
      sets: workout.sets,
      reps: workout.reps,
      weight: workout.weight,
      notes: workout.notes,
    };

    try {
      const existingEntries = await AsyncStorage.getItem('workoutEntries');
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
      entries.unshift(entry);
      await AsyncStorage.setItem('workoutEntries', JSON.stringify(entries));
      
      Alert.alert('Success', 'Workout logged successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to log workout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Workout</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Exercise *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Bench Press"
            value={workout.exercise}
            onChangeText={(text) => setWorkout({...workout, exercise: text})}
            placeholderTextColor="#C6C6C8"
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>Sets</Text>
            <TextInput
              style={styles.textInput}
              placeholder="3"
              value={workout.sets}
              onChangeText={(text) => setWorkout({...workout, sets: text})}
              keyboardType="numeric"
              placeholderTextColor="#C6C6C8"
            />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.inputLabel}>Reps</Text>
            <TextInput
              style={styles.textInput}
              placeholder="10"
              value={workout.reps}
              onChangeText={(text) => setWorkout({...workout, reps: text})}
              keyboardType="numeric"
              placeholderTextColor="#C6C6C8"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="60"
            value={workout.weight}
            onChangeText={(text) => setWorkout({...workout, weight: text})}
            keyboardType="numeric"
            placeholderTextColor="#C6C6C8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add any notes about your workout..."
            value={workout.notes}
            onChangeText={(text) => setWorkout({...workout, notes: text})}
            multiline
            numberOfLines={4}
            placeholderTextColor="#C6C6C8"
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputHalf: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});