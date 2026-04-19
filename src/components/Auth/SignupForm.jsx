import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const SignupForm = ({ onSignupSuccess, onToggleAuth }) => {
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
    <div className="w-full py-4">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-3">Join AuraFinance</h2>
        <p className="text-textMuted font-medium">Start managing your finances today.</p>
      </div>

      <div className="w-full flex justify-center mt-8 z-10 relative">
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

      <p className="mt-12 text-center text-sm text-textMuted z-10 relative">
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
