import re
import json
from collections import Counter, defaultdict
from typing import Dict, List, Tuple

class ExpenseCategorizer:
    def __init__(self):
        # Predefined category keywords with weights
        self.category_keywords = {
            'Food': {
                'high_weight': ['restaurant', 'cafe', 'starbucks', 'mcdonalds', 'burger', 'pizza', 'sushi'],
                'medium_weight': ['grocery', 'supermarket', 'food', 'meal', 'lunch', 'dinner', 'breakfast'],
                'low_weight': ['coffee', 'snack', 'drink', 'takeout', 'delivery']
            },
            'Transport': {
                'high_weight': ['uber', 'lyft', 'taxi', 'parking', 'metro', 'subway', 'bus'],
                'medium_weight': ['gas', 'fuel', 'petrol', 'transport', 'commute', 'travel'],
                'low_weight': ['car', 'vehicle', 'transportation']
            },
            'Shopping': {
                'high_weight': ['amazon', 'walmart', 'target', 'ikea', 'nike', 'adidas', 'zara'],
                'medium_weight': ['clothing', 'shoes', 'electronics', 'furniture', 'appliances'],
                'low_weight': ['shop', 'store', 'mall', 'retail']
            },
            'Entertainment': {
                'high_weight': ['netflix', 'spotify', 'youtube', 'movie', 'cinema', 'concert', 'game'],
                'medium_weight': ['entertainment', 'fun', 'leisure', 'hobby', 'sport'],
                'low_weight': ['music', 'video', 'play']
            },
            'Bills': {
                'high_weight': ['electricity', 'water', 'internet', 'phone', 'rent', 'mortgage'],
                'medium_weight': ['bill', 'utility', 'service', 'subscription'],
                'low_weight': ['payment', 'charge', 'fee']
            },
            'Healthcare': {
                'high_weight': ['pharmacy', 'doctor', 'hospital', 'medical', 'dental', 'pharmacy'],
                'medium_weight': ['health', 'medicine', 'treatment', 'therapy'],
                'low_weight': ['wellness', 'fitness', 'gym']
            },
            'Education': {
                'high_weight': ['university', 'college', 'school', 'course', 'book', 'textbook'],
                'medium_weight': ['education', 'learning', 'training', 'workshop'],
                'low_weight': ['study', 'class', 'lecture']
            },
            'Travel': {
                'high_weight': ['hotel', 'airbnb', 'flight', 'airline', 'booking', 'trip'],
                'medium_weight': ['travel', 'vacation', 'holiday', 'tourism'],
                'low_weight': ['journey', 'adventure']
            }
        }
        
        # User corrections storage
        self.user_corrections = defaultdict(list)
        
    def categorize(self, description: str, user_id: str = None) -> Dict:
        """
        Categorize expense based on description
        
        Returns:
            Dict with category, confidence, and alternatives
        """
        description_lower = description.lower()
        scores = {}
        
        # Calculate scores for each category
        for category, keywords in self.category_keywords.items():
            score = 0
            
            # High weight keywords (3 points)
            for keyword in keywords['high_weight']:
                if keyword in description_lower:
                    score += 3
                    
            # Medium weight keywords (2 points)
            for keyword in keywords['medium_weight']:
                if keyword in description_lower:
                    score += 2
                    
            # Low weight keywords (1 point)
            for keyword in keywords['low_weight']:
                if keyword in description_lower:
                    score += 1
            
            scores[category] = score
        
        # Get top categories
        sorted_categories = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_category = sorted_categories[0][0]
        top_score = sorted_categories[0][1]
        
        # Calculate confidence (0-100)
        total_possible_score = max(len(self.category_keywords[cat]['high_weight']) * 3 + 
                                 len(self.category_keywords[cat]['medium_weight']) * 2 + 
                                 len(self.category_keywords[cat]['low_weight']) 
                                 for cat in self.category_keywords)
        
        confidence = min(100, (top_score / total_possible_score) * 100) if total_possible_score > 0 else 0
        
        # Get alternatives (categories with scores > 0)
        alternatives = [cat for cat, score in sorted_categories if score > 0 and cat != top_category][:3]
        
        return {
            'category': top_category if top_score > 0 else 'Other',
            'confidence': round(confidence, 1),
            'alternatives': alternatives,
            'scores': scores
        }
    
    def learn_from_correction(self, description: str, correct_category: str, user_id: str = None):
        """
        Learn from user corrections to improve future categorizations
        """
        # Store the correction
        self.user_corrections[description.lower()].append(correct_category)
        
        # You could implement more sophisticated learning here
        # For now, we'll just store the corrections
        
    def get_user_specific_category(self, description: str, user_id: str = None) -> str:
        """
        Get category based on user's previous corrections
        """
        description_lower = description.lower()
        
        # Check if we have a user correction for this description
        if description_lower in self.user_corrections:
            corrections = self.user_corrections[description_lower]
            # Return the most common correction
            return Counter(corrections).most_common(1)[0][0]
        
        return None

# Global instance
categorizer = ExpenseCategorizer() 