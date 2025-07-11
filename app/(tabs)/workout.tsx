import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const workoutCategories = [
  { id: 1, name: 'Chest', icon: 'zap', exercises: 8 },
  { id: 2, name: 'Back', icon: 'shield', exercises: 10 },
  { id: 3, name: 'Shoulders', icon: 'triangle', exercises: 6 },
  { id: 4, name: 'Arms', icon: 'trending-up', exercises: 12 },
  { id: 5, name: 'Legs', icon: 'arrow-down', exercises: 14 },
  { id: 6, name: 'Core', icon: 'target', exercises: 8 },
];

export default function WorkoutScreen() {
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    notes: '',
  });

  useEffect(() => {
    loadWorkoutEntries();
  }, []);

  const loadWorkoutEntries = async () => {
    try {
      const entries = await AsyncStorage.getItem('workoutEntries');
      if (entries) {
        setWorkoutEntries(JSON.parse(entries));
      }
    } catch (error) {
      console.error('Error loading workout entries:', error);
    }
  };

  const saveWorkoutEntries = async (entries: WorkoutEntry[]) => {
    try {
      await AsyncStorage.setItem('workoutEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving workout entries:', error);
    }
  };

  const handleAddWorkout = () => {
    if (!newWorkout.exercise.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    const entry: WorkoutEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      exercise: newWorkout.exercise,
      sets: newWorkout.sets,
      reps: newWorkout.reps,
      weight: newWorkout.weight,
      notes: newWorkout.notes,
    };

    const updatedEntries = [entry, ...workoutEntries];
    setWorkoutEntries(updatedEntries);
    saveWorkoutEntries(updatedEntries);

    setNewWorkout({
      exercise: '',
      sets: '',
      reps: '',
      weight: '',
      notes: '',
    });
    setModalVisible(false);
  };

  const handleDeleteWorkout = (id: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedEntries = workoutEntries.filter(entry => entry.id !== id);
            setWorkoutEntries(updatedEntries);
            saveWorkoutEntries(updatedEntries);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {workoutCategories.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryIcon}>
                  <Feather name={category.icon as any} size={20} color="#007AFF" />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryExercises}>{category.exercises} exercises</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {workoutEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="activity" size={48} color="#C6C6C8" />
              <Text style={styles.emptyText}>No workouts logged yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add your first workout</Text>
            </View>
          ) : (
            workoutEntries.map((entry) => (
              <View key={entry.id} style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutIcon}>
                    <Feather name="activity" size={16} color="#007AFF" />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{entry.exercise}</Text>
                    <Text style={styles.workoutDate}>{entry.date}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteWorkout(entry.id)}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                <View style={styles.workoutDetails}>
                  {entry.sets && <Text style={styles.workoutDetail}>Sets: {entry.sets}</Text>}
                  {entry.reps && <Text style={styles.workoutDetail}>Reps: {entry.reps}</Text>}
                  {entry.weight && <Text style={styles.workoutDetail}>Weight: {entry.weight}kg</Text>}
                  {entry.notes && <Text style={styles.workoutNotes}>{entry.notes}</Text>}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Workout</Text>
              <TouchableOpacity onPress={handleAddWorkout}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Exercise *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Bench Press"
                  value={newWorkout.exercise}
                  onChangeText={(text) => setNewWorkout({...newWorkout, exercise: text})}
                  placeholderTextColor="#C6C6C8"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Sets</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="3"
                    value={newWorkout.sets}
                    onChangeText={(text) => setNewWorkout({...newWorkout, sets: text})}
                    keyboardType="numeric"
                    placeholderTextColor="#C6C6C8"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="10"
                    value={newWorkout.reps}
                    onChangeText={(text) => setNewWorkout({...newWorkout, reps: text})}
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
                  value={newWorkout.weight}
                  onChangeText={(text) => setNewWorkout({...newWorkout, weight: text})}
                  keyboardType="numeric"
                  placeholderTextColor="#C6C6C8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Add any notes about your workout..."
                  value={newWorkout.notes}
                  onChangeText={(text) => setNewWorkout({...newWorkout, notes: text})}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#C6C6C8"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  categoryExercises: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#C6C6C8',
    marginTop: 4,
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  workoutDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  workoutDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  workoutDetail: {
    fontSize: 14,
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workoutNotes: {
    fontSize: 14,
    color: '#000000',
    marginTop: 8,
    fontStyle: 'italic',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    fontSize: 17,
    color: '#8E8E93',
  },
  saveButton: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalForm: {
    padding: 20,
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
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});