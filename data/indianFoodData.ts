export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: string;
}

export const indianFoodDatabase: FoodItem[] = [
  // Rice & Grains
  { name: "Basmati Rice (1 cup cooked)", calories: 210, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, category: "Grains" },
  { name: "Brown Rice (1 cup cooked)", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, category: "Grains" },
  { name: "Quinoa (1 cup cooked)", calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5, category: "Grains" },
  { name: "Roti (1 medium)", calories: 104, protein: 3.5, carbs: 18, fat: 2.5, fiber: 2.7, category: "Grains" },
  { name: "Naan (1 piece)", calories: 262, protein: 9, carbs: 45, fat: 5, fiber: 2, category: "Grains" },
  { name: "Paratha (1 medium)", calories: 126, protein: 3, carbs: 18, fat: 4.5, fiber: 2.5, category: "Grains" },
  
  // Dals & Legumes
  { name: "Moong Dal (1 cup cooked)", calories: 212, protein: 14.2, carbs: 38.7, fat: 0.8, fiber: 15.4, category: "Legumes" },
  { name: "Toor Dal (1 cup cooked)", calories: 203, protein: 11.4, carbs: 37, fat: 0.7, fiber: 11.8, category: "Legumes" },
  { name: "Chana Dal (1 cup cooked)", calories: 269, protein: 12.8, carbs: 45, fat: 4.3, fiber: 12.2, category: "Legumes" },
  { name: "Masoor Dal (1 cup cooked)", calories: 230, protein: 17.9, carbs: 39.9, fat: 0.8, fiber: 15.6, category: "Legumes" },
  { name: "Rajma (1 cup cooked)", calories: 245, protein: 15, carbs: 45, fat: 1, fiber: 13.1, category: "Legumes" },
  { name: "Chole (1 cup)", calories: 269, protein: 14.5, carbs: 45, fat: 4.3, fiber: 12.5, category: "Legumes" },
  
  // Vegetables
  { name: "Aloo Sabzi (1 cup)", calories: 134, protein: 3.1, carbs: 31, fat: 0.1, fiber: 2.9, category: "Vegetables" },
  { name: "Bhindi Sabzi (1 cup)", calories: 33, protein: 1.9, carbs: 7.5, fat: 0.2, fiber: 3.2, category: "Vegetables" },
  { name: "Palak Sabzi (1 cup)", calories: 41, protein: 5.4, carbs: 6.8, fat: 0.7, fiber: 4.3, category: "Vegetables" },
  { name: "Gobi Sabzi (1 cup)", calories: 29, protein: 2.3, carbs: 5.9, fat: 0.3, fiber: 2.5, category: "Vegetables" },
  { name: "Baingan Bharta (1 cup)", calories: 88, protein: 2.5, carbs: 16, fat: 2.3, fiber: 6.6, category: "Vegetables" },
  { name: "Karela Sabzi (1 cup)", calories: 24, protein: 2.6, carbs: 4.3, fat: 0.2, fiber: 2.6, category: "Vegetables" },
  
  // Meat & Fish
  { name: "Chicken Curry (1 cup)", calories: 219, protein: 25.9, carbs: 5.1, fat: 10.9, fiber: 1.4, category: "Meat" },
  { name: "Mutton Curry (1 cup)", calories: 292, protein: 25.6, carbs: 3.9, fat: 19.3, fiber: 1.2, category: "Meat" },
  { name: "Fish Curry (1 cup)", calories: 158, protein: 22.1, carbs: 4.2, fat: 5.7, fiber: 1.1, category: "Fish" },
  { name: "Tandoori Chicken (100g)", calories: 150, protein: 27.3, carbs: 0, fat: 4.1, fiber: 0, category: "Meat" },
  { name: "Grilled Fish (100g)", calories: 128, protein: 25.4, carbs: 0, fat: 2.9, fiber: 0, category: "Fish" },
  
  // Dairy
  { name: "Paneer (100g)", calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0, category: "Dairy" },
  { name: "Curd (1 cup)", calories: 98, protein: 11, carbs: 12, fat: 0.4, fiber: 0, category: "Dairy" },
  { name: "Milk (1 cup)", calories: 103, protein: 8, carbs: 12, fat: 2.4, fiber: 0, category: "Dairy" },
  { name: "Lassi (1 glass)", calories: 108, protein: 2.5, carbs: 12, fat: 5.5, fiber: 0, category: "Dairy" },
  
  // Snacks
  { name: "Samosa (1 piece)", calories: 308, protein: 5.1, carbs: 28, fat: 19.6, fiber: 2.4, category: "Snacks" },
  { name: "Pakora (5 pieces)", calories: 157, protein: 4.1, carbs: 13, fat: 10.1, fiber: 2.1, category: "Snacks" },
  { name: "Dhokla (2 pieces)", calories: 160, protein: 4, carbs: 27, fat: 4, fiber: 2, category: "Snacks" },
  { name: "Idli (2 pieces)", calories: 78, protein: 2, carbs: 17, fat: 0.2, fiber: 0.8, category: "Snacks" },
  { name: "Dosa (1 medium)", calories: 168, protein: 4, carbs: 28, fat: 4, fiber: 1.2, category: "Snacks" },
  { name: "Upma (1 cup)", calories: 183, protein: 4.4, carbs: 32, fat: 4.6, fiber: 1.9, category: "Snacks" },
  
  // Fruits
  { name: "Apple (1 medium)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, category: "Fruits" },
  { name: "Banana (1 medium)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, category: "Fruits" },
  { name: "Mango (1 cup sliced)", calories: 107, protein: 1, carbs: 28, fat: 0.5, fiber: 3, category: "Fruits" },
  { name: "Orange (1 medium)", calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1, category: "Fruits" },
  { name: "Papaya (1 cup)", calories: 55, protein: 0.9, carbs: 14, fat: 0.2, fiber: 2.5, category: "Fruits" },
  
  // Beverages
  { name: "Chai (1 cup)", calories: 40, protein: 1.5, carbs: 6, fat: 1.5, fiber: 0, category: "Beverages" },
  { name: "Coffee (1 cup)", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, category: "Beverages" },
  { name: "Fresh Lime Water (1 glass)", calories: 25, protein: 0.1, carbs: 6.5, fat: 0, fiber: 0.1, category: "Beverages" },
  { name: "Coconut Water (1 cup)", calories: 46, protein: 1.7, carbs: 8.9, fat: 0.5, fiber: 2.6, category: "Beverages" },
];

export const searchFood = (query: string): FoodItem[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return indianFoodDatabase.filter(food => 
    food.name.toLowerCase().includes(searchTerm) ||
    food.category.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Limit to 10 results
};

export const getFoodByCategory = (category: string): FoodItem[] => {
  return indianFoodDatabase.filter(food => food.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(indianFoodDatabase.map(food => food.category))];
};