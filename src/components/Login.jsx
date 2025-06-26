import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as authLogin } from '../store/authSlice';
import { Button, Input, Logo } from './index';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import authService from '../appwrite/auth';
import orbina from '../assets/orbina.svg';
import toast from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');

  const login = async (data) => {
    setError('');
    try {
      const session = await authService.login(data);
      if (session) {
        // Automatically fetch user data after login
        const userData = await authService.getCurrentUser();
        if (userData) {
          dispatch(authLogin({ userData }));
          toast.success('Login successful!');
          navigate('/');
        }
      }
    } catch (error) {
      setError(error.message);
      toast.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 text-white">
      <div className="backdrop-blur-md bg-white/10 shadow-xl rounded-2xl p-10 w-full max-w-md border border-white/10">
        <div className="flex justify-center mb-2">
          <span className="w-full max-w-[100px] flex justify-center gap-0.5 items-center">
            <img src={orbina} alt="Orbina Logo"  height={40} width={40}/>
            <Logo width="100%" />
          </span>
        </div>
        <h2 className="text-center text-3xl font-bold text-white">
          Sign in to your account
        </h2>
        <p className="text-center text-gray-400 mt-1">
          Don&apos;t have an account?&nbsp;
          <Link
            to="/signup"
            className="text-blue-400 hover:underline font-semibold"
          >
            Sign Up
          </Link>
        </p>
        {error && (
          <div className="text-red-400 text-center mt-4 font-medium">{error}</div>
        )}
        <form onSubmit={handleSubmit(login)} className="mt-8 space-y-6">
          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            className="focus:bg-gray-900 bg-gray-800 text-white placeholder-gray-400"
            {...register('email', {
              required: true,
              validate: {
                matchPatern: (value) =>
                  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                  'Email address must be a valid address',
              },
            })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            className="focus:bg-gray-900 bg-gray-800 text-white placeholder-gray-400"
            {...register('password', { required: true })}
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;