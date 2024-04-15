import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

const MotionContainer = ({ children }: { children?: React.ReactNode }) => (
  <motion.div variants={containerVariants} initial="hidden" animate="visible">
    {children}
  </motion.div>
);

export default MotionContainer;
