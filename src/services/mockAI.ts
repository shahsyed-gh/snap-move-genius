// Mock AI service for prototype demonstration
export interface AIAnalysisResult {
  name: string;
  confidence: number;
  category: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  estimated_value?: number;
  is_fragile: boolean;
  description?: string;
}

// Mock database of common household items
const mockItemDatabase = [
  { name: 'Wooden Dining Chair', category: 'furniture', condition: 'good', value: 150, fragile: false },
  { name: 'Samsung 55" Smart TV', category: 'electronics', condition: 'excellent', value: 800, fragile: true },
  { name: 'Kitchen Blender', category: 'appliances', condition: 'good', value: 120, fragile: true },
  { name: 'Leather Sofa', category: 'furniture', condition: 'excellent', value: 1200, fragile: false },
  { name: 'Coffee Table', category: 'furniture', condition: 'good', value: 300, fragile: false },
  { name: 'Microwave Oven', category: 'appliances', condition: 'good', value: 200, fragile: true },
  { name: 'Queen Size Mattress', category: 'furniture', condition: 'excellent', value: 600, fragile: false },
  { name: 'Desk Lamp', category: 'electronics', condition: 'good', value: 45, fragile: true },
  { name: 'Bookshelf', category: 'furniture', condition: 'good', value: 180, fragile: false },
  { name: 'Gaming Console', category: 'electronics', condition: 'excellent', value: 500, fragile: true },
  { name: 'Dining Table', category: 'furniture', condition: 'excellent', value: 800, fragile: false },
  { name: 'Refrigerator', category: 'appliances', condition: 'good', value: 1500, fragile: false },
  { name: 'Washing Machine', category: 'appliances', condition: 'good', value: 900, fragile: false },
  { name: 'Office Chair', category: 'furniture', condition: 'good', value: 250, fragile: false },
  { name: 'Floor Lamp', category: 'electronics', condition: 'good', value: 80, fragile: true },
  { name: 'Dresser', category: 'furniture', condition: 'excellent', value: 400, fragile: false },
  { name: 'Mirror', category: 'decor', condition: 'good', value: 100, fragile: true },
  { name: 'Toaster', category: 'appliances', condition: 'good', value: 60, fragile: false },
  { name: 'Laptop', category: 'electronics', condition: 'excellent', value: 1200, fragile: true },
  { name: 'Vacuum Cleaner', category: 'appliances', condition: 'good', value: 300, fragile: false }
];

const getRandomItems = (count: number = 2): AIAnalysisResult[] => {
  const shuffled = [...mockItemDatabase].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  
  return selected.map(item => ({
    name: item.name,
    confidence: Math.floor(Math.random() * 25) + 70, // 70-95% confidence
    category: item.category,
    condition: item.condition as AIAnalysisResult['condition'],
    estimated_value: item.value + Math.floor(Math.random() * 100) - 50, // Add some variance
    is_fragile: item.fragile,
    description: `AI detected ${item.name.toLowerCase()} with ${item.condition} condition`
  }));
};

export const analyzePhoto = async (photoFile: File): Promise<AIAnalysisResult[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  
  // Determine number of items to detect (1-3 items)
  const itemCount = Math.floor(Math.random() * 3) + 1;
  
  // Return mock analysis results
  return getRandomItems(itemCount);
};

export const getConfidenceBadgeStyle = (confidence: number) => {
  if (confidence >= 85) {
    return 'confidence-high';
  } else if (confidence >= 75) {
    return 'confidence-medium';
  }
  return 'confidence-low';
};

export const getConfidenceBadgeText = (confidence: number) => {
  if (confidence >= 85) {
    return 'High Confidence';
  } else if (confidence >= 75) {
    return 'Review Suggested';
  }
  return 'Verification Needed';
};