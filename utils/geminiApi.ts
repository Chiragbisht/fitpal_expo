import { UserData } from './userData';

const GEMINI_API_KEY = 'AIzaSyAZ5xbVTgX4_6DtIZHSMtWljf6GtCPZjaE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface DietPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  tips: string[];
}

export interface FoodNutrition {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving_size: string;
}

export const generateDietPlan = async (userData: UserData): Promise<DietPlan> => {
  try {
    const prompt = `
Create a personalized Indian diet plan for:
- Age: ${userData.age}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Workout frequency: ${userData.workoutLevel} times per week
- Fitness goal: ${userData.fitnessGoal}

Please provide a detailed Indian diet plan with:
1. Breakfast suggestion
2. Lunch suggestion
3. Dinner suggestion
4. Healthy snack options
5. 3-4 helpful tips

Make it specific to Indian cuisine and ingredients. Keep portions appropriate for the fitness goal.
Format the response as a JSON object with the following structure:
{
  "breakfast": "detailed breakfast suggestion",
  "lunch": "detailed lunch suggestion", 
  "dinner": "detailed dinner suggestion",
  "snacks": "healthy snack options",
  "tips": ["tip1", "tip2", "tip3", "tip4"]
}
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    
    // Clean up the response to extract JSON
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Could not find valid JSON in response');
    }
    
    const jsonString = content.substring(jsonStart, jsonEnd);
    const dietPlan = JSON.parse(jsonString);
    
    // Validate the structure
    if (!dietPlan.breakfast || !dietPlan.lunch || !dietPlan.dinner || !dietPlan.snacks || !dietPlan.tips) {
      throw new Error('Invalid diet plan structure');
    }
    
    return dietPlan;
  } catch (error) {
    console.error('Error generating diet plan:', error);
    throw new Error('Failed to generate diet plan. Please try again.');
  }
};

export const getFoodNutrition = async (foodName: string): Promise<FoodNutrition> => {
  try {
    const prompt = `
Provide detailed nutritional information for: "${foodName}"

Please analyze this food item and provide accurate nutritional data per 100g serving.
If it's a prepared dish, estimate based on typical ingredients and preparation methods.

Format the response as a JSON object with the following structure:
{
  "name": "standardized food name",
  "calories": number (per 100g),
  "protein": number (grams per 100g),
  "carbs": number (grams per 100g),
  "fat": number (grams per 100g),
  "fiber": number (grams per 100g),
  "serving_size": "typical serving size description"
}

Be as accurate as possible with the nutritional values.
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    
    // Clean up the response to extract JSON
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Could not find valid JSON in response');
    }
    
    const jsonString = content.substring(jsonStart, jsonEnd);
    const nutrition = JSON.parse(jsonString);
    
    // Validate the structure
    if (!nutrition.name || typeof nutrition.calories !== 'number' || 
        typeof nutrition.protein !== 'number' || typeof nutrition.carbs !== 'number' || 
        typeof nutrition.fat !== 'number') {
      throw new Error('Invalid nutrition data structure');
    }
    
    return nutrition;
  } catch (error) {
    console.error('Error getting food nutrition:', error);
    throw new Error('Failed to get nutrition information. Please try again.');
  }
};