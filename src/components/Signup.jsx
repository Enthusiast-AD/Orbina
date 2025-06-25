import React, { useState } from 'react';
import authService from '../appwrite/auth';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { Button, Input } from './index';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { profileCacheUtils } from '../utils/profileCache'; // Add this import
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle } from 'lucide-react';

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const password = watch("password");

  const create = async (data) => {
    setError("");
    setIsLoading(true);
    
    try {
      const account = await authService.createAccount(data);
      if (account) {
        // Automatically fetch user data after signup
        const userData = await authService.getCurrentUser();
        if (userData) {
          dispatch(login({ userData }));
          
          // Clear any failed profile attempts for this new user
          profileCacheUtils.clearSpecificProfile(userData.$id);
          
          toast.success('Welcome! Account created successfully!');
          navigate("/");
        }
      }
    } catch (error) {
      setError(error.message);
      toast.error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Very Weak', color: 'text-red-500' },
      { strength: 2, text: 'Weak', color: 'text-orange-500' },
      { strength: 3, text: 'Fair', color: 'text-yellow-500' },
      { strength: 4, text: 'Good', color: 'text-blue-500' },
      { strength: 5, text: 'Strong', color: 'text-green-500' },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Blogger</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Join Our Community
          </h2>
          <p className="text-slate-400">
            Create your account and start sharing your stories with the world
          </p>
        </div>

        {/* Form */}
        <div className="backdrop-blur-md bg-slate-800/50 shadow-2xl rounded-2xl p-8 border border-slate-700/50">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(create)} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-500' : 'border-slate-600'
                  }`}
                  {...register("name", { 
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters"
                    }
                  })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-slate-600'
                  }`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Please enter a valid email address"
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  }`}
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength <= 2 ? 'bg-red-500' :
                          passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                          passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="mt-2 space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${
                      password.length >= 8 ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      <CheckCircle className={`w-3 h-3 ${
                        password.length >= 8 ? 'text-green-400' : 'text-slate-600'
                      }`} />
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${
                      /[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      <CheckCircle className={`w-3 h-3 ${
                        /[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-400' : 'text-slate-600'
                      }`} />
                      Upper and lowercase letters
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${
                      /[0-9]/.test(password) ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      <CheckCircle className={`w-3 h-3 ${
                        /[0-9]/.test(password) ? 'text-green-400' : 'text-slate-600'
                      }`} />
                      At least one number
                    </div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create Account
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            🎉 Join thousands of writers sharing their stories
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;