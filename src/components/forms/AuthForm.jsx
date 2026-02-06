// src/components/forms/AuthForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../ui';

const AuthForm = ({ 
  type = 'login', 
  onSubmit, 
  loading = false,
  error = null 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {type === 'register' && (
        <Input
          label="Full Name"
          {...register('name', { required: 'Name is required' })}
          error={errors.name?.message}
          placeholder="Enter your full name"
        />
      )}

      <Input
        label="Email Address"
        type="email"
        {...register('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        error={errors.email?.message}
        placeholder="Enter your email"
      />

      <Input
        label="Password"
        type="password"
        {...register('password', { 
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters'
          }
        })}
        error={errors.password?.message}
        placeholder="Enter your password"
      />

      {type === 'register' && (
        <Input
          label="Confirm Password"
          type="password"
          {...register('confirmPassword', { 
            required: 'Please confirm your password'
          })}
          error={errors.confirmPassword?.message}
          placeholder="Confirm your password"
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Please wait...' : type === 'login' ? 'Sign In' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default AuthForm;
