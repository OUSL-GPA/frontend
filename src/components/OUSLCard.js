import React from 'react';
import { motion } from 'framer-motion';
import oulmsLogo from '../assets/oulms.png'; // Adjust the path as necessary

function OUSLCard() {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0px 10px 25px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.3
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.7
      }
    }
  };

  // Inline styles
  const styles = {
    card: {
      maxWidth: '430px',
      borderRadius: '12px',
      overflow: 'hidden',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
    imageContainer: {
      width: '100%',
      height: 'auto',
    },
    image: {
      maxWidth: '100%',
      height: 'auto',
      objectFit: 'contain'
    }
  };

  return (
    <motion.div
      style={styles.card}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
    >
      <motion.div 
        style={styles.imageContainer}
        variants={imageVariants}
      >
        <img 
          src={oulmsLogo}
          alt="The Open University of Sri Lanka Logo" 
          style={styles.image}
        />
      </motion.div>
    </motion.div>
  );
}

export default OUSLCard;