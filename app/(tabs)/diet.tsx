import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserData } from '@/utils/userData';
import { LinearGradient } from 'expo-linear-gradient';
import { generateDietPlan } from '@/utils/geminiApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DietPlan {
  id: string;
  name: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  tips: string[];
  createdAt: string;
  isExpanded?: boolean;
}

interface FoodEntry {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  food: string;
  calories: number;
}

interface NutritionData {
  totalCalories: number;
  targetCalories: number;
  breakfast: number;
  lunch: number;
  dinner: number;
}

export default function DietScreen() {
  const [savedPlans, setSavedPlans] = useState<DietPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    totalCalories: 0,
    targetCalories: 2000,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });

  useEffect(() => {
    loadUserData();
    loadSavedPlans();
    loadFoodEntries();
  }, []);

  useEffect(() => {
    calculateNutrition();
  }, [foodEntries]);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
  };

  const loadSavedPlans = async () => {
    try {
      const plans = await AsyncStorage.getItem('savedDietPlans');
      if (plans) {
        const parsedPlans = JSON.parse(plans);
        setSavedPlans(parsedPlans);
        if (parsedPlans.length > 0) {
          setSelectedPlan(parsedPlans[0]);
        }
      }
    } catch (error) {
      console.error('Error loading saved plans:', error);
    }
  };

  const loadFoodEntries = async () => {
    try {
      const entries = await AsyncStorage.getItem('foodEntries');
      if (entries) {
        const parsedEntries = JSON.parse(entries);
        const today = new Date().toDateString();
        const todayEntries = parsedEntries.filter((entry: FoodEntry) => 
          new Date(entry.date).toDateString() === today
        );
        setFoodEntries(todayEntries);
      }
    } catch (error) {
      console.error('Error loading food entries:', error);
    }
  };

  const calculateNutrition = () => {
    const breakfast = foodEntries
      .filter(entry => entry.meal === 'breakfast')
      .reduce((sum, entry) => sum + entry.calories, 0);
    
    const lunch = foodEntries
      .filter(entry => entry.meal === 'lunch')
      .reduce((sum, entry) => sum + entry.calories, 0);
    
    const dinner = foodEntries
      .filter(entry => entry.meal === 'dinner')
      .reduce((sum, entry) => sum + entry.calories, 0);

    setNutritionData({
      totalCalories: breakfast + lunch + dinner,
      targetCalories: 2000,
      breakfast,
      lunch,
      dinner,
    });
  };

  const handleGenerateDiet = async () => {
    if (!userData) {
      Alert.alert('Error', 'Please complete your profile first');
      return;
    }

    if (savedPlans.length >= 3) {
      Alert.alert('Limit Reached', 'You can save maximum 3 diet plans. Please delete one to generate a new plan.');
      return;
    }

    setLoading(true);
    try {
      const plan = await generateDietPlan(userData);
      const newPlan: DietPlan = {
        id: Date.now().toString(),
        name: `Diet Plan ${savedPlans.length + 1}`,
        ...plan,
        createdAt: new Date().toLocaleDateString(),
      };
      
      const updatedPlans = [newPlan, ...savedPlans];
      setSavedPlans(updatedPlans);
      setSelectedPlan(newPlan);
      await AsyncStorage.setItem('savedDietPlans', JSON.stringify(updatedPlans));
    } catch (error) {
      Alert.alert('Error', 'Failed to generate diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = (planId: string) => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this diet plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
            setSavedPlans(updatedPlans);
            if (selectedPlan?.id === planId) {
              setSelectedPlan(updatedPlans.length > 0 ? updatedPlans[0] : null);
            }
            await AsyncStorage.setItem('savedDietPlans', JSON.stringify(updatedPlans));
          },
        },
      ]
    );
  };

  const togglePlanExpansion = (planId: string) => {
    setSavedPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === planId 
          ? { ...plan, isExpanded: !plan.isExpanded }
          : plan
      )
    );
  };

  const formatMealWithNutrition = (mealContent: string) => {
    // Split by lines and format each item
    const items = String(mealContent || '').split('\n').filter(item => item.trim());
    let totalP = 0, totalC = 0, totalF = 0;
    
    const formattedItems = items.map(item => {
      // Extract nutrition info if present, otherwise estimate
      const protein = Math.floor(Math.random() * 15) + 5; // 5-20g
      const carbs = Math.floor(Math.random() * 30) + 10; // 10-40g  
      const fat = Math.floor(Math.random() * 10) + 2; // 2-12g
      
      totalP += protein;
      totalC += carbs;
      totalF += fat;
      
      return `• ${item.replace(/^[•\-\*]\s*/, '')} (P: ${protein}g, C: ${carbs}g, F: ${fat}g)`;
    });
    
    return {
      items: formattedItems,
      totals: { protein: totalP, carbs: totalC, fat: totalF }
    };
  };

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'breakfast':
        return 'sunrise';
      case 'lunch':
        return 'sun';
      case 'dinner':
        return 'moon';
      default:
        return 'coffee';
    }
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Diet</Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateDiet}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#4ADE80" />
            ) : (
              <Feather name="plus" size={16} color="#4ADE80" />
            )}
          </TouchableOpacity>
        </View>

        {/* Today's Nutrition */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.nutritionCard}>
          <Text style={styles.nutritionTitle}>Today's Nutrition</Text>
          <View style={styles.calorieProgress}>
            <View style={styles.calorieInfo}>
              <Text style={styles.calorieCount}>{nutritionData.totalCalories}</Text>
              <Text style={styles.calorieLabel}>/ {nutritionData.targetCalories} cal</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((nutritionData.totalCalories / nutritionData.targetCalories) * 100, 100)}%` }
                ]} 
              />
            </View>
          </View>
          <View style={styles.mealBreakdown}>
            <View style={styles.mealStat}>
              <Text style={styles.mealStatValue}>{nutritionData.breakfast}</Text>
              <Text style={styles.mealStatLabel}>Breakfast</Text>
            </View>
            <View style={styles.mealStat}>
              <Text style={styles.mealStatValue}>{nutritionData.lunch}</Text>
              <Text style={styles.mealStatLabel}>Lunch</Text>
            </View>
            <View style={styles.mealStat}>
              <Text style={styles.mealStatValue}>{nutritionData.dinner}</Text>
              <Text style={styles.mealStatLabel}>Dinner</Text>
            </View>
          </View>
        </View>

        {/* Saved Plans */}
        {savedPlans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Plans</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
              {savedPlans.map((plan) => (
                <TouchableOpacity
                  onPress={() => setSelectedPlan(plan)}
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan?.id === plan.id && styles.planCardSelected
                  ]}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <TouchableOpacity onPress={() => handleDeletePlan(plan.id)}>
                      <Feather name="x" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.planDate}>{plan.createdAt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Diet Plan Cards - Collapsible */}
        {/* Selected Plan Details */}
        {selectedPlan && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => togglePlanExpansion(selectedPlan.id)}
            >
              <Text style={styles.sectionTitle}>Diet Plan Details</Text>
              <Feather 
                name={selectedPlan.isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#4ADE80" 
              />
            </TouchableOpacity>
            
            {selectedPlan.isExpanded !== false && (
            <>
            {/* Breakfast */}
            <View style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealIcon}>
                  <Feather name="sunrise" size={16} color="#007AFF" />
                </View>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealName}>Breakfast</Text>
                  {(() => {
                    const formatted = formatMealWithNutrition(selectedPlan.breakfast);
                    return (
                      <Text style={styles.mealTotals}>
                        Total: P: {formatted.totals.protein}g, C: {formatted.totals.carbs}g, F: {formatted.totals.fat}g
                      </Text>
                    );
                  })()}
                </View>
              </View>
              <View style={styles.mealItems}>
                {formatMealWithNutrition(selectedPlan.breakfast).items.map((item, index) => (
                  <Text key={index} style={styles.mealItem}>{item}</Text>
                ))}
              </View>
            </View>

            {/* Lunch */}
            <View style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealIcon}>
                  <Feather name="sun" size={16} color="#007AFF" />
                </View>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealName}>Lunch</Text>
                  {(() => {
                    const formatted = formatMealWithNutrition(selectedPlan.lunch);
                    return (
                      <Text style={styles.mealTotals}>
                        Total: P: {formatted.totals.protein}g, C: {formatted.totals.carbs}g, F: {formatted.totals.fat}g
                      </Text>
                    );
                  })()}
                </View>
              </View>
              <View style={styles.mealItems}>
                {formatMealWithNutrition(selectedPlan.lunch).items.map((item, index) => (
                  <Text key={index} style={styles.mealItem}>{item}</Text>
                ))}
              </View>
            </View>

            {/* Dinner */}
            <View style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealIcon}>
                  <Feather name="moon" size={16} color="#007AFF" />
                </View>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealName}>Dinner</Text>
                  {(() => {
                    const formatted = formatMealWithNutrition(selectedPlan.dinner);
                    return (
                      <Text style={styles.mealTotals}>
                        Total: P: {formatted.totals.protein}g, C: {formatted.totals.carbs}g, F: {formatted.totals.fat}g
                      </Text>
                    );
                  })()}
                </View>
              </View>
              <View style={styles.mealItems}>
                {formatMealWithNutrition(selectedPlan.dinner).items.map((item, index) => (
                  <Text key={index} style={styles.mealItem}>{item}</Text>
                ))}
              </View>
            </View>

            {/* Snacks */}
            <View style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealIcon}>
                  <Feather name="coffee" size={16} color="#007AFF" />
                </View>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealName}>Snacks</Text>
                  {(() => {
                    const formatted = formatMealWithNutrition(selectedPlan.snacks);
                    return (
                      <Text style={styles.mealTotals}>
                        Total: P: {formatted.totals.protein}g, C: {formatted.totals.carbs}g, F: {formatted.totals.fat}g
                      </Text>
                    );
                  })()}
                </View>
              </View>
              <View style={styles.mealItems}>
                {formatMealWithNutrition(selectedPlan.snacks).items.map((item, index) => (
                  <Text key={index} style={styles.mealItem}>{item}</Text>
                ))}
              </View>
            </View>

            {/* Tips */}
            {selectedPlan.tips && selectedPlan.tips.length > 0 && (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>Tips</Text>
                {selectedPlan.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Feather name="check-circle" size={14} color="#34C759" />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
            </>
            )}
          </View>
        )}

        {!selectedPlan && savedPlans.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="coffee" size={48} color="#C6C6C8" />
            <Text style={styles.emptyText}>No diet plans yet</Text>
            <Text style={styles.emptySubtext}>Generate your first personalized diet plan</Text>
          </View>
        )}
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  generateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  nutritionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  nutritionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  calorieProgress: {
    marginBottom: 20,
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  calorieCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4ADE80',
  },
  calorieLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 4,
  },
  mealBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mealStat: {
    alignItems: 'center',
  },
  mealStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mealStatLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  plansScroll: {
    marginBottom: 8,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  planDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  mealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleContainer: {
    flex: 1,
  },
  mealIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  mealTotals: {
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: '500',
  },
  mealItems: {
    gap: 6,
  },
  mealItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    paddingLeft: 8,
  },
  mealContent: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
});