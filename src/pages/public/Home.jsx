// src/pages/Home/Home.jsx

import React, { useEffect } from 'react';
import Banner from './Banner';
import LatestCourses from './LatestCourses';
import PopularCourses from './PopularCourses';
import TopInstructors from './TopInstructors';
import Testimonials from './Testimonials';
import Categories from './Categories';
import Newsletter from './Newsletter';
import { RecommendedCourses } from '../../components/common';


const Home = () => {
  useEffect(() => {
    document.title = 'Stride | Home';
  }, []);

  return (
    <div>

      {/* 1. Banner Section */}
      <Banner />

      {/* 2. Motto Section */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 leading-relaxed">
              "the journey of a thousand miles begins with a single, personalized Stride."
            </p>
          </div>
        </div>
      </div>

      {/* 3. Latest Courses Section */}
      <LatestCourses />

      {/* 4. Popular Courses Section */}
      <PopularCourses />

      {/* Recommended Courses Section */}
      <div className="bg-gray-950">
        <RecommendedCourses 
          scenario="mixed" 
          title="Recommended For You" 
          description="Personalized course suggestions based on current trends and your interests" 
        />
      </div>

      {/* 5. Categories Section */}
      <Categories />

      {/* 6. Extra Section 1: Top Instructors */}
      <TopInstructors />

      {/* 7. Extra Section 2: Testimonials */}
      <Testimonials />

    </div>
  );
};

export default Home;