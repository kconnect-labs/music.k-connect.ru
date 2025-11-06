import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(usernameOrEmail, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background" />
      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            {!logoError ? (
              <img 
                src="https://k-connect.ru/static/images/icon.png" 
                alt="K-Connect" 
                className="login-logo"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="logo-placeholder">K</div>
            )}
          </div>
          <h1 className="login-title">К-Коннект Music</h1>
          <p className="login-subtitle">Войдите в свой аккаунт</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              id="usernameOrEmail"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              placeholder="Имя пользователя или Email"
              className="ios-input"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Пароль"
              className="ios-input"
              autoComplete="current-password"
            />
          </div>

          {authError && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="button-loading">
                <span className="spinner" />
                <span>Вход...</span>
              </span>
            ) : (
              'Войти'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

