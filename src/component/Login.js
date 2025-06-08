import React, { useState } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup , getAuth, GoogleAuthProvider
} from 'firebase/auth';
import '../asset/loginModal.css';
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '../fireBaseConfig';
    

const LoginModal = ({ onClose }) => {
  const app =  initializeApp(firebaseConfig)
   const auth = getAuth(app);
 const googleProvider = new GoogleAuthProvider();


  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert('Google login successful!');
      onClose();
    } catch (error) {
      alert('Google sign-in failed: ' + error.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2 className="modal-title">Login to Continue</h2>

   
        <div className="divider">or</div>

        <button className="google-login-btn" onClick={handleGoogleLogin}>
          <img
            src="https://img.icons8.com/color/16/000000/google-logo.png"
            alt="Google Icon"
          />
          Sign in with Google
        </button>

        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
