import { motion } from 'framer-motion';
import GlassCard from '../components/UI/GlassCard';
import SignupForm from '../components/Auth/SignupForm';

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Blobs for styling */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <GlassCard className="p-8 border-accent/20 shadow-2xl shadow-accent/10">
          <SignupForm />
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Signup;
