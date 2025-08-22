import { useState, useEffect, useCallback } from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react';
import Chart from 'chart.js/auto';

export default function Charts() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const createCharts = useCallback(() => {
    if (expenses.length === 0) return;

    // Destroy existing charts
    const existingChart = Chart.getChart('expenseChart');
    if (existingChart) {
      existingChart.destroy();
    }

    // Calculate category totals
    const categoryTotals = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const ctx = document.getElementById('expenseChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(categoryTotals),
          datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
              '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }, [expenses]);

  useEffect(() => {
    if (expenses.length > 0) {
      createCharts();
    }
  }, [expenses, createCharts]);

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

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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
            <p>You need to be signed in to access the charts page.</p>
            <SignIn />
          </div>
        </SignedOut>

        <SignedIn>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ 
              textAlign: 'center', 
              fontSize: '2rem', 
              marginBottom: '2rem',
              color: '#333'
            }}>
              📊 Expense Analytics & Charts
            </h1>

            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                border: '1px solid #ddd', 
                borderRadius: '8px',
                background: '#f9f9f9'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
                <p style={{ color: '#666' }}>Loading your expense data...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                border: '1px solid #ddd', 
                borderRadius: '8px',
                background: '#f9f9f9'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <p style={{ color: '#666' }}>No expenses found. Add some expenses to see beautiful charts!</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ 
                    border: '1px solid #ddd', 
                    padding: '1.5rem', 
                    borderRadius: '8px',
                    background: '#f9f9f9',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>€{totalExpenses.toFixed(2)}</div>
                    <div style={{ color: '#666' }}>Total Expenses</div>
                  </div>

                  <div style={{ 
                    border: '1px solid #ddd', 
                    padding: '1.5rem', 
                    borderRadius: '8px',
                    background: '#f9f9f9',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>{expenses.length}</div>
                    <div style={{ color: '#666' }}>Total Transactions</div>
                  </div>

                  <div style={{ 
                    border: '1px solid #ddd', 
                    padding: '1.5rem', 
                    borderRadius: '8px',
                    background: '#f9f9f9',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                      €{(totalExpenses / expenses.length).toFixed(2)}
                    </div>
                    <div style={{ color: '#666' }}>Average per Transaction</div>
                  </div>
                </div>

                {/* Charts Section */}
                <div style={{ 
                  border: '1px solid #ddd', 
                  padding: '2rem', 
                  borderRadius: '8px',
                  background: '#f9f9f9',
                  marginBottom: '2rem'
                }}>
                  <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>📊 Category Distribution</h2>
                  <div style={{ height: '400px', position: 'relative' }}>
                    <canvas id="expenseChart"></canvas>
                  </div>
                </div>

                {/* Category Breakdown Table */}
                <div style={{ 
                  border: '1px solid #ddd', 
                  padding: '2rem', 
                  borderRadius: '8px',
                  background: '#f9f9f9'
                }}>
                  <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>📋 Detailed Category Breakdown</h2>
                  
                  {(() => {
                    const categoryData = {};
                    expenses.forEach(expense => {
                      const category = expense.category;
                      categoryData[category] = (categoryData[category] || 0) + expense.amount;
                    });

                    const sortedCategories = Object.entries(categoryData)
                      .sort(([,a], [,b]) => b - a);

                    return (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ 
                          width: '100%', 
                          borderCollapse: 'collapse',
                          color: '#333'
                        }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #ddd' }}>
                              <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                              <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                              <th style={{ padding: '1rem', textAlign: 'right' }}>Percentage</th>
                              <th style={{ padding: '1rem', textAlign: 'center' }}>Visual</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedCategories.map(([category, amount]) => {
                              const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                              const barWidth = (amount / totalExpenses) * 100;
                              
                              return (
                                <tr key={category} style={{ borderBottom: '1px solid #eee' }}>
                                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      background: getCategoryColor(category)
                                    }}></div>
                                    {category}
                                  </td>
                                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                                    €{amount.toFixed(2)}
                                  </td>
                                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {percentage}%
                                  </td>
                                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{
                                      width: '100px',
                                      height: '8px',
                                      background: '#eee',
                                      borderRadius: '4px',
                                      overflow: 'hidden'
                                    }}>
                                      <div style={{
                                        width: `${barWidth}%`,
                                        height: '100%',
                                        background: getCategoryColor(category),
                                        borderRadius: '4px'
                                      }}></div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </SignedIn>
      </div>
    </ClerkProvider>
  );
} 