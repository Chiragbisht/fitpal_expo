import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getUserData, saveUserData } from '@/utils/userData';

interface FormData {
  name: string;
  height: string;
  weight: string;
  age: string;
  workoutLevel: string;
  fitnessGoal: string;
}

const workoutLevels = [
  { id: '1-2', label: '1-2 times a week' },
  { id: '3-4', label: '3-4 times a week' },
  { id: '5-6', label: '5-6 times a week' },
];

const fitnessGoals = [
  { id: 'muscle_gain', label: 'Muscle Gain', icon: 'trending-up' },
  { id: 'weight_loss', label: 'Weight Loss', icon: 'trending-down' },
  { id: 'maintenance', label: 'Maintenance', icon: 'activity' },
];

export default function ProfileScreen() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    height: '',
    weight: '',
    age: '',
    workoutLevel: '',
    fitnessGoal: '',
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await getUserData();
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.height || !formData.weight || !formData.age || !formData.workoutLevel || !formData.fitnessGoal) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await saveUserData(formData);
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  if (loading) {
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholderTextColor="#C6C6C8"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="175"
                value={formData.height}
                onChangeText={(value) => handleInputChange('height', value)}
                keyboardType="numeric"
                placeholderTextColor="#C6C6C8"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="70"
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                keyboardType="numeric"
                placeholderTextColor="#C6C6C8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              placeholder="25"
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              keyboardType="numeric"
              placeholderTextColor="#C6C6C8"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Frequency</Text>
          {workoutLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionButton,
                formData.workoutLevel === level.id && styles.optionButtonActive,
              ]}
              onPress={() => handleInputChange('workoutLevel', level.id)}
            >
              <Text style={[
                styles.optionLabel,
                formData.workoutLevel === level.id && styles.optionLabelActive,
              ]}>
                {level.label}
              </Text>
              {formData.workoutLevel === level.id && (
                <Feather name="check" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Goal</Text>
          {fitnessGoals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.optionButton,
                formData.fitnessGoal === goal.id && styles.optionButtonActive,
              ]}
              onPress={() => handleInputChange('fitnessGoal', goal.id)}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.goalIcon,
                  formData.fitnessGoal === goal.id && styles.goalIconActive,
                ]}>
                  <Feather
                    name={goal.icon as any}
                    size={20}
                    color={formData.fitnessGoal === goal.id ? '#FFFFFF' : '#007AFF'}
                  />
                </View>
                <Text style={[
                  styles.optionLabel,
                  formData.fitnessGoal === goal.id && styles.optionLabelActive,
                ]}>
                  {goal.label}
                </Text>
              </View>
              {formData.fitnessGoal === goal.id && (
                <Feather name="check" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
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
  inputGroup: {
    marginBottom: 16,
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
    fontSize: 17,
    color: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  optionLabelActive: {
    color: '#FFFFFF',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});