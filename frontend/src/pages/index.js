import React from 'react';
import { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <ClerkProvider publishableKey="pk_test_bW9yYWwtY29sdC00MS5jbGVyay5hY2NvdW50cy5kZXYk">
      <div style={{
        minHeight: '100vh',
        background: 'white',
        fontFamily: 'Arial, sans-serif',
        color: 'black'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          <h1 style={{
            textAlign: 'center',
            fontSize: '2rem',
            marginBottom: '3rem',
            color: '#333'
          }}>
            💰 Smart Personal Finance Assistant
          </h1>

          <SignedOut>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                border: '1px solid #ddd',
                padding: '2rem',
                borderRadius: '8px',
                minWidth: '300px',
                background: '#f9f9f9'
              }}>
                <h2 style={{
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  color: '#333',
                  fontSize: '1.3rem'
                }}>
                  Welcome Back! 👋
                </h2>
                <SignIn />
              </div>

              <div style={{
                border: '1px solid #ddd',
                padding: '2rem',
                borderRadius: '8px',
                minWidth: '300px',
                background: '#f9f9f9'
              }}>
                <h2 style={{
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  color: '#333',
                  fontSize: '1.3rem'
                }}>
                  Join Us! 🚀
                </h2>
                <SignUp />
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '3rem',
              border: '1px solid #ddd',
              padding: '2rem',
              borderRadius: '8px',
              background: '#f9f9f9'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Why Choose Our Finance Assistant?</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                  <strong>Smart Analytics</strong>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>Get insights into your spending patterns</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                  <strong>Goal Tracking</strong>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>Set and achieve financial goals</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                  <strong>Secure & Private</strong>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>Your data is always protected</p>
                </div>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <div style={{
              border: '1px solid #ddd',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center',
              background: '#f9f9f9'
            }}>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>🎉 Welcome! You're signed in.</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
                Ready to take control of your finances? Let's get started!
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => navigateTo('/expenses')}
                  style={{
                    background: '#007bff',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#0056b3';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#007bff';
                  }}
                >
                  📝 Add & Manage Expenses
                </button>
                <button
                  onClick={() => navigateTo('/budget')}
                  style={{
                    background: '#28a745',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#1e7e34';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#28a745';
                  }}
                >
                  💰 Budget & Savings Planner
                </button>
                <button
                  onClick={() => navigateTo('/charts')}
                  style={{
                    background: '#fd7e14',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#e8690b';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#fd7e14';
                  }}
                >
                  📊 View Analytics & Charts
                </button>
                <button
                  style={{
                    background: '#6c757d',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#545b62';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#6c757d';
                  }}
                >
                  🎯 Set Financial Goals
                </button>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
  </ClerkProvider>
);
}
