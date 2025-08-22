from datetime import datetime, timedelta
from typing import Dict, List, Any
from collections import defaultdict
import json
import os

class BudgetManager:
    def __init__(self):
        self.budget_file = 'budget_data.json'
        self.fixed_costs_categories = [
            'Rent', 'Mortgage', 'Electricity', 'Water', 'Internet', 
            'Phone', 'Insurance', 'Subscriptions', 'Loan Payments'
        ]
        
    def load_budget_data(self) -> Dict:
        """Load budget data from JSON file"""
        if os.path.exists(self.budget_file):
            with open(self.budget_file, 'r') as f:
                return json.load(f)
        return {
            'monthly_income': 0,
            'fixed_costs': {},
            'budget_goals': {},
            'savings_target': 0.2,  # 20% default savings target
            'created_at': datetime.now().isoformat()
        }
    
    def save_budget_data(self, data: Dict):
        """Save budget data to JSON file"""
        with open(self.budget_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def set_monthly_income(self, income: float) -> Dict:
        """Set monthly income"""
        data = self.load_budget_data()
        data['monthly_income'] = income
        data['updated_at'] = datetime.now().isoformat()
        self.save_budget_data(data)
        return data
    
    def add_fixed_cost(self, category: str, amount: float, description: str = "") -> Dict:
        """Add or update a fixed cost"""
        data = self.load_budget_data()
        data['fixed_costs'][category] = {
            'amount': amount,
            'description': description,
            'added_at': datetime.now().isoformat()
        }
        data['updated_at'] = datetime.now().isoformat()
        self.save_budget_data(data)
        return data
    
    def remove_fixed_cost(self, category: str) -> Dict:
        """Remove a fixed cost"""
        data = self.load_budget_data()
        if category in data['fixed_costs']:
            del data['fixed_costs'][category]
            data['updated_at'] = datetime.now().isoformat()
            self.save_budget_data(data)
        return data
    
    def set_savings_target(self, percentage: float) -> Dict:
        """Set savings target percentage"""
        data = self.load_budget_data()
        data['savings_target'] = max(0, min(1, percentage))  # Ensure between 0-1
        data['updated_at'] = datetime.now().isoformat()
        self.save_budget_data(data)
        return data
    
    def calculate_budget_summary(self, expenses: List[Dict]) -> Dict[str, Any]:
        """Calculate comprehensive budget summary"""
        data = self.load_budget_data()
        monthly_income = data.get('monthly_income', 0)
        fixed_costs = data.get('fixed_costs', {})
        savings_target = data.get('savings_target', 0.2)
        
        # Calculate fixed costs total
        total_fixed_costs = sum(cost['amount'] for cost in fixed_costs.values())
        
        # Calculate variable expenses (from expense tracking)
        variable_expenses = sum(exp['amount'] for exp in expenses)
        
        # Calculate total expenses
        total_expenses = total_fixed_costs + variable_expenses
        
        # Calculate available for savings
        available_for_savings = monthly_income - total_expenses
        
        # Calculate savings rate
        savings_rate = (available_for_savings / monthly_income * 100) if monthly_income > 0 else 0
        
        # Calculate target savings amount
        target_savings = monthly_income * savings_target
        
        # Budget breakdown
        budget_breakdown = {
            'income': monthly_income,
            'fixed_costs': total_fixed_costs,
            'variable_expenses': variable_expenses,
            'total_expenses': total_expenses,
            'available_for_savings': available_for_savings,
            'savings_rate': savings_rate,
            'target_savings': target_savings,
            'savings_deficit': target_savings - available_for_savings
        }
        
        return budget_breakdown
    
    def analyze_spending_patterns(self, expenses: List[Dict], months: int = 4) -> Dict[str, Any]:
        """Analyze spending patterns over multiple months"""
        if not expenses:
            return {'message': 'No expenses to analyze'}
        
        # Group expenses by month
        monthly_expenses = defaultdict(list)
        for exp in expenses:
            date = datetime.fromisoformat(exp['date'])
            month_key = f"{date.year}-{date.month:02d}"
            monthly_expenses[month_key].append(exp)
        
        # Get last N months
        sorted_months = sorted(monthly_expenses.keys(), reverse=True)[:months]
        
        analysis = {
            'months_analyzed': len(sorted_months),
            'monthly_totals': {},
            'monthly_averages': {},
            'trends': {},
            'recommendations': []
        }
        
        # Calculate monthly totals and averages
        for month in sorted_months:
            month_expenses = monthly_expenses[month]
            total = sum(exp['amount'] for exp in month_expenses)
            analysis['monthly_totals'][month] = total
            analysis['monthly_averages'][month] = total / len(month_expenses) if month_expenses else 0
        
        # Analyze trends
        if len(sorted_months) >= 2:
            recent_total = analysis['monthly_totals'][sorted_months[0]]
            previous_total = analysis['monthly_totals'][sorted_months[1]]
            
            if recent_total > previous_total * 1.1:
                analysis['trends']['spending'] = 'increasing'
                analysis['recommendations'].append("⚠️ Your spending has increased. Review recent expenses.")
            elif recent_total < previous_total * 0.9:
                analysis['trends']['spending'] = 'decreasing'
                analysis['recommendations'].append("✅ Great! Your spending has decreased. Keep it up!")
            else:
                analysis['trends']['spending'] = 'stable'
                analysis['recommendations'].append("📊 Your spending is stable. Consider setting savings goals.")
        
        # Category analysis over time
        category_trends = defaultdict(list)
        for month in sorted_months:
            month_expenses = monthly_expenses[month]
            category_totals = defaultdict(float)
            for exp in month_expenses:
                category_totals[exp['category']] += exp['amount']
            category_trends[month] = dict(category_totals)
        
        analysis['category_trends'] = dict(category_trends)
        
        return analysis
    
    def generate_savings_recommendations(self, expenses: List[Dict]) -> Dict[str, Any]:
        """Generate AI-powered savings recommendations"""
        data = self.load_budget_data()
        budget_summary = self.calculate_budget_summary(expenses)
        
        recommendations = {
            'immediate_actions': [],
            'long_term_strategies': [],
            'potential_savings': 0,
            'priority_areas': []
        }
        
        # Check savings rate
        if budget_summary['savings_rate'] < 20:
            recommendations['immediate_actions'].append({
                'action': 'Increase savings rate',
                'description': f"Your savings rate is {budget_summary['savings_rate']:.1f}%. Aim for at least 20%.",
                'potential_impact': 'High',
                'estimated_savings': budget_summary['income'] * 0.05  # 5% increase
            })
        
        # Analyze variable expenses for reduction opportunities
        category_totals = defaultdict(float)
        for exp in expenses:
            category_totals[exp['category']] += exp['amount']
        
        # Find highest spending categories
        sorted_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        
        for category, amount in sorted_categories[:3]:
            if amount > budget_summary['income'] * 0.1:  # More than 10% of income
                recommendations['priority_areas'].append({
                    'category': category,
                    'amount': amount,
                    'percentage': (amount / budget_summary['income']) * 100,
                    'suggestion': f"Consider reducing {category} expenses by 20%"
                })
        
        # Fixed costs optimization
        fixed_costs = data.get('fixed_costs', {})
        for category, cost_data in fixed_costs.items():
            cost_amount = cost_data['amount']
            if cost_amount > budget_summary['income'] * 0.3:  # More than 30% of income
                recommendations['immediate_actions'].append({
                    'action': f'Review {category}',
                    'description': f"{category} costs {cost_amount:.2f}€ ({cost_amount/budget_summary['income']*100:.1f}% of income)",
                    'potential_impact': 'High',
                    'estimated_savings': cost_amount * 0.1  # 10% reduction
                })
        
        # Calculate total potential savings
        total_potential = sum(rec.get('estimated_savings', 0) for rec in recommendations['immediate_actions'])
        recommendations['potential_savings'] = total_potential
        
        # Long-term strategies
        if budget_summary['savings_rate'] < 15:
            recommendations['long_term_strategies'].extend([
                "Set up automatic savings transfers",
                "Create an emergency fund (3-6 months of expenses)",
                "Consider side income opportunities",
                "Review and optimize all subscriptions"
            ])
        
        return recommendations
    
    def get_budget_alerts(self, expenses: List[Dict]) -> List[Dict]:
        """Get budget alerts and warnings"""
        data = self.load_budget_data()
        budget_summary = self.calculate_budget_summary(expenses)
        alerts = []
        
        # Low savings rate alert
        if budget_summary['savings_rate'] < 10:
            alerts.append({
                'type': 'warning',
                'title': 'Low Savings Rate',
                'message': f"Your savings rate is {budget_summary['savings_rate']:.1f}%. Consider increasing it to at least 20%.",
                'severity': 'high'
            })
        
        # Overspending alert
        if budget_summary['available_for_savings'] < 0:
            alerts.append({
                'type': 'danger',
                'title': 'Overspending',
                'message': f"You're spending {abs(budget_summary['available_for_savings']):.2f}€ more than your income.",
                'severity': 'critical'
            })
        
        # High fixed costs alert
        fixed_costs_percentage = (budget_summary['fixed_costs'] / budget_summary['income']) * 100 if budget_summary['income'] > 0 else 0
        if fixed_costs_percentage > 50:
            alerts.append({
                'type': 'warning',
                'title': 'High Fixed Costs',
                'message': f"Fixed costs are {fixed_costs_percentage:.1f}% of your income. Consider reducing them.",
                'severity': 'medium'
            })
        
        return alerts

# Global instance
budget_manager = BudgetManager() 