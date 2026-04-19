import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const LoginForm = ({ onLoginSuccess, onToggleAuth }) => {
  const { setGoogleUser } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) base64 += new Array(5 - pad).join('=');
      
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
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
    <div className="w-full py-4">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container mb-3">Welcome Back</h2>
        <p className="text-textMuted font-medium">Log in to manage your finances.</p>
      </div>

      <div className="w-full flex justify-center mt-8 z-10 relative">
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

      <p className="mt-12 text-center text-sm text-textMuted z-10 relative">
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
