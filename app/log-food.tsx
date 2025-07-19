import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { getFoodNutrition, FoodNutrition } from '@/utils/geminiApi';

interface FoodEntry {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  foods: Array<{
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function LogFoodScreen() {
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<Array<{
    nutrition: FoodNutrition;
    quantity: number;
    unit: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a food item to search');
      return;
    }

    setLoading(true);
    try {
      const nutrition = await getFoodNutrition(searchQuery);
      // Add to selected foods with default 100g quantity
      const newFood = {
        nutrition,
        quantity: 100,
        unit: 'g'
      };
      setSelectedFoods(prev => [...prev, newFood]);
      setSearchQuery('');
    } catch (error) {
      Alert.alert('Error', 'Failed to get nutrition information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFoodQuantity = (index: number, quantity: number) => {
    setSelectedFoods(prev => 
      prev.map((food, i) => 
        i === index ? { ...food, quantity } : food
      )
    );
  };

  const removeFoodItem = (index: number) => {
    setSelectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotalNutrition = () => {
    return selectedFoods.reduce((total, food) => {
      const multiplier = food.quantity / 100;
      return {
        calories: total.calories + (food.nutrition.calories * multiplier),
        protein: total.protein + (food.nutrition.protein * multiplier),
        carbs: total.carbs + (food.nutrition.carbs * multiplier),
        fat: total.fat + (food.nutrition.fat * multiplier),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleLogFood = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }

    const totalNutrition = calculateTotalNutrition();
    
    const entry: FoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      meal: selectedMeal,
      foods: selectedFoods.map(food => ({
        name: food.nutrition.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: Math.round(food.nutrition.calories * food.quantity / 100),
        protein: Math.round(food.nutrition.protein * food.quantity / 100 * 10) / 10,
        carbs: Math.round(food.nutrition.carbs * food.quantity / 100 * 10) / 10,
        fat: Math.round(food.nutrition.fat * food.quantity / 100 * 10) / 10,
      })),
      calories: Math.round(totalNutrition.calories),
      protein: Math.round(totalNutrition.protein * 10) / 10,
      carbs: Math.round(totalNutrition.carbs * 10) / 10,
      fat: Math.round(totalNutrition.fat * 10) / 10,
    };

    try {
      const existingEntries = await AsyncStorage.getItem('foodEntries');
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
      entries.push(entry);
      await AsyncStorage.setItem('foodEntries', JSON.stringify(entries));
      
      Alert.alert('Success', 'Food logged successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to log food. Please try again.');
    }
  };

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'breakfast': return 'sunrise';
      case 'lunch': return 'sun';
      case 'dinner': return 'moon';
      default: return 'coffee';
    }
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2d2d2d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={20} color="#4ADE80" />
          </TouchableOpacity>
          <Text style={styles.title}>Log Food</Text>
          <TouchableOpacity onPress={handleLogFood} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Meal Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Meal</Text>
            <View style={styles.mealSelector}>
              {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                <TouchableOpacity
                  key={meal}
                  style={[
                    styles.mealOption,
                    selectedMeal === meal && styles.mealOptionSelected
                  ]}
                  onPress={() => setSelectedMeal(meal)}
                >
                  <View style={styles.mealIconContainer}>
                    <Feather 
                      name={getMealIcon(meal)} 
                      size={14} 
                      color={selectedMeal === meal ? '#000000' : '#4ADE80'} 
                    />
                  </View>
                  <Text style={[
                    styles.mealOptionText,
                    selectedMeal === meal && styles.mealOptionTextSelected
                  ]}>
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Food Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Food</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter any food item..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity 
                style={styles.searchButton} 
                onPress={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Feather name="search" size={16} color="#000000" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Food */}
          {selectedFoods.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected Foods ({selectedFoods.length})</Text>
              
              {selectedFoods.map((food, index) => (
                <View key={index} style={styles.selectedFoodCard}>
                  <View style={styles.selectedFoodHeader}>
                    <Text style={styles.selectedFoodName}>{food.nutrition.name}</Text>
                    <TouchableOpacity onPress={() => removeFoodItem(index)}>
                      <Feather name="x" size={18} color="rgba(255, 255, 255, 0.7)" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Quantity (grams)</Text>
                    <TextInput
                      style={styles.quantityInput}
                      value={food.quantity.toString()}
                      onChangeText={(text) => updateFoodQuantity(index, parseFloat(text) || 0)}
                      keyboardType="decimal-pad"
                      placeholder="100"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                  </View>
                  
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {Math.round(food.nutrition.calories * food.quantity / 100)}
                      </Text>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {Math.round(food.nutrition.protein * food.quantity / 100 * 10) / 10}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {Math.round(food.nutrition.carbs * food.quantity / 100 * 10) / 10}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {Math.round(food.nutrition.fat * food.quantity / 100 * 10) / 10}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                    </View>
                  </View>
                </View>
              ))}
              
              {(() => {
                const total = calculateTotalNutrition();
                return (
                  <View style={styles.totalNutritionCard}>
                    <Text style={styles.totalTitle}>Total for {selectedMeal}</Text>
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{Math.round(total.calories)}</Text>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{Math.round(total.protein * 10) / 10}g</Text>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{Math.round(total.carbs * 10) / 10}g</Text>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{Math.round(total.fat * 10) / 10}g</Text>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                      </View>
                    </View>
                  </View>
                );
              })()}
            </View>
          )}

          {selectedFoods.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyText}>Search and add food items</Text>
              <Text style={styles.emptySubtext}>Add multiple foods to build your meal</Text>
            </View>
          )}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  mealSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 3,
  },
  mealOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 7,
    gap: 6,
  },
  mealOptionSelected: {
    backgroundColor: '#4ADE80',
  },
  mealIconContainer: {
    marginRight: 4,
  },
  mealOptionText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  mealOptionTextSelected: {
    color: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedFoodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  totalNutritionCard: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  totalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ADE80',
    marginBottom: 12,
    textAlign: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4ADE80',
  },
  nutritionLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quantityInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#FFFFFF',
    width: 80,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    textAlign: 'center',
  },
});