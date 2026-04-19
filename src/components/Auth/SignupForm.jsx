import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import InputField from '../UI/InputField';
import AnimatedButton from '../UI/AnimatedButton';

const SignupForm = ({ onSignupSuccess, onToggleAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup, setGoogleUser } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return addNotification("Sign up Failed", "Passwords do not match.", "budget");
    }

    setIsLoading(true);
    try {
      await signup(email, password);
      addNotification("Account Created!", "Welcome to AuraFinance.", "success");
      if (onSignupSuccess) {
        onSignupSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      addNotification("Sign up Failed", err.message || "Failed to create account", "budget");
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
      addNotification("Account Created!", "Successfully signed up with Google.", "success");
      if (onSignupSuccess) {
        onSignupSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      addNotification("Google Sign-Up Failed", "Could not verify Google credential", "danger");
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-3">Join AuraFinance</h2>
        <p className="text-textMuted font-medium">Start managing your finances today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="signup-email"
          label="Email Address"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <InputField
          id="signup-password"
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <InputField
          id="signup-confirm"
          label="Confirm Password"
          type="password"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <AnimatedButton
          type="submit"
          className="w-full justify-center mt-4"
          bgClass="bg-accent"
          hoverClass="hover:bg-accent/90"
          icon={UserPlus}
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Sign Up"}
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
            addNotification("Google Sign-Up Failed", "Sign up process was cancelled or failed", "danger");
          }}
          useOneTap
          theme="outline"
          shape="rectangular"
          size="large"
          width="100%"
          text="signup_with"
        />
      </div>

      <p className="mt-8 text-center text-sm text-textMuted z-10 relative">
        Already have an account?{' '}
        {onToggleAuth ? (
          <button
            type="button"
            onClick={onToggleAuth}
            className="text-accent hover:text-accent font-bold transition-colors"
          >
            Log in
          </button>
        ) : (
          <Link to="/login" className="text-accent hover:text-accent font-bold transition-colors">
            Log in
          </Link>
        )}
      </p>
    </div>
  );
};

export default SignupForm;
