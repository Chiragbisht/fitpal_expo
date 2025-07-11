import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { saveUserData } from '@/utils/userData';

interface FormData {
  name: string;
  height: string;
  weight: string;
  age: string;
  workoutLevel: string;
  fitnessGoal: string;
}

const workoutLevels = [
  { id: '1-2', label: '1-2 times a week', subtitle: 'Beginner' },
  { id: '3-4', label: '3-4 times a week', subtitle: 'Intermediate' },
  { id: '5-6', label: '5-6 times a week', subtitle: 'Advanced' },
];

const fitnessGoals = [
  { id: 'muscle_gain', label: 'Muscle Gain', icon: 'trending-up' },
  { id: 'weight_loss', label: 'Weight Loss', icon: 'trending-down' },
  { id: 'maintenance', label: 'Maintenance', icon: 'activity' },
];

export default function OnboardingScreen() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    height: '',
    weight: '',
    age: '',
    workoutLevel: '',
    fitnessGoal: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const steps = [
    { title: "Welcome!", subtitle: "Let's get to know you better" },
    { title: "Physical Details", subtitle: "Tell us about your body" },
    { title: "Workout Frequency", subtitle: "How often do you exercise?" },
    { title: "Fitness Goal", subtitle: "What's your main objective?" },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.height || !formData.weight || !formData.age || !formData.workoutLevel || !formData.fitnessGoal) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await saveUserData(formData);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== '';
      case 1:
        return formData.height.trim() !== '' && formData.weight.trim() !== '' && formData.age.trim() !== '';
      case 2:
        return formData.workoutLevel !== '';
      case 3:
        return formData.fitnessGoal !== '';
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.inputLabel}>What's your name?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholderTextColor="#C6C6C8"
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 175"
                value={formData.height}
                onChangeText={(value) => handleInputChange('height', value)}
                keyboardType="numeric"
                placeholderTextColor="#C6C6C8"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 70"
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                keyboardType="numeric"
                placeholderTextColor="#C6C6C8"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., 25"
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                keyboardType="numeric"
                placeholderTextColor="#C6C6C8"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.inputLabel}>Select your workout frequency</Text>
            {workoutLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.optionButton,
                  formData.workoutLevel === level.id && styles.optionButtonActive,
                ]}
                onPress={() => handleInputChange('workoutLevel', level.id)}
              >
                <View style={styles.optionContent}>
                  <View>
                    <Text style={[
                      styles.optionLabel,
                      formData.workoutLevel === level.id && styles.optionLabelActive,
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={[
                      styles.optionSubtitle,
                      formData.workoutLevel === level.id && styles.optionSubtitleActive,
                    ]}>
                      {level.subtitle}
                    </Text>
                  </View>
                </View>
                {formData.workoutLevel === level.id && (
                  <Feather name="check" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.inputLabel}>What's your fitness goal?</Text>
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
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentStep + 1) / steps.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{currentStep + 1} of {steps.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{steps[currentStep].title}</Text>
          <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
        </View>

        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="chevron-left" size={20} color="#8E8E93" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, !isStepValid() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isStepValid()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <Feather name="chevron-right" size={20} color="#FFFFFF" />
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
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '400',
  },
  stepContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
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
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
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
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  optionLabelActive: {
    color: '#FFFFFF',
  },
  optionSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '400',
  },
  optionSubtitleActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#C6C6C8',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 17,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '400',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#C6C6C8',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
});