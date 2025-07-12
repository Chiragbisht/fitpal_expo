import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { saveUserData } from '@/utils/userData';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface FormData {
  name: string;
  gender: string;
  birthday: string;
  height: string;
  weight: string;
  heightUnit: 'cm' | 'ft';
  weightUnit: 'kg' | 'lbs';
  activityLevel: string;
  fitnessGoal: string;
}

const genderOptions = [
  { id: 'male', label: 'male', icon: 'user' },
  { id: 'female', label: 'female', icon: 'user' },
];

const activityLevels = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { id: 'low_active', label: 'Low Active', description: 'Light exercise 1-3 days/week' },
  { id: 'active', label: 'Active', description: 'Moderate exercise 3-5 days/week' },
  { id: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
];

const fitnessGoals = [
  { id: 'lose_weight', label: 'Lose Weight', icon: 'trending-down' },
  { id: 'gain_weight', label: 'Gain Weight', icon: 'trending-up' },
  { id: 'maintain', label: 'Maintain', icon: 'activity' },
  { id: 'build_muscle', label: 'Build Muscle', icon: 'zap' },
];

export default function OnboardingScreen() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: '',
    birthday: '',
    height: '',
    weight: '',
    heightUnit: 'cm',
    weightUnit: 'kg',
    activityLevel: '',
    fitnessGoal: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  const steps = [
    { title: "What's your name?", subtitle: "We'll use this to personalize your experience" },
    { title: "Gender", subtitle: "What's your gender?" },
    { title: "Age", subtitle: "When is your birthday?" },
    { title: "Height", subtitle: "What's your current height?" },
    { title: "Weight", subtitle: "What's your current weight?" },
    { title: "Activity", subtitle: "How active are you? (without workouts)" },
    { title: "Goal", subtitle: "What's your fitness goal?" },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const animateToNext = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(prev => prev + 1);
      slideAnim.setValue(width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const animateToBack = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(prev => prev - 1);
      slideAnim.setValue(-width);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      animateToNext();
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateToBack();
    }
  };

  const handleSubmit = async () => {
    const userData = {
      name: formData.name,
      height: formData.height,
      weight: formData.weight,
      age: calculateAge(formData.birthday),
      workoutLevel: formData.activityLevel,
      fitnessGoal: formData.fitnessGoal,
      gender: formData.gender,
      birthday: formData.birthday,
      heightUnit: formData.heightUnit,
      weightUnit: formData.weightUnit,
    };

    try {
      await saveUserData(userData);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save data. Please try again.');
    }
  };

  const calculateAge = (birthday: string) => {
    if (!birthday) return '';
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.name.trim() !== '';
      case 1: return formData.gender !== '';
      case 2: return formData.birthday !== '';
      case 3: return formData.height.trim() !== '';
      case 4: return formData.weight.trim() !== '';
      case 5: return formData.activityLevel !== '';
      case 6: return formData.fitnessGoal !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholderTextColor="#666"
              autoFocus
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.genderContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.genderOption,
                    formData.gender === option.id && styles.genderOptionSelected
                  ]}
                  onPress={() => handleInputChange('gender', option.id)}
                >
                  <Feather 
                    name={option.icon as any} 
                    size={24} 
                    color={formData.gender === option.id ? '#4ADE80' : '#666'} 
                  />
                  <Text style={[
                    styles.genderText,
                    formData.gender === option.id && styles.genderTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <TouchableOpacity style={styles.birthdayInput}>
              <Feather name="calendar" size={20} color="#4ADE80" style={styles.inputIcon} />
              <TextInput
                style={styles.birthdayText}
                placeholder="Birthday"
                value={formData.birthday}
                onChangeText={(value) => handleInputChange('birthday', value)}
                placeholderTextColor="#666"
              />
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <TextInput
              style={styles.measurementInput}
              placeholder="Height"
              value={formData.height}
              onChangeText={(value) => handleInputChange('height', value)}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
            <View style={styles.unitSelector}>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  formData.heightUnit === 'cm' && styles.unitOptionSelected
                ]}
                onPress={() => handleInputChange('heightUnit', 'cm')}
              >
                <Text style={[
                  styles.unitText,
                  formData.heightUnit === 'cm' && styles.unitTextSelected
                ]}>cm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  formData.heightUnit === 'ft' && styles.unitOptionSelected
                ]}
                onPress={() => handleInputChange('heightUnit', 'ft')}
              >
                <Text style={[
                  styles.unitText,
                  formData.heightUnit === 'ft' && styles.unitTextSelected
                ]}>ft</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <TextInput
              style={styles.measurementInput}
              placeholder="Weight"
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
            <View style={styles.unitSelector}>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  formData.weightUnit === 'kg' && styles.unitOptionSelected
                ]}
                onPress={() => handleInputChange('weightUnit', 'kg')}
              >
                <Text style={[
                  styles.unitText,
                  formData.weightUnit === 'kg' && styles.unitTextSelected
                ]}>kg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  formData.weightUnit === 'lbs' && styles.unitOptionSelected
                ]}
                onPress={() => handleInputChange('weightUnit', 'lbs')}
              >
                <Text style={[
                  styles.unitText,
                  formData.weightUnit === 'lbs' && styles.unitTextSelected
                ]}>lbs</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.activityOption,
                  formData.activityLevel === level.id && styles.activityOptionSelected
                ]}
                onPress={() => handleInputChange('activityLevel', level.id)}
              >
                <View style={styles.activityContent}>
                  <Text style={[
                    styles.activityLabel,
                    formData.activityLevel === level.id && styles.activityLabelSelected
                  ]}>
                    {level.label}
                  </Text>
                  <Text style={[
                    styles.activityDescription,
                    formData.activityLevel === level.id && styles.activityDescriptionSelected
                  ]}>
                    {level.description}
                  </Text>
                </View>
                <TouchableOpacity style={styles.helpButton}>
                  <Feather name="help-circle" size={20} color="#666" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.goalsGrid}>
              {fitnessGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalOption,
                    formData.fitnessGoal === goal.id && styles.goalOptionSelected
                  ]}
                  onPress={() => handleInputChange('fitnessGoal', goal.id)}
                >
                  <Feather
                    name={goal.icon as any}
                    size={32}
                    color={formData.fitnessGoal === goal.id ? '#4ADE80' : '#666'}
                  />
                  <Text style={[
                    styles.goalLabel,
                    formData.fitnessGoal === goal.id && styles.goalLabelSelected
                  ]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.progressDots}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted
                ]}
              />
            ))}
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
          </View>

          {renderStep()}
        </Animated.View>

        {/* Next Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, !isStepValid() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isStepValid()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Complete' : 'NEXT'}
            </Text>
            <Feather name="chevron-right" size={20} color="#000" />
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#4ADE80',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: '#4ADE80',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  titleContainer: {
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
  },
  stepContainer: {
    flex: 1,
  },
  nameInput: {
    fontSize: 24,
    color: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#4ADE80',
    paddingVertical: 16,
    marginTop: 40,
  },
  genderContainer: {
    gap: 16,
    marginTop: 40,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  genderOptionSelected: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  genderText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 16,
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#4ADE80',
  },
  birthdayInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 16,
  },
  birthdayText: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
  },
  measurementInput: {
    fontSize: 24,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 40,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unitSelector: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  unitOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  unitOptionSelected: {
    backgroundColor: '#4ADE80',
  },
  unitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  unitTextSelected: {
    color: '#000',
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityOptionSelected: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  activityLabelSelected: {
    color: '#4ADE80',
  },
  activityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activityDescriptionSelected: {
    color: 'rgba(74, 222, 128, 0.8)',
  },
  helpButton: {
    padding: 8,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 40,
  },
  goalOption: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalOptionSelected: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  goalLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#4ADE80',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
});