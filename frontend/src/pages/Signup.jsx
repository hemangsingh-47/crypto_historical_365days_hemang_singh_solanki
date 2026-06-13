import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // Placeholder signup logic - currently redirects to dashboard immediately
    console.log('Signing up with:', name, email, password);
    navigate('/dashboard');
  };

  return (
    <PageContainer showHeader={false}>
      <div className="auth-wrapper">
        <Card className="auth-card">
          <div className="auth-header">
            <h2>Create an Account</h2>
            <p>Join Crypto Analytics today</p>
          </div>
          <form className="auth-form" onSubmit={handleSignup}>
            <Input 
              label="Full Name" 
              type="text" 
              placeholder="Jane Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
                Sign Up
              </Button>
            </div>
          </form>
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Log in</Link></p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Signup;
