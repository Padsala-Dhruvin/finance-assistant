import React, { useState, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  

  const categories = [
    'Food', 'Transport', 'Shopping', 'Entertainment',
    'Bills', 'Healthcare', 'Education', 'Travel', 'Other'
  ];

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Get AI insights
  const fetchAiInsights = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/ai/insights');
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  // Get financial health score
  const fetchHealthScore = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/ai/health');
      if (response.ok) {
        const data = await response.json();
        setHealthScore(data);
      }
    } catch (error) {
      console.error('Error fetching health score:', error);
    }
  };

  // AI categorization for description
  const categorizeDescription = async (desc) => {
    if (!desc.trim()) {
      setSuggestedCategory(null);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedCategory(data);
        if (data.confidence > 70) {
          setCategory(data.category);
        }
      }
    } catch (error) {
      console.error('Error categorizing description:', error);
    }
  };

  // Add expense to backend
  const addExpense = async () => {
    if (!amount || !description) {
      alert('Please fill in all fields');
      return;
    }

    const newExpense = {
      amount: parseFloat(amount),
      category,
      description,
      date,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });

      if (response.ok) {
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setCategory('Food');
        setSuggestedCategory(null);
        fetchExpenses(); // Refresh the list
        fetchAiInsights(); // Refresh AI insights
        fetchHealthScore(); // Refresh health score
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  // Delete expense from backend
  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchExpenses(); // Refresh the list
        fetchAiInsights(); // Refresh AI insights
        fetchHealthScore(); // Refresh health score
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  

  // Analyze expenses and get suggestions
  const analyzeExpenses = async () => {
    if (expenses.length === 0) {
      alert('No expenses to analyze');
      return;
    }

    setLoading(true);
    try {
      const expensesList = expenses.map(exp => exp.amount);
      const categoriesList = expenses.map(exp => exp.category);

      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses: expensesList,
          categories: categoriesList
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error analyzing expenses:', error);
      alert('Failed to analyze expenses');
    } finally {
      setLoading(false);
    }
  };

  // Load expenses and AI data on component mount
  useEffect(() => {
    fetchExpenses();
    fetchAiInsights();
    fetchHealthScore();
  }, []);

  // Auto-categorize when description changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (description.trim()) {
        categorizeDescription(description);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [description]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getCategoryColor = (category) => {
    const colors = {
      'Food': '#dc3545',
      'Transport': '#28a745',
      'Shopping': '#007bff',
      'Entertainment': '#ffc107',
      'Bills': '#17a2b8',
      'Healthcare': '#6f42c1',
      'Education': '#fd7e14',
      'Travel': '#20c997',
      'Other': '#6c757d'
    };
    return colors[category] || '#6c757d';
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
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
            <p>You need to be signed in to access the expenses page.</p>
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
              💰 Smart Expense Tracker with AI
            </h1>

            {/* Financial Health Score */}
            {healthScore && (
              <div style={{
                border: '1px solid #ddd',
                padding: '1.5rem',
                borderRadius: '8px',
                background: '#f9f9f9',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <h2 style={{ marginBottom: '1rem', color: '#333' }}>🏥 Financial Health Score</h2>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '2rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: getHealthScoreColor(healthScore.overall_score),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    <div style={{ fontSize: '2rem' }}>{healthScore.overall_score}</div>
                    <div style={{ fontSize: '1.2rem' }}>{healthScore.grade}</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>{healthScore.status}</h3>
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>{healthScore.trend}</p>
                    {healthScore.recommendations.slice(0, 2).map((rec, index) => (
                      <p key={index} style={{ fontSize: '0.9rem', color: '#666', margin: '0.2rem 0' }}>
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            

            {/* Add Expense Form */}
            <div style={{
              border: '1px solid #ddd',
              padding: '2rem',
              borderRadius: '8px',
              background: '#f9f9f9',
              marginBottom: '2rem'
            }}>
              <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>➕ Add New Expense</h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                    Amount (€)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
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
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {suggestedCategory && suggestedCategory.confidence > 70 && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#d4edda',
                      borderRadius: '3px',
                      fontSize: '0.9rem',
                      color: '#155724'
                    }}>
                      🤖 AI suggests: {suggestedCategory.category} ({suggestedCategory.confidence}% confidence)
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this expense for? (AI will suggest category)"
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
                {suggestedCategory && suggestedCategory.alternatives.length > 0 && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#f8f9fa',
                    borderRadius: '3px',
                    fontSize: '0.9rem'
                  }}>
                    <strong>Other possible categories:</strong> {suggestedCategory.alternatives.join(', ')}
                  </div>
                )}
              </div>

              <button
                onClick={addExpense}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '5px',
                  border: 'none',
                  background: '#007bff',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#0056b3'}
                onMouseOut={(e) => e.target.style.background = '#007bff'}
              >
                ➕ Add Expense
              </button>
            </div>

            {/* AI Insights */}
            {aiInsights && aiInsights.insights && aiInsights.insights.length > 0 && (
              <div style={{
                border: '1px solid #ddd',
                padding: '2rem',
                borderRadius: '8px',
                background: '#f9f9f9',
                marginBottom: '2rem'
              }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>🤖 AI Insights & Recommendations</h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem'
                }}>
                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#007bff' }}>📊 Insights</h3>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '5px', border: '1px solid #ddd' }}>
                      {aiInsights.insights.slice(0, 3).map((insight, index) => (
                        <p key={index} style={{ marginBottom: '0.5rem', lineHeight: '1.4' }}>{insight}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>💡 Smart Suggestions</h3>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '5px', border: '1px solid #ddd' }}>
                      {aiInsights.suggestions.slice(0, 3).map((suggestion, index) => (
                        <p key={index} style={{ marginBottom: '0.5rem', lineHeight: '1.4' }}>{suggestion}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {aiInsights.anomalies && aiInsights.anomalies.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#dc3545' }}>⚠️ Unusual Spending Detected</h3>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '5px', border: '1px solid #ddd' }}>
                      {aiInsights.anomalies.slice(0, 2).map((anomaly, index) => (
                        <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f8d7da', borderRadius: '3px' }}>
                          <strong>{anomaly.expense.description}</strong> - {anomaly.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary and Analysis */}
            <div style={{
              border: '1px solid #ddd',
              padding: '1.5rem',
              borderRadius: '8px',
              background: '#f9f9f9',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>📊 Summary</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>€{totalExpenses.toFixed(2)}</div>
                  <div style={{ color: '#666' }}>Total Expenses</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{expenses.length}</div>
                  <div style={{ color: '#666' }}>Number of Expenses</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
                    €{expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
                  </div>
                  <div style={{ color: '#666' }}>Average per Expense</div>
                </div>
              </div>

              <button
                onClick={analyzeExpenses}
                disabled={loading || expenses.length === 0}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '5px',
                  border: 'none',
                  background: loading ? '#6c757d' : '#28a745',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s ease'
                }}
                onMouseOver={(e) => !loading && (e.target.style.background = '#1e7e34')}
                onMouseOut={(e) => !loading && (e.target.style.background = '#28a745')}
              >
                {loading ? '🔄 Analyzing...' : '🧠 Get Detailed AI Analysis'}
              </button>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div style={{
                border: '1px solid #ddd',
                padding: '2rem',
                borderRadius: '8px',
                background: '#f9f9f9',
                marginBottom: '2rem'
              }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>🤖 Detailed AI Analysis</h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem'
                }}>
                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#007bff' }}>📈 Financial Metrics</h3>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '5px', border: '1px solid #ddd' }}>
                      <p><strong>Total:</strong> €{analysis.total}</p>
                      <p><strong>Average:</strong> €{analysis.average}</p>
                      <p><strong>Health Score:</strong> {analysis.health_score}/100 ({analysis.health_grade})</p>
                      <p><strong>Status:</strong> {analysis.health_status}</p>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>💡 AI Recommendations</h3>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '5px', border: '1px solid #ddd' }}>
                      {analysis.health_recommendations && analysis.health_recommendations.map((rec, index) => (
                        <p key={index} style={{ marginBottom: '0.5rem', lineHeight: '1.4' }}>{rec}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={() => setAnalysis(null)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      background: 'white',
                      color: '#333',
                      cursor: 'pointer'
                    }}
                  >
                    Hide Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div style={{
              border: '1px solid #ddd',
              padding: '2rem',
              borderRadius: '8px',
              background: '#f9f9f9'
            }}>
              <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>📋 Recent Expenses</h2>

              {expenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                  <p>No expenses yet. Add your first expense above!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {expenses.slice().reverse().map(expense => (
                    <div
                      key={expense.id}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: getCategoryColor(expense.category),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: 'white'
                          }}
                        >
                          {expense.category.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>
                            {expense.description}
                          </div>
                          <div style={{ color: '#666', fontSize: '0.9rem' }}>
                            {expense.category} • {new Date(expense.date).toLocaleDateString()}
                          </div>
                          {expense.ai_categorization && (
                            <div style={{ fontSize: '0.8rem', color: '#007bff' }}>
                              🤖 AI confidence: {expense.ai_categorization.confidence}%
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>
                          €{expense.amount.toFixed(2)}
                        </div>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          style={{
                            background: '#dc3545',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#c82333'}
                          onMouseOut={(e) => e.target.style.background = '#dc3545'}
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
        </SignedIn>
      </div>
    </ClerkProvider>
  );
} 