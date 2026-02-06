// src/components/forms/CourseForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../ui';
import { COURSE_CATEGORIES } from '../../utils/constants';

const CourseForm = ({ 
  initialData = {}, 
  onSubmit, 
  loading = false,
  buttonText = 'Create Course' 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Course Title"
          {...register('title', { required: 'Course title is required' })}
          error={errors.title?.message}
          placeholder="Enter course title"
        />
        
        <Input
          label="Instructor Name"
          {...register('instructor', { required: 'Instructor name is required' })}
          error={errors.instructor?.message}
          placeholder="Enter instructor name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Category
          </label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="select select-bordered w-full bg-gray-700 border-gray-600 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">Select a category</option>
            {COURSE_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <Input
          label="Price"
          type="number"
          step="0.01"
          min="0"
          {...register('price', { required: 'Price is required', min: 0 })}
          error={errors.price?.message}
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Course Description
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="textarea textarea-bordered w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          placeholder="Enter course description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Course Image URL"
          {...register('image')}
          placeholder="https://example.com/course-image.jpg"
        />
        
        <Input
          label="Duration (in hours)"
          type="number"
          min="1"
          {...register('duration', { required: 'Duration is required', min: 1 })}
          error={errors.duration?.message}
          placeholder="40"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;
