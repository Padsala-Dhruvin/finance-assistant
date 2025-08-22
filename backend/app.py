from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

# Import AI modules
from ai_categorizer import categorizer
from smart_suggestions import suggestions_engine
from financial_health import health_calculator
from budget_manager import budget_manager

app = Flask(__name__)
CORS(app)

# Database file
DB_FILE = 'db.json'

def load_db():
    """Load expenses from JSON file"""
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    return {"expenses": []}

def save_db(data):
    """Save expenses to JSON file"""
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def get_next_id(expenses):
    """Get next available ID for new expense"""
    if not expenses:
        return 1
    return max(expense.get('id', 0) for expense in expenses) + 1

@app.route('/expenses', methods=['GET'])
def get_expenses():
    """Get all expenses"""
    try:
        db = load_db()
        return jsonify(db['expenses'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/expenses', methods=['POST'])
def add_expense():
    """Add a new expense with AI categorization"""
    try:
        data = request.json
        db = load_db()
        
        # Validate required fields
        required_fields = ['amount', 'description', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # AI categorization
        description = data['description']
        categorization = categorizer.categorize(description)
        
        # Create new expense with AI-suggested category
        new_expense = {
            'id': get_next_id(db['expenses']),
            'amount': float(data['amount']),
            'category': data.get('category', categorization['category']),  # Use provided or AI-suggested
            'description': description,
            'date': data['date'],
            'timestamp': datetime.now().isoformat(),
            'ai_categorization': {
                'suggested_category': categorization['category'],
                'confidence': categorization['confidence'],
                'alternatives': categorization['alternatives']
            }
        }
        
        db['expenses'].append(new_expense)
        save_db(db)
        
        return jsonify(new_expense), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """Delete an expense by ID"""
    try:
        db = load_db()
        
        # Find and remove expense
        for i, expense in enumerate(db['expenses']):
            if expense.get('id') == expense_id:
                deleted_expense = db['expenses'].pop(i)
                save_db(db)
                return jsonify({"message": "Expense deleted", "expense": deleted_expense})
        
        return jsonify({"error": "Expense not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/expenses/<int:expense_id>/categorize', methods=['PUT'])
def recategorize_expense(expense_id):
    """Recategorize an expense and learn from correction"""
    try:
        data = request.json
        new_category = data.get('category')
        
        if not new_category:
            return jsonify({"error": "Missing category"}), 400
        
        db = load_db()
        
        # Find and update expense
        for expense in db['expenses']:
            if expense.get('id') == expense_id:
                # Learn from the correction
                categorizer.learn_from_correction(expense['description'], new_category)
                expense['category'] = new_category
                save_db(db)
                return jsonify(expense)
        
        return jsonify({"error": "Expense not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Removed receipt OCR endpoints

# Budget Management Endpoints
@app.route('/budget/income', methods=['GET', 'POST'])
def manage_income():
    """Get or set monthly income"""
    try:
        if request.method == 'POST':
            data = request.json
            income = data.get('income')
            if income is None:
                return jsonify({"error": "Missing income amount"}), 400
            
            result = budget_manager.set_monthly_income(float(income))
            return jsonify(result)
        else:
            data = budget_manager.load_budget_data()
            return jsonify({'monthly_income': data.get('monthly_income', 0)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/budget/fixed-costs', methods=['GET', 'POST', 'DELETE'])
def manage_fixed_costs():
    """Manage fixed costs"""
    try:
        if request.method == 'POST':
            data = request.json
            category = data.get('category')
            amount = data.get('amount')
            description = data.get('description', '')
            
            if not category or amount is None:
                return jsonify({"error": "Missing category or amount"}), 400
            
            result = budget_manager.add_fixed_cost(category, float(amount), description)
            return jsonify(result)
        
        elif request.method == 'DELETE':
            category = request.args.get('category')
            if not category:
                return jsonify({"error": "Missing category"}), 400
            
            result = budget_manager.remove_fixed_cost(category)
            return jsonify(result)
        
        else:
            data = budget_manager.load_budget_data()
            return jsonify({'fixed_costs': data.get('fixed_costs', {})})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/budget/savings-target', methods=['GET', 'POST'])
def manage_savings_target():
    """Get or set savings target percentage"""
    try:
        if request.method == 'POST':
            data = request.json
            percentage = data.get('percentage')
            if percentage is None:
                return jsonify({"error": "Missing percentage"}), 400
            
            result = budget_manager.set_savings_target(float(percentage))
            return jsonify(result)
        else:
            data = budget_manager.load_budget_data()
            return jsonify({'savings_target': data.get('savings_target', 0.2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/budget/summary', methods=['GET'])
def get_budget_summary():
    """Get comprehensive budget summary"""
    try:
        db = load_db()
        expenses = db['expenses']
        
        budget_summary = budget_manager.calculate_budget_summary(expenses)
        budget_alerts = budget_manager.get_budget_alerts(expenses)
        
        return jsonify({
            'budget_summary': budget_summary,
            'alerts': budget_alerts
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/budget/analysis', methods=['GET'])
def get_budget_analysis():
    """Get long-term budget analysis (3-4 months)"""
    try:
        db = load_db()
        expenses = db['expenses']
        
        months = request.args.get('months', type=int, default=4)
        spending_analysis = budget_manager.analyze_spending_patterns(expenses, months)
        savings_recommendations = budget_manager.generate_savings_recommendations(expenses)
        
        return jsonify({
            'spending_analysis': spending_analysis,
            'savings_recommendations': savings_recommendations
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/budget/recommendations', methods=['GET'])
def get_savings_recommendations():
    """Get AI-powered savings recommendations"""
    try:
        db = load_db()
        expenses = db['expenses']
        
        recommendations = budget_manager.generate_savings_recommendations(expenses)
        
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/budget/variable-expenses', methods=['GET'])
def get_variable_expenses():
    """Get variable expenses for the current month"""
    try:
        db = load_db()
        expenses = db['expenses']
        
        # Get current month
        current_month = datetime.now().strftime('%Y-%m')
        
        # Filter expenses for current month (excluding fixed costs)
        variable_expenses = []
        for expense in expenses:
            expense_date = expense.get('date', '')
            if expense_date.startswith(current_month):
                # Check if this is not a fixed cost category
                if expense.get('category') not in ['Rent', 'Mortgage', 'Electricity', 'Water', 'Internet', 'Phone', 'Insurance', 'Subscriptions', 'Loan Payments']:
                    variable_expenses.append(expense)
        
        return jsonify({
            'variable_expenses': variable_expenses,
            'month': current_month,
            'total_amount': sum(exp['amount'] for exp in variable_expenses)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/budget/investment-recommendations', methods=['GET'])
def get_investment_recommendations():
    """Get AI-powered investment recommendations with expected returns"""
    try:
        from market_data import get_market_recommendations
        db = load_db()
        expenses = db['expenses']
        
        # Get budget data for savings rate
        budget_data = budget_manager.load_budget_data()
        monthly_income = budget_data.get('monthly_income', 0)
        
        # Calculate current savings rate
        if monthly_income > 0:
            total_expenses = sum(exp['amount'] for exp in expenses)
            current_savings_rate = (monthly_income - total_expenses) / monthly_income
        else:
            current_savings_rate = 0.1  # Default 10%
        
        refresh = request.args.get('refresh', default='false').lower() == 'true'
        recommendations = get_market_recommendations(monthly_income, current_savings_rate, refresh=refresh)
        recommendations['savings_rate'] = round(current_savings_rate * 100, 2)
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    """Enhanced analyze endpoint with AI insights"""
    try:
        data = request.json
        expenses = data.get('expenses', [])
        categories = data.get('categories', [])
        income = data.get('income')

        if not expenses:
            return jsonify({"error": "No expenses to analyze"}), 400

        # Basic calculations
        total = sum(expenses)
        average = total / len(expenses) if expenses else 0

        # Category breakdown
        category_totals = {}
        for i, category in enumerate(categories):
            if category in category_totals:
                category_totals[category] += expenses[i]
            else:
                category_totals[category] = expenses[i]

        # Convert to expense objects for AI analysis
        expense_objects = []
        for i, amount in enumerate(expenses):
            expense_objects.append({
                'amount': amount,
                'category': categories[i] if i < len(categories) else 'Other',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'description': f'Expense {i+1}'
            })

        # Get AI insights
        insights = suggestions_engine.analyze_spending_patterns(expense_objects, income)
        
        # Get financial health score
        health_data = health_calculator.calculate_comprehensive_health(expense_objects, income)

        return jsonify({
            "total": round(total, 2),
            "average": round(average, 2),
            "categories": category_totals,
            "insights": insights['insights'],
            "suggestions": insights['suggestions'],
            "health_score": health_data['overall_score'],
            "health_grade": health_data['grade'],
            "health_status": health_data['status'],
            "health_recommendations": health_data['recommendations']
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai/insights', methods=['GET'])
def get_ai_insights():
    """Get comprehensive AI insights for all expenses"""
    try:
        db = load_db()
        expenses = db['expenses']
        
        if not expenses:
            return jsonify({
                "message": "No expenses to analyze",
                "insights": [],
                "suggestions": [],
                "health_score": 0
            })
        
        # Get income from request (you might want to store this in user profile)
        income = request.args.get('income', type=float)
        
        # Get AI insights
        insights = suggestions_engine.analyze_spending_patterns(expenses, income)
        
        # Get financial health
        health_data = health_calculator.calculate_comprehensive_health(expenses, income)
        
        # Get weekly report
        weekly_report = suggestions_engine.generate_weekly_report(expenses, income)
        
        # Get anomalies
        anomalies = suggestions_engine.detect_anomalies(expenses)
        
        return jsonify({
            "insights": insights['insights'],
            "suggestions": insights['suggestions'],
            "health_score": health_data['overall_score'],
            "health_grade": health_data['grade'],
            "health_status": health_data['status'],
            "health_components": health_data['components'],
            "health_recommendations": health_data['recommendations'],
            "health_trend": health_data['trend'],
            "weekly_report": weekly_report,
            "anomalies": anomalies,
            "total_expenses": len(expenses)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai/categorize', methods=['POST'])
def categorize_description():
    """Categorize a description using AI"""
    try:
        data = request.json
        description = data.get('description', '')
        
        if not description:
            return jsonify({"error": "Missing description"}), 400
        
        categorization = categorizer.categorize(description)
        
        return jsonify(categorization)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai/health', methods=['GET'])
def get_financial_health():
    """Get detailed financial health analysis"""
    try:
        db = load_db()
        expenses = db['expenses']
        
        # Get optional parameters
        income = request.args.get('income', type=float)
        savings = request.args.get('savings', type=float, default=0)
        debt = request.args.get('debt', type=float, default=0)
        
        health_data = health_calculator.calculate_comprehensive_health(
            expenses, income, savings, debt
        )
        
        return jsonify(health_data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get expense statistics with AI insights"""
    try:
        db = load_db()
        expenses = db['expenses']

        if not expenses:
            return jsonify({
                "total_expenses": 0,
                "average_expense": 0,
                "total_categories": 0,
                "most_expensive_category": None,
                "recent_expenses": [],
                "ai_insights": []
            })

        # Calculate totals
        total_amount = sum(exp['amount'] for exp in expenses)
        average_amount = total_amount / len(expenses)

        # Category analysis
        category_totals = {}
        for exp in expenses:
            cat = exp['category']
            category_totals[cat] = category_totals.get(cat, 0) + exp['amount']

        most_expensive_category = max(category_totals.items(), key=lambda x: x[1]) if category_totals else None

        # Recent expenses (last 5)
        recent_expenses = sorted(expenses, key=lambda x: x['timestamp'], reverse=True)[:5]

        # Get AI insights
        insights = suggestions_engine.analyze_spending_patterns(expenses)

        return jsonify({
            "total_expenses": round(total_amount, 2),
            "average_expense": round(average_amount, 2),
            "total_categories": len(category_totals),
            "most_expensive_category": most_expensive_category[0] if most_expensive_category else None,
            "category_breakdown": category_totals,
            "recent_expenses": recent_expenses,
            "ai_insights": insights['insights'][:3],  # Top 3 insights
            "ai_suggestions": insights['suggestions'][:3]  # Top 3 suggestions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
