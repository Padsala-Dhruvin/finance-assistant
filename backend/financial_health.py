from datetime import datetime, timedelta
from typing import Dict, List, Any
import math

class FinancialHealthCalculator:
    def __init__(self):
        # Weight factors for different health components
        self.weights = {
            'spending_control': 0.25,
            'savings_rate': 0.25,
            'debt_management': 0.20,
            'emergency_fund': 0.15,
            'investment_diversity': 0.15
        }
        
        # Benchmarks for scoring
        self.benchmarks = {
            'emergency_fund_months': 6,  # 6 months of expenses
            'savings_rate_target': 0.20,  # 20% of income
            'debt_to_income_max': 0.36,   # 36% maximum
            'spending_variance_max': 0.5  # 50% variance acceptable
        }
    
    def calculate_comprehensive_health(self, expenses: List[Dict], income: float = None, 
                                     savings: float = 0, debt: float = 0, 
                                     investments: Dict = None) -> Dict[str, Any]:
        """
        Calculate comprehensive financial health score and breakdown
        """
        if not expenses:
            return {
                'overall_score': 0,
                'grade': 'F',
                'components': {},
                'recommendations': ['Start tracking your expenses to get a health score'],
                'status': 'No data available'
            }
        
        # Calculate individual components
        spending_score = self._calculate_spending_control(expenses)
        savings_score = self._calculate_savings_rate(expenses, income, savings)
        debt_score = self._calculate_debt_management(expenses, income, debt)
        emergency_score = self._calculate_emergency_fund(expenses, savings)
        investment_score = self._calculate_investment_diversity(investments)
        
        # Calculate weighted overall score
        overall_score = (
            spending_score * self.weights['spending_control'] +
            savings_score * self.weights['savings_rate'] +
            debt_score * self.weights['debt_management'] +
            emergency_score * self.weights['emergency_fund'] +
            investment_score * self.weights['investment_diversity']
        )
        
        # Determine grade
        grade = self._get_grade(overall_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations({
            'spending_control': spending_score,
            'savings_rate': savings_score,
            'debt_management': debt_score,
            'emergency_fund': emergency_score,
            'investment_diversity': investment_score
        })
        
        return {
            'overall_score': round(overall_score, 1),
            'grade': grade,
            'status': self._get_status(overall_score),
            'components': {
                'spending_control': {
                    'score': round(spending_score, 1),
                    'weight': self.weights['spending_control'],
                    'description': 'How well you control your spending'
                },
                'savings_rate': {
                    'score': round(savings_score, 1),
                    'weight': self.weights['savings_rate'],
                    'description': 'Percentage of income you save'
                },
                'debt_management': {
                    'score': round(debt_score, 1),
                    'weight': self.weights['debt_management'],
                    'description': 'How well you manage debt'
                },
                'emergency_fund': {
                    'score': round(emergency_score, 1),
                    'weight': self.weights['emergency_fund'],
                    'description': 'Emergency fund adequacy'
                },
                'investment_diversity': {
                    'score': round(investment_score, 1),
                    'weight': self.weights['investment_diversity'],
                    'description': 'Investment portfolio diversity'
                }
            },
            'recommendations': recommendations,
            'trend': self._calculate_trend(expenses)
        }
    
    def _calculate_spending_control(self, expenses: List[Dict]) -> float:
        """Calculate spending control score (0-100)"""
        if not expenses:
            return 0
        
        amounts = [exp['amount'] for exp in expenses]
        avg_amount = sum(amounts) / len(amounts)
        
        # Calculate variance
        variance = sum((amount - avg_amount) ** 2 for amount in amounts) / len(amounts)
        std_dev = math.sqrt(variance)
        coefficient_of_variation = std_dev / avg_amount if avg_amount > 0 else 1
        
        # Score based on consistency (lower variance = higher score)
        if coefficient_of_variation < 0.3:
            score = 100
        elif coefficient_of_variation < 0.5:
            score = 80
        elif coefficient_of_variation < 0.7:
            score = 60
        elif coefficient_of_variation < 1.0:
            score = 40
        else:
            score = 20
        
        # Bonus for low average spending
        if avg_amount < 50:
            score = min(100, score + 20)
        elif avg_amount > 200:
            score = max(0, score - 20)
        
        return score
    
    def _calculate_savings_rate(self, expenses: List[Dict], income: float, savings: float) -> float:
        """Calculate savings rate score (0-100)"""
        if not income or income <= 0:
            return 50  # Neutral score if no income data
        
        total_expenses = sum(exp['amount'] for exp in expenses)
        savings_rate = savings / income if income > 0 else 0
        
        # Score based on savings rate
        if savings_rate >= self.benchmarks['savings_rate_target']:
            score = 100
        elif savings_rate >= 0.15:
            score = 80
        elif savings_rate >= 0.10:
            score = 60
        elif savings_rate >= 0.05:
            score = 40
        else:
            score = 20
        
        # Bonus for increasing savings over time
        if savings > total_expenses * 0.5:
            score = min(100, score + 10)
        
        return score
    
    def _calculate_debt_management(self, expenses: List[Dict], income: float, debt: float) -> float:
        """Calculate debt management score (0-100)"""
        if not income or income <= 0:
            return 70  # Assume good if no debt data
        
        debt_to_income = debt / income if income > 0 else 0
        
        # Score based on debt-to-income ratio
        if debt_to_income == 0:
            score = 100
        elif debt_to_income <= 0.1:
            score = 90
        elif debt_to_income <= 0.2:
            score = 80
        elif debt_to_income <= 0.3:
            score = 60
        elif debt_to_income <= self.benchmarks['debt_to_income_max']:
            score = 40
        else:
            score = 20
        
        return score
    
    def _calculate_emergency_fund(self, expenses: List[Dict], savings: float) -> float:
        """Calculate emergency fund adequacy score (0-100)"""
        if not expenses:
            return 50
        
        monthly_expenses = sum(exp['amount'] for exp in expenses)
        emergency_months = savings / monthly_expenses if monthly_expenses > 0 else 0
        
        # Score based on emergency fund months
        if emergency_months >= self.benchmarks['emergency_fund_months']:
            score = 100
        elif emergency_months >= 4:
            score = 80
        elif emergency_months >= 2:
            score = 60
        elif emergency_months >= 1:
            score = 40
        else:
            score = 20
        
        return score
    
    def _calculate_investment_diversity(self, investments: Dict) -> float:
        """Calculate investment diversity score (0-100)"""
        if not investments:
            return 30  # Low score for no investments
        
        # Count different investment types
        investment_types = len(investments.keys())
        
        if investment_types >= 4:
            score = 100
        elif investment_types >= 3:
            score = 80
        elif investment_types >= 2:
            score = 60
        else:
            score = 40
        
        return score
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    def _get_status(self, score: float) -> str:
        """Get status description"""
        if score >= 90:
            return 'Excellent - Keep up the great work!'
        elif score >= 80:
            return 'Good - You\'re on the right track'
        elif score >= 70:
            return 'Fair - Room for improvement'
        elif score >= 60:
            return 'Poor - Consider making changes'
        else:
            return 'Critical - Immediate action needed'
    
    def _generate_recommendations(self, components: Dict[str, float]) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if components['spending_control'] < 70:
            recommendations.append("📊 Improve spending consistency by setting daily limits")
        
        if components['savings_rate'] < 70:
            recommendations.append("💰 Increase your savings rate to at least 20% of income")
        
        if components['debt_management'] < 70:
            recommendations.append("💳 Focus on reducing debt, especially high-interest debt")
        
        if components['emergency_fund'] < 70:
            recommendations.append("🛡️ Build an emergency fund covering 6 months of expenses")
        
        if components['investment_diversity'] < 70:
            recommendations.append("📈 Diversify your investments across different asset classes")
        
        if not recommendations:
            recommendations.append("🎉 Excellent financial health! Keep maintaining these good habits")
        
        return recommendations
    
    def _calculate_trend(self, expenses: List[Dict]) -> str:
        """Calculate spending trend over time"""
        if len(expenses) < 10:
            return "Insufficient data for trend analysis"
        
        # Sort by date and get recent vs older expenses
        sorted_expenses = sorted(expenses, key=lambda x: x['date'])
        mid_point = len(sorted_expenses) // 2
        
        recent_expenses = sorted_expenses[mid_point:]
        older_expenses = sorted_expenses[:mid_point]
        
        recent_avg = sum(exp['amount'] for exp in recent_expenses) / len(recent_expenses)
        older_avg = sum(exp['amount'] for exp in older_expenses) / len(older_expenses)
        
        if recent_avg < older_avg * 0.9:
            return "📉 Decreasing - Great job reducing expenses!"
        elif recent_avg > older_avg * 1.1:
            return "📈 Increasing - Consider reviewing your spending"
        else:
            return "➡️ Stable - Your spending is consistent"

# Global instance
health_calculator = FinancialHealthCalculator() 