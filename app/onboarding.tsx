import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Dimensions, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { saveUserData } from '@/utils/userData';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  FadeInUp,
  FadeInDown,
  SlideInRight,
  SlideOutLeft
} from 'react-native-reanimated';
import CalendarPicker from '@/components/CalendarPicker';

const { width, height } = Dimensions.get('window');

interface FormData {
  name: string;
  gender: string;
  birthday: Date | null;
  height: string;
  weight: string;
  heightUnit: 'cm' | 'ft';
  weightUnit: 'kg' | 'lbs';
  activityLevel: string;
  fitnessGoal: string;
}

const genderOptions = [
  { id: 'male', label: 'Male', icon: 'user' },
  { id: 'female', label: 'Female', icon: 'user' },
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
    birthday: null,
    height: '',
    weight: '',
    heightUnit: 'cm',
    weightUnit: 'kg',
    activityLevel: '',
    fitnessGoal: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const router = useRouter();

  const isMounted = useRef(false);

  const slideX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const steps = [
    { title: "What's your name?", subtitle: "We'll use this to personalize your experience" },
    { title: "Gender", subtitle: "What's your gender?" },
    { title: "Age", subtitle: "When is your birthday?" },
    { title: "Height", subtitle: "What's your current height?" },
    { title: "Weight", subtitle: "What's your current weight?" },
    { title: "Activity", subtitle: "How active are you? (without workouts)" },
    { title: "Goal", subtitle: "What's your fitness goal?" },
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const animateToNext = async () => {
    if (!isMounted.current) return;
    
    opacity.value = withTiming(0, { duration: 200 });
    slideX.value = withTiming(-width, { duration: 300 });
    
    setTimeout(() => {
      if (!isMounted.current) return;
      setCurrentStep(prev => prev + 1);
      slideX.value = width;
      slideX.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 300 });
    }, 300);
  };

  const animateToBack = async () => {
    if (!isMounted.current) return;
    
    opacity.value = withTiming(0, { duration: 200 });
    slideX.value = withTiming(width, { duration: 300 });
    
    setTimeout(() => {
      if (!isMounted.current) return;
      setCurrentStep(prev => prev - 1);
      slideX.value = -width;
      slideX.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 300 });
    }, 300);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideX.value }],
      opacity: opacity.value,
    };
  });

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
      birthday: formData.birthday?.toISOString() || '',
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

  const calculateAge = (birthday: Date | null) => {
    if (!birthday) return '';
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age.toString();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.name.trim() !== '';
      case 1: return formData.gender !== '';
      case 2: return formData.birthday !== null;
      case 3: return formData.height.trim() !== '';
      case 4: return formData.weight.trim() !== '';
      case 5: return formData.activityLevel !== '';
      case 6: return formData.fitnessGoal !== '';
      default: return false;
    }
  };

  const handleDateSelect = (selectedDate: Date) => {
    handleInputChange('birthday', selectedDate);
    setShowCalendar(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.stepContainer}>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              autoFocus
            />
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.stepContainer}>
            <View style={styles.genderContainer}>
              {genderOptions.map((option, index) => (
                <Animated.View
                  key={option.id}
                  entering={FadeInUp.delay(200 + index * 100)}
                >
                  <TouchableOpacity
                  style={[
                    styles.genderOption,
                    formData.gender === option.id && styles.genderOptionSelected
                  ]}
                  onPress={() => handleInputChange('gender', option.id)}
                >
                  <Feather 
                    name={option.icon as any} 
                    size={20} 
                    color={formData.gender === option.id ? '#4ADE80' : 'rgba(255, 255, 255, 0.7)'} 
                  />
                  <Text style={[
                    styles.genderText,
                    formData.gender === option.id && styles.genderTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.stepContainer}>
            <TouchableOpacity 
              style={[
                styles.birthdayInput,
                formData.birthday && { borderColor: '#4ADE80' }
              ]}
              onPress={() => setShowCalendar(true)}
            >
              <Feather name="calendar" size={18} color="#4ADE80" style={styles.inputIcon} />
              <Text style={[
                styles.birthdayText,
                formData.birthday && { color: '#4ADE80' }
              ]}>
                {formData.birthday ? formData.birthday.toLocaleDateString() : 'Select Birthday'}
              </Text>
            </TouchableOpacity>
            <CalendarPicker
              selectedDate={formData.birthday}
              onDateSelect={handleDateSelect}
              visible={showCalendar}
              onClose={() => setShowCalendar(false)}
            />
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.stepContainer}>
            <TextInput
              style={styles.measurementInput}
              placeholder="Height"
              value={formData.height}
              onChangeText={(value) => handleInputChange('height', value)}
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <Animated.View entering={FadeInUp.delay(200)} style={styles.unitSelector}>
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
            </Animated.View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.stepContainer}>
            <TextInput
              style={styles.measurementInput}
              placeholder="Weight"
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              keyboardType="numeric"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <Animated.View entering={FadeInUp.delay(200)} style={styles.unitSelector}>
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
            </Animated.View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.stepContainer}>
            {activityLevels.map((level, index) => (
              <Animated.View
                key={level.id}
                entering={FadeInUp.delay(200 + index * 100)}
              >
                <TouchableOpacity
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
                  <Feather name="help-circle" size={16} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.stepContainer}>
            <View style={styles.goalsGrid}>
              {fitnessGoals.map((goal, index) => (
                <Animated.View
                  key={goal.id}
                  entering={FadeInUp.delay(200 + index * 100)}
                >
                  <TouchableOpacity
                  style={[
                    styles.goalOption,
                    formData.fitnessGoal === goal.id && styles.goalOptionSelected
                  ]}
                  onPress={() => handleInputChange('fitnessGoal', goal.id)}
                >
                  <Feather
                    name={goal.icon as any}
                    size={24}
                    color={formData.fitnessGoal === goal.id ? '#4ADE80' : 'rgba(255, 255, 255, 0.7)'}
                  />
                  <Text style={[
                    styles.goalLabel,
                    formData.fitnessGoal === goal.id && styles.goalLabelSelected
                  ]}>
                    {goal.label}
                  </Text>
                </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
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
        <Animated.View entering={FadeInDown.delay(100)} style={styles.progressContainer}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={[styles.backButton, currentStep === 0 && styles.backButtonDisabled]}
            disabled={currentStep === 0}
          >
            <Feather name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.progressDots}>
            {steps.map((_, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.delay(300 + index * 50)}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted
                ]}
              />
            ))}
          </View>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.content, animatedStyle]}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.titleContainer}>
            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
          </Animated.View>

          {renderStep()}
        </Animated.View>

        {/* Next Button */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, !isStepValid() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isStepValid()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Complete' : 'NEXT'}
            </Text>
            <Feather name="chevron-right" size={16} color="#000" />
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonDisabled: {
    opacity: 0.3,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
  },
  progressDotActive: {
    backgroundColor: '#4ADE80',
    width: 20,
  },
  progressDotCompleted: {
    backgroundColor: '#4ADE80',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  stepContainer: {
    flex: 1,
  },
  nameInput: {
    fontSize: 20,
    color: '#fff',
    borderBottomWidth: 1.5,
    borderBottomColor: '#4ADE80',
    paddingVertical: 12,
    marginTop: 30,
  },
  genderContainer: {
    gap: 12,
    marginTop: 30,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    transform: [{ scale: 1 }],
  },
  genderOptionSelected: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    transform: [{ scale: 1.02 }],
  },
  genderText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#4ADE80',
  },
  birthdayInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  birthdayText: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  measurementInput: {
    fontSize: 20,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 30,
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unitSelector: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  unitOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    transform: [{ scale: 1 }],
  },
  unitOptionSelected: {
    backgroundColor: '#4ADE80',
    transform: [{ scale: 1.05 }],
  },
  unitText: {
    fontSize: 14,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    transform: [{ scale: 1 }],
  },
  activityOptionSelected: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    transform: [{ scale: 1.02 }],
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityLabelSelected: {
    color: '#4ADE80',
  },
  activityDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activityDescriptionSelected: {
    color: 'rgba(74, 222, 128, 0.8)',
  },
  helpButton: {
    padding: 6,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 30,
  },
  goalOption: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    transform: [{ scale: 1 }],
  },
  goalOptionSelected: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  goalLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#4ADE80',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  nextButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
});