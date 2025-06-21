import React, { useState } from 'react';
import authService from '../appwrite/auth';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { Button, Input, Logo } from './index';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm();

  const create = async (data) => {
    setError("");
    try {
      const account = await authService.createAccount(data);
      if (account) {
        const userData = await authService.getCurrentUser();
        if (userData) dispatch(login(userData));
        navigate("/");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 text-white">
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
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            className="focus:bg-gray-900 bg-gray-800 text-white placeholder-gray-400"
            {...register("name", { required: true })}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            type="email"
            className="focus:bg-gray-900 bg-gray-800 text-white placeholder-gray-400"
            {...register("email", {
              required: true,
              validate: {
                matchPatern: (value) =>
                  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                  "Email address must be a valid address",
              },
            })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            className="focus:bg-gray-900 bg-gray-800 text-white placeholder-gray-400"
            {...register("password", { required: true })}
          />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Create Account
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
