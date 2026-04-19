import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import InputField from '../UI/InputField';
import AnimatedButton from '../UI/AnimatedButton';

const LoginForm = ({ onLoginSuccess, onToggleAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, setGoogleUser } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      addNotification("Welcome back!", "Successfully logged in.", "success");
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      addNotification("Login Failed", err.message || "Invalid credentials", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const userData = JSON.parse(jsonPayload);
      
      setGoogleUser({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        uid: userData.sub,
        isGoogleAuth: true,
      });
      addNotification("Welcome back!", "Successfully signed in with Google.", "success");
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      addNotification("Google Sign-In Failed", "Could not verify Google credential", "danger");
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container mb-3">Welcome Back</h2>
        <p className="text-textMuted font-medium">Log in to manage your finances.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="email"
          label="Email Address"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        
        <InputField
          id="password"
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <AnimatedButton 
          type="submit" 
          className="w-full justify-center mt-4" 
          icon={LogIn}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </AnimatedButton>
      </form>

      <div className="relative my-6 z-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-textMuted/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-transparent text-textMuted">Or continue with</span>
        </div>
      </div>

      <div className="w-full flex justify-center mt-2 z-10 relative">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            addNotification("Google Sign-In Failed", "Login process was cancelled or failed", "danger");
          }}
          useOneTap
          theme="outline"
          shape="rectangular"
          size="large"
          width="100%"
        />
      </div>

      <p className="mt-8 text-center text-sm text-textMuted z-10 relative">
        Don't have an account?{' '}
        {onToggleAuth ? (
          <button 
            type="button"
            onClick={onToggleAuth}
            className="text-primary hover:text-primaryHover font-bold transition-colors"
          >
            Sign up
          </button>
        ) : (
          <Link to="/signup" className="text-primary hover:text-primaryHover font-bold transition-colors">
            Sign up
          </Link>
        )}
      </p>
    </div>
  );
};

export default LoginForm;
