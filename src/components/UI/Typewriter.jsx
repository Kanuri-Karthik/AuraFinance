import { useState, useEffect } from 'react';

const Typewriter = ({ words = [], typingSpeed = 100, deletingSpeed = 50, delay = 1500, className = "" }) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [speed, setSpeed] = useState(typingSpeed);

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
        setSpeed(deletingSpeed);
      } else {
        setText(fullText.substring(0, text.length + 1));
        setSpeed(typingSpeed);
      }

      if (!isDeleting && text === fullText) {
        setSpeed(delay);
        setIsDeleting(true);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setSpeed(typingSpeed);
      }
    };

    const timer = setTimeout(handleType, speed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, speed, words, typingSpeed, deletingSpeed, delay]);

  return (
    <span className={`inline-flex items-center relative ${className}`}>
      <span className="py-2">{text}</span>
      <span className="w-[5px] h-[75%] bg-indigo-500 absolute right-[-14px] top-[12.5%] animate-pulse rounded-full shadow-[0_0_10px_rgba(99,102,241,0.6)]"></span>
    </span>
  );
};

export default Typewriter;
