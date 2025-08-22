import json
from datetime import datetime, timedelta
from collections import defaultdict
from typing import List, Dict, Any

class SmartSuggestions:
    def __init__(self):
        # Spending benchmarks (monthly averages in EUR)
        self.benchmarks = {
            'Food': 300,
            'Transport': 150,
            'Shopping': 200,
            'Entertainment': 100,
            'Bills': 400,
            'Healthcare': 80,
            'Education': 150,
            'Travel': 300,
            'Other': 100
        }
        
        # Spending thresholds for alerts
        self.thresholds = {
            'high_spending': 0.8,  # 80% of income
            'category_alert': 0.4,  # 40% of total spending
            'unusual_spending': 2.0,  # 2x average
            'savings_target': 0.2   # 20% of income
        }
    
    def analyze_spending_patterns(self, expenses: List[Dict], income: float = None) -> Dict[str, Any]:
        """
        Analyze spending patterns and generate insights
        """
        if not expenses:
            return {
                'insights': ['No expenses to analyze'],
                'suggestions': ['Start tracking your expenses to get personalized insights'],
                'health_score': 0
            }
        
        # Calculate basic metrics
        total_spending = sum(exp['amount'] for exp in expenses)
        avg_spending = total_spending / len(expenses)
        
        # Category analysis
        category_totals = defaultdict(float)
        category_counts = defaultdict(int)
        
        for exp in expenses:
            category = exp['category']
            category_totals[category] += exp['amount']
            category_counts[category] += 1
        
        # Calculate insights and suggestions
        insights = []
        suggestions = []
        
        # 1. Overall spending analysis
        if income:
            spending_ratio = total_spending / income
            if spending_ratio > self.thresholds['high_spending']:
                insights.append(f"⚠️ You're spending {spending_ratio:.1%} of your income")
                suggestions.append("Consider reducing expenses or increasing income")
            elif spending_ratio < 0.5:
                insights.append(f"✅ Great! You're spending only {spending_ratio:.1%} of your income")
                suggestions.append("Consider investing your savings for better returns")
        
        # 2. Average spending analysis
        if avg_spending > 200:
            insights.append(f"📊 Your average expense is €{avg_spending:.2f}")
            suggestions.append("Consider setting a daily spending limit of €50-100")
        elif avg_spending < 50:
            insights.append(f"📊 Your average expense is €{avg_spending:.2f}")
            suggestions.append("Your spending is well-controlled. Keep it up!")
        
        # 3. Category-specific analysis
        highest_category = max(category_totals.items(), key=lambda x: x[1])
        highest_percentage = (highest_category[1] / total_spending) * 100
        
        if highest_percentage > self.thresholds['category_alert'] * 100:
            insights.append(f"🎯 {highest_category[0]} accounts for {highest_percentage:.1f}% of your spending")
            suggestions.append(f"Look for ways to reduce {highest_category[0]} expenses")
        
        # 4. Compare with benchmarks
        for category, amount in category_totals.items():
            if category in self.benchmarks:
                benchmark = self.benchmarks[category]
                ratio = amount / benchmark
                
                if ratio > self.thresholds['unusual_spending']:
                    insights.append(f"🚨 {category} spending is {ratio:.1f}x above average")
                    suggestions.append(f"Review your {category} expenses for potential savings")
                elif ratio < 0.5:
                    insights.append(f"✅ {category} spending is {ratio:.1f}x below average")
        
        # 5. Frequency analysis
        frequent_categories = [cat for cat, count in category_counts.items() if count > 5]
        if frequent_categories:
            insights.append(f"🔄 You frequently spend on: {', '.join(frequent_categories)}")
            suggestions.append("Consider setting up recurring budget limits for these categories")
        
        # 6. Savings opportunities
        if income and total_spending < income * 0.7:
            potential_savings = income * 0.2
            insights.append(f"💰 You could save €{potential_savings:.2f} monthly")
            suggestions.append("Set up automatic savings transfers")
        
        return {
            'insights': insights,
            'suggestions': suggestions,
            'health_score': self._calculate_health_score(expenses, income),
            'category_breakdown': dict(category_totals),
            'total_spending': total_spending,
            'average_spending': avg_spending
        }
    
    def _calculate_health_score(self, expenses: List[Dict], income: float = None) -> int:
        """
        Calculate financial health score (0-100)
        """
        if not expenses:
            return 0
        
        score = 0
        total_spending = sum(exp['amount'] for exp in expenses)
        
        # 1. Spending consistency (25 points)
        amounts = [exp['amount'] for exp in expenses]
        avg_amount = sum(amounts) / len(amounts)
        variance = sum((amount - avg_amount) ** 2 for amount in amounts) / len(amounts)
        consistency_score = max(0, 25 - (variance / 1000))
        score += consistency_score
        
        # 2. Category diversity (25 points)
        categories = set(exp['category'] for exp in expenses)
        diversity_score = min(25, len(categories) * 3)
        score += diversity_score
        
        # 3. Income ratio (25 points) - if income provided
        if income:
            spending_ratio = total_spending / income
            if spending_ratio < 0.5:
                ratio_score = 25
            elif spending_ratio < 0.7:
                ratio_score = 20
            elif spending_ratio < 0.8:
                ratio_score = 15
            else:
                ratio_score = max(0, 25 - (spending_ratio - 0.8) * 100)
            score += ratio_score
        
        # 4. Spending control (25 points)
        large_expenses = sum(1 for exp in expenses if exp['amount'] > 200)
        control_score = max(0, 25 - large_expenses * 2)
        score += control_score
        
        return min(100, int(score))
    
    def generate_weekly_report(self, expenses: List[Dict], income: float = None) -> Dict[str, Any]:
        """
        Generate a weekly spending report with insights
        """
        # Filter expenses from last 7 days
        week_ago = datetime.now() - timedelta(days=7)
        recent_expenses = [
            exp for exp in expenses 
            if datetime.fromisoformat(exp['date']) >= week_ago
        ]
        
        if not recent_expenses:
            return {
                'message': 'No expenses in the last 7 days',
                'total': 0,
                'insights': ['Start tracking your daily expenses']
            }
        
        total_weekly = sum(exp['amount'] for exp in recent_expenses)
        daily_average = total_weekly / 7
        
        insights = []
        if daily_average > 50:
            insights.append(f"📈 Daily average: €{daily_average:.2f}")
            insights.append("Consider reducing daily spending")
        else:
            insights.append(f"✅ Good daily average: €{daily_average:.2f}")
        
        # Most expensive day
        daily_totals = defaultdict(float)
        for exp in recent_expenses:
            day = exp['date']
            daily_totals[day] += exp['amount']
        
        if daily_totals:
            most_expensive_day = max(daily_totals.items(), key=lambda x: x[1])
            insights.append(f"💸 Most expensive day: {most_expensive_day[0]} (€{most_expensive_day[1]:.2f})")
        
        return {
            'total': total_weekly,
            'daily_average': daily_average,
            'insights': insights,
            'expense_count': len(recent_expenses)
        }
    
    def detect_anomalies(self, expenses: List[Dict]) -> List[Dict]:
        """
        Detect unusual spending patterns
        """
        if len(expenses) < 5:
            return []
        
        anomalies = []
        amounts = [exp['amount'] for exp in expenses]
        avg_amount = sum(amounts) / len(amounts)
        
        # Calculate standard deviation
        variance = sum((amount - avg_amount) ** 2 for amount in amounts) / len(amounts)
        std_dev = variance ** 0.5
        
        # Detect outliers (2 standard deviations from mean)
        for exp in expenses:
            if abs(exp['amount'] - avg_amount) > 2 * std_dev:
                anomalies.append({
                    'expense': exp,
                    'reason': f"Amount (€{exp['amount']:.2f}) is significantly different from average (€{avg_amount:.2f})",
                    'severity': 'high' if abs(exp['amount'] - avg_amount) > 3 * std_dev else 'medium'
                })
        
        return anomalies

# Global instance
suggestions_engine = SmartSuggestions() 