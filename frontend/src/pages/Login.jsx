import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Placeholder login logic - currently redirects to dashboard immediately
    console.log('Logging in with:', email, password);
    navigate('/dashboard');
  };

  return (
    <PageContainer showHeader={false}>
      <div className="auth-wrapper">
        <Card className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Log in to access your analytics</p>
          </div>
          <form className="auth-form" onSubmit={handleLogin}>
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="auth-actions">
              <Button variant="primary" size="lg" style={{ width: '100%' }}>
                Log In
              </Button>
            </div>
          </form>
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Login;
