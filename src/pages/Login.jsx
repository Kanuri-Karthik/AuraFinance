import { motion } from 'framer-motion';
import GlassCard from '../components/UI/GlassCard';
import LoginForm from '../components/Auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Blobs for styling */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <GlassCard className="p-8 border-primary/20 shadow-2xl shadow-primary/10">
          <LoginForm />
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
