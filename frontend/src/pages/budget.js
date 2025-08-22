import React, { useState, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';

export default function Budget() {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [savingsTarget, setSavingsTarget] = useState(20);
  const [fixedCosts, setFixedCosts] = useState({});
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [savingsRecommendations, setSavingsRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newFixedCost, setNewFixedCost] = useState({ category: '', amount: '', description: '' });
  const [showVariableExpenses, setShowVariableExpenses] = useState(false);
  const [variableExpenses, setVariableExpenses] = useState([]);
  const [investmentRecommendations, setInvestmentRecommendations] = useState(null);

  const fixedCostCategories = [
    'Rent', 'Mortgage', 'Electricity', 'Water', 'Internet', 
    'Phone', 'Insurance', 'Subscriptions', 'Loan Payments'
  ];

  // Load budget data on component mount
  useEffect(() => {
    loadBudgetData();
    loadBudgetSummary();
    loadBudgetAnalysis();
    loadSavingsRecommendations();
    loadInvestmentRecommendations();
    loadVariableExpenses();
  }, []);

  const loadBudgetData = async () => {
    try {
      // Load income
      const incomeResponse = await fetch('http://127.0.0.1:5000/budget/income');
      if (incomeResponse.ok) {
        const incomeData = await incomeResponse.json();
        setMonthlyIncome(incomeData.monthly_income || '');
      }

      // Load fixed costs
      const fixedCostsResponse = await fetch('http://127.0.0.1:5000/budget/fixed-costs');
      if (fixedCostsResponse.ok) {
        const fixedCostsData = await fixedCostsResponse.json();
        setFixedCosts(fixedCostsData.fixed_costs || {});
      }

      // Load savings target
      const savingsResponse = await fetch('http://127.0.0.1:5000/budget/savings-target');
      if (savingsResponse.ok) {
        const savingsData = await savingsResponse.json();
        setSavingsTarget((savingsData.savings_target || 0.2) * 100);
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const loadBudgetSummary = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/budget/summary');
      if (response.ok) {
        const data = await response.json();
        setBudgetSummary(data);
      }
    } catch (error) {
      console.error('Error loading budget summary:', error);
    }
  };

  const loadBudgetAnalysis = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/budget/analysis?months=4');
      if (response.ok) {
        const data = await response.json();
        setBudgetAnalysis(data);
      }
    } catch (error) {
      console.error('Error loading budget analysis:', error);
    }
  };

  const loadSavingsRecommendations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/budget/recommendations');
      if (response.ok) {
        const data = await response.json();
        setSavingsRecommendations(data);
      }
    } catch (error) {
      console.error('Error loading savings recommendations:', error);
    }
  };

  const loadInvestmentRecommendations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/budget/investment-recommendations');
      if (response.ok) {
        const data = await response.json();
        setInvestmentRecommendations(data);
      }
    } catch (error) {
      console.error('Error loading investment recommendations:', error);
    }
  };

  const loadVariableExpenses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/budget/variable-expenses');
      if (response.ok) {
        const data = await response.json();
        setVariableExpenses(data.variable_expenses || []);
      }
    } catch (error) {
      console.error('Error loading variable expenses:', error);
    }
  };

  const toggleVariableExpenses = () => {
    if (!showVariableExpenses) {
      loadVariableExpenses();
    }
    setShowVariableExpenses(!showVariableExpenses);
  };

  const updateIncome = async () => {
    if (!monthlyIncome || monthlyIncome <= 0) {
      alert('Please enter a valid monthly income');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/budget/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income: parseFloat(monthlyIncome) })
      });

      if (response.ok) {
        await loadBudgetSummary();
        await loadSavingsRecommendations();
        alert('Income updated successfully!');
      }
    } catch (error) {
      console.error('Error updating income:', error);
      alert('Failed to update income');
    } finally {
      setLoading(false);
    }
  };

  const updateSavingsTarget = async () => {
    if (savingsTarget < 0 || savingsTarget > 100) {
      alert('Savings target must be between 0% and 100%');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/budget/savings-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage: savingsTarget / 100 })
      });

      if (response.ok) {
        await loadBudgetSummary();
        await loadSavingsRecommendations();
        alert('Savings target updated successfully!');
      }
    } catch (error) {
      console.error('Error updating savings target:', error);
      alert('Failed to update savings target');
    } finally {
      setLoading(false);
    }
  };

  const addFixedCost = async () => {
    if (!newFixedCost.category || !newFixedCost.amount || newFixedCost.amount <= 0) {
      alert('Please fill in all fields with valid values');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/budget/fixed-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newFixedCost.category,
          amount: parseFloat(newFixedCost.amount),
          description: newFixedCost.description
        })
      });

      if (response.ok) {
        setNewFixedCost({ category: '', amount: '', description: '' });
        await loadBudgetData();
        await loadBudgetSummary();
        await loadSavingsRecommendations();
        alert('Fixed cost added successfully!');
      }
    } catch (error) {
      console.error('Error adding fixed cost:', error);
      alert('Failed to add fixed cost');
    } finally {
      setLoading(false);
    }
  };

  const removeFixedCost = async (category) => {
    if (!confirm(`Are you sure you want to remove ${category}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/budget/fixed-costs?category=${encodeURIComponent(category)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadBudgetData();
        await loadBudgetSummary();
        await loadSavingsRecommendations();
        alert('Fixed cost removed successfully!');
      }
    } catch (error) {
      console.error('Error removing fixed cost:', error);
      alert('Failed to remove fixed cost');
    } finally {
      setLoading(false);
    }
  };

  const getSavingsStatusColor = (savingsRate) => {
    if (savingsRate >= 20) return '#28a745';
    if (savingsRate >= 10) return '#ffc107';
    return '#dc3545';
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <ClerkProvider publishableKey="pk_test_bW9yYWwtY29sdC00MS5jbGVyay5hY2NvdW50cy5kZXYk">
      <div style={{
        minHeight: '100vh',
        background: 'white',
        fontFamily: 'Arial, sans-serif',
        color: 'black',
        padding: '2rem'
      }}>
        <SignedOut>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid #ddd',
            padding: '2rem',
            borderRadius: '8px',
            background: '#f9f9f9',
            textAlign: 'center'
          }}>
            <h1>🔒 Please Sign In</h1>
            <p>You need to be signed in to access the budget page.</p>
            <SignIn />
          </div>
        </SignedOut>

        <SignedIn>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{
              textAlign: 'center',
              fontSize: '2rem',
              marginBottom: '2rem',
              color: '#333'
            }}>
              💰 Budget Management & Savings Planner
            </h1>

            {/* Budget Alerts */}
            {budgetSummary && budgetSummary.alerts && budgetSummary.alerts.length > 0 && (
              <div style={{
                border: '1px solid #ddd',
                padding: '1.5rem',
                borderRadius: '8px',
                background: '#f9f9f9',
                marginBottom: '2rem'
              }}>
                <h2 style={{ marginBottom: '1rem', color: '#333' }}>⚠️ Budget Alerts</h2>
                {budgetSummary.alerts.map((alert, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    borderRadius: '5px',
                    borderLeft: `4px solid ${getAlertColor(alert.severity)}`,
                    background: 'white',
                    border: '1px solid #ddd'
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{alert.title}</h3>
                    <p style={{ margin: 0, color: '#666' }}>{alert.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Budget Summary */}
            {budgetSummary && (
              <div style={{
                border: '1px solid #ddd',
                padding: '2rem',
                borderRadius: '8px',
                background: '#f9f9f9',
                marginBottom: '2rem'
              }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>📊 Budget Summary</h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '5px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                      €{budgetSummary.budget_summary.income.toFixed(2)}
                    </div>
                    <div style={{ color: '#666' }}>Monthly Income</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '5px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                      €{budgetSummary.budget_summary.fixed_costs.toFixed(2)}
                    </div>
                    <div style={{ color: '#666' }}>Fixed Costs</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '5px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fd7e14' }}>
                      €{budgetSummary.budget_summary.variable_expenses.toFixed(2)}
                    </div>
                    <div style={{ color: '#666' }}>
                      <button
                        onClick={toggleVariableExpenses}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fd7e14',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '1rem'
                        }}
                      >
                        Variable Expenses
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '5px' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold', 
                      color: getSavingsStatusColor(budgetSummary.budget_summary.savings_rate)
                    }}>
                      €{budgetSummary.budget_summary.available_for_savings.toFixed(2)}
                    </div>
                    <div style={{ color: '#666' }}>
                      Available for Savings ({budgetSummary.budget_summary.savings_rate.toFixed(1)}%)
                    </div>
                  </div>
                </div>

                {/* Savings Progress */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '5px' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#333' }}>🎯 Savings Progress</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Current Savings Rate</span>
                      <span>{budgetSummary.budget_summary.savings_rate.toFixed(1)}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '20px',
                      background: '#e9ecef',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, budgetSummary.budget_summary.savings_rate)}%`,
                        height: '100%',
                        background: getSavingsStatusColor(budgetSummary.budget_summary.savings_rate),
                        borderRadius: '10px'
                      }}></div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.9rem' }}>
                    <span>Target: {budgetSummary.budget_summary.target_savings.toFixed(2)}€</span>
                    <span>Current: {budgetSummary.budget_summary.available_for_savings.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            )}

            {/* Variable Expenses Details */}
            {showVariableExpenses && (
              <div style={{
                border: '1px solid #ddd',
                padding: '2rem',
                borderRadius: '8px',
                background: '#f9f9f9',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, color: '#333' }}>📊 Variable Expenses Breakdown</h2>
                  <button
                    onClick={toggleVariableExpenses}
                    style={{
                      background: '#6c757d',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Close
                  </button>
                </div>

                {variableExpenses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                    <p>No variable expenses found for this month.</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem'
                  }}>
                    {variableExpenses.map((expense, index) => (
                      <div
                        key={index}
                        style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '5px',
                          border: '1px solid #ddd'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, color: '#333' }}>{expense.category}</h4>
                          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fd7e14' }}>
                            €{expense.amount.toFixed(2)}
                          </span>
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          {expense.description}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Income & Savings Target Setup */}
            <div style={{
              border: '1px solid #ddd',
              padding: '2rem',
              borderRadius: '8px',
              background: '#f9f9f9',
              marginBottom: '2rem'
            }}>
              <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>⚙️ Budget Settings</h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                {/* Monthly Income */}
                <div>
                  <h3 style={{ marginBottom: '1rem', color: '#333' }}>💰 Monthly Income</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                        Amount (€)
                      </label>
                      <input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        placeholder="3000"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          background: 'white',
                          color: 'black',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <button
                      onClick={updateIncome}
                      disabled={loading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '5px',
                        border: 'none',
                        background: loading ? '#6c757d' : '#007bff',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>

                {/* Savings Target */}
                <div>
                  <h3 style={{ marginBottom: '1rem', color: '#333' }}>🎯 Savings Target</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                        Target Percentage (%)
                      </label>
                      <input
                        type="number"
                        value={savingsTarget}
                        onChange={(e) => setSavingsTarget(parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          background: 'white',
                          color: 'black',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <button
                      onClick={updateSavingsTarget}
                      disabled={loading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '5px',
                        border: 'none',
                        background: loading ? '#6c757d' : '#28a745',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Costs Management */}
            <div style={{
              border: '1px solid #ddd',
              padding: '2rem',
              borderRadius: '8px',
              background: '#f9f9f9',
              marginBottom: '2rem'
            }}>
              <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>🏠 Fixed Costs Management</h2>
              
              {/* Add New Fixed Cost */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '5px',
                marginBottom: '2rem'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#333' }}>➕ Add New Fixed Cost</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                      Category
                    </label>
                    <select
                      value={newFixedCost.category}
                      onChange={(e) => setNewFixedCost({...newFixedCost, category: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        background: 'white',
                        color: 'black',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="">Select Category</option>
                      {fixedCostCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                      Amount (€)
                    </label>
                    <input
                      type="number"
                      value={newFixedCost.amount}
                      onChange={(e) => setNewFixedCost({...newFixedCost, amount: e.target.value})}
                      placeholder="0.00"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        background: 'white',
                        color: 'black',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newFixedCost.description}
                      onChange={(e) => setNewFixedCost({...newFixedCost, description: e.target.value})}
                      placeholder="e.g., Netflix subscription"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        background: 'white',
                        color: 'black',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={addFixedCost}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '5px',
                    border: 'none',
                    background: loading ? '#6c757d' : '#007bff',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? 'Adding...' : '➕ Add Fixed Cost'}
                </button>
              </div>

              {/* Fixed Costs List */}
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#333' }}>📋 Current Fixed Costs</h3>
                {Object.keys(fixedCosts).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
                    <p>No fixed costs added yet. Add your first fixed cost above!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(fixedCosts).map(([category, costData]) => (
                      <div
                        key={category}
                        style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>
                            {category}
                          </div>
                          {costData.description && (
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>
                              {costData.description}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>
                            €{costData.amount.toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeFixedCost(category)}
                            disabled={loading}
                            style={{
                              background: '#dc3545',
                              border: 'none',
                              color: 'white',
                              padding: '0.5rem',
                              borderRadius: '3px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '0.9rem'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Savings Recommendations */}
            {savingsRecommendations && (
              <div style={{
                border: '1px solid #ddd',
                padding: '2rem',
                borderRadius: '8px',
                background: '#f9f9f9',
                marginBottom: '2rem'
              }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>🤖 AI Savings Recommendations</h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem'
                }}>
                  {/* Immediate Actions */}
                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#dc3545' }}>⚡ Immediate Actions</h3>
                    {savingsRecommendations.immediate_actions.length === 0 ? (
                      <div style={{ background: 'white', padding: '1rem', borderRadius: '5px', color: '#666' }}>
                        Great! No immediate actions needed.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {savingsRecommendations.immediate_actions.map((action, index) => (
                          <div key={index} style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '5px',
                            border: '1px solid #ddd'
                          }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{action.action}</h4>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{action.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span style={{ color: '#007bff' }}>Impact: {action.potential_impact}</span>
                              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                Save: €{action.estimated_savings.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Priority Areas */}
                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#fd7e14' }}>🎯 Priority Areas</h3>
                    {savingsRecommendations.priority_areas.length === 0 ? (
                      <div style={{ background: 'white', padding: '1rem', borderRadius: '5px', color: '#666' }}>
                        No priority areas identified.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {savingsRecommendations.priority_areas.map((area, index) => (
                          <div key={index} style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '5px',
                            border: '1px solid #ddd'
                          }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{area.category}</h4>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{area.suggestion}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span style={{ color: '#dc3545' }}>€{area.amount.toFixed(2)}</span>
                              <span style={{ color: '#666' }}>{area.percentage.toFixed(1)}% of income</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Long-term Strategies */}
                {savingsRecommendations.long_term_strategies.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>📈 Long-term Strategies</h3>
                    <div style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '5px',
                      border: '1px solid #ddd'
                    }}>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                        {savingsRecommendations.long_term_strategies.map((strategy, index) => (
                          <li key={index} style={{ marginBottom: '0.5rem', color: '#333' }}>
                            {strategy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Total Potential Savings */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: '#d4edda',
                  borderRadius: '5px',
                  border: '1px solid #c3e6cb'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#155724' }}>
                    💰 Total Potential Monthly Savings
                  </h3>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
                    €{savingsRecommendations.potential_savings.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* AI Investment Recommendations */}
            {investmentRecommendations && (
              <div style={{
                border: '1px solid #ddd',
                padding: '2rem',
                borderRadius: '8px',
                background: '#f9f9f9',
                marginBottom: '2rem'
              }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>🚀 AI Investment Recommendations</h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '2rem'
                }}>
                  {/* Investment Sectors */}
                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#007bff' }}>📈 Best Investment Sectors</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {investmentRecommendations.top_sectors.map((sector, index) => (
                        <div key={index} style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '5px',
                          border: '1px solid #ddd'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, color: '#333' }}>{sector.name}</h4>
                            <span style={{ 
                              fontWeight: 'bold', 
                              color: sector.risk_level === 'Low' ? '#28a745' : 
                                     sector.risk_level === 'Medium' ? '#ffc107' : '#dc3545'
                            }}>
                              {sector.risk_level}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{sector.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: '#007bff' }}>Expected Return: {sector.expected_return}%</span>
                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                              Min Investment: €{sector.min_investment.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Investment Strategies */}
                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>💡 Investment Strategies</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {investmentRecommendations.strategies.map((strategy, index) => (
                        <div key={index} style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '5px',
                          border: '1px solid #ddd'
                        }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{strategy.name}</h4>
                          <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{strategy.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: '#007bff' }}>Time Horizon: {strategy.time_horizon}</span>
                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                              Success Rate: {strategy.success_rate}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expected Returns Calculator */}
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#333' }}>🧮 Expected Returns Calculator</h3>
                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '5px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <strong>Conservative Portfolio:</strong>
                        <div style={{ color: '#28a745', fontSize: '1.2rem' }}>
                          {investmentRecommendations.expected_returns.conservative}% annually
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          €{investmentRecommendations.expected_returns.conservative_amount.toFixed(2)} in 5 years
                        </div>
                      </div>
                      <div>
                        <strong>Balanced Portfolio:</strong>
                        <div style={{ color: '#ffc107', fontSize: '1.2rem' }}>
                          {investmentRecommendations.expected_returns.balanced}% annually
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          €{investmentRecommendations.expected_returns.balanced_amount.toFixed(2)} in 5 years
                        </div>
                      </div>
                      <div>
                        <strong>Aggressive Portfolio:</strong>
                        <div style={{ color: '#dc3545', fontSize: '1.2rem' }}>
                          {investmentRecommendations.expected_returns.aggressive}% annually
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          €{investmentRecommendations.expected_returns.aggressive_amount.toFixed(2)} in 5 years
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      textAlign: 'center', 
                      marginTop: '1rem', 
                      padding: '1rem', 
                      background: '#e7f3ff', 
                      borderRadius: '5px',
                      border: '1px solid #007bff'
                    }}>
                      <p style={{ margin: 0, color: '#007bff', fontSize: '0.9rem' }}>
                        💡 Based on your current savings rate of {budgetSummary?.budget_summary?.savings_rate?.toFixed(1)}% and market analysis
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SignedIn>
      </div>
    </ClerkProvider>
  );
} 