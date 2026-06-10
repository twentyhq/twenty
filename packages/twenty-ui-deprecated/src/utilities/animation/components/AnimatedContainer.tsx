import { motion } from 'framer-motion';
import React from 'react';

export const AnimatedContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.1 }}
    whileHover={{ scale: 1.04 }}
  >
    {children}
  </motion.div>
);
