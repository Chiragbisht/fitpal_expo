import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchFood, FoodItem, getAllCategories } from '@/data/indianFoodData';

interface FoodEntry {
  id: string;
  date: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function LogFoodScreen() {
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const router = useRouter();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchFood(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchResults([]);
    setSearchQuery(food.name);
  };

  const handleLogFood = async () => {
    if (!selectedFood) {
      Alert.alert('Error', 'Please select a food item');
      return;
    }

    const multiplier = parseFloat(quantity) || 1;
    const entry: FoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      meal: selectedMeal,
      food: selectedFood.name,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * multiplier * 10) / 10,
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#007AFF" />
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
                    size={16} 
                    color={selectedMeal === meal ? '#FFFFFF' : '#007AFF'} 
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
            <Feather name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Indian foods..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#C6C6C8"
            />
          </View>

          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.foodItem}
                    onPress={() => handleFoodSelect(item)}
                  >
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodDetails}>
                        {item.calories} cal • {item.protein}g protein • {item.category}
                      </Text>
                    </View>
                    <Feather name="plus-circle" size={20} color="#007AFF" />
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* Selected Food */}
        {selectedFood && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Food</Text>
            <View style={styles.selectedFoodCard}>
              <View style={styles.selectedFoodHeader}>
                <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                <TouchableOpacity onPress={() => setSelectedFood(null)}>
                  <Feather name="x" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.nutritionInfo}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{Math.round(selectedFood.calories * parseFloat(quantity || '1'))}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{Math.round(selectedFood.protein * parseFloat(quantity || '1') * 10) / 10}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{Math.round(selectedFood.carbs * parseFloat(quantity || '1') * 10) / 10}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{Math.round(selectedFood.fat * parseFloat(quantity || '1') * 10) / 10}g</Text>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
              </View>

              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  placeholder="1"
                  placeholderTextColor="#C6C6C8"
                />
              </View>
            </View>
          </View>
        )}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  mealSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  mealOptionSelected: {
    backgroundColor: '#007AFF',
  },
  mealIconContainer: {
    marginRight: 8,
  },
  mealOptionText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  mealOptionTextSelected: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000000',
  },
  searchResults: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F7',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 13,
    color: '#8E8E93',
  },
  selectedFoodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedFoodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  quantityInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#000000',
    width: 80,
    textAlign: 'center',
  },
});