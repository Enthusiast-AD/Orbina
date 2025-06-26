import React, { useState } from 'react';
import authService from '../appwrite/auth';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { Button, Input } from './index';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { profileCacheUtils } from '../utils/profileCache';
import toast from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

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

  // Password strength checker (keeping the enhanced functionality)
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
      { strength: 1, text: 'Very Weak', color: 'text-red-400' },
      { strength: 2, text: 'Weak', color: 'text-orange-400' },
      { strength: 3, text: 'Fair', color: 'text-yellow-400' },
      { strength: 4, text: 'Good', color: 'text-blue-400' },
      { strength: 5, text: 'Strong', color: 'text-green-400' },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 text-white">
      <div className="backdrop-blur-md bg-white/10 shadow-xl rounded-2xl p-10 w-full max-w-md border border-white/10">

        <h2 className="text-center text-3xl font-bold text-white">
          Create an Account
        </h2>
        <p className="text-center text-gray-400 mt-1">
          Join us and start publishing!
        </p>

        {error && (
          <div className="text-red-400 text-center mt-4 font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit(create)} className="mt-8 space-y-6">
          {/* Full Name Field */}
          <div>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              className="focus:bg-gray-900 bg-gray-800 text-white placeholder-gray-400"
              {...register("name", { 
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters"
                }
              })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <Input
              label="Email"
              placeholder="Enter your email"
              type="email"
              className="focus:bg-gray-900 bg-gray-800 text-white placeholder-gray-400"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Please enter a valid email address"
                }
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field with Enhanced Features */}
          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="focus:bg-gray-900 bg-gray-800 text-white placeholder-gray-400 pr-12"
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
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength <= 2 ? 'bg-red-500' :
                        passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                        passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
                
                {/* Password Requirements */}
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${
                    password.length >= 8 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    <CheckCircle className={`w-3 h-3 ${
                      password.length >= 8 ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    /[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    <CheckCircle className={`w-3 h-3 ${
                      /[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-400' : 'text-gray-400'
                    }`} />
                    Upper and lowercase letters
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    /[0-9]/.test(password) ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    <CheckCircle className={`w-3 h-3 ${
                      /[0-9]/.test(password) ? 'text-green-400' : 'text-gray-400'
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

          {/* Submit Button with Loading State */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:underline font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;