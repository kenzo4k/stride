
// src/pages/Home/Categories.jsx

import React from 'react';
import { FaCode, FaPaintBrush, FaBullhorn, FaBriefcase, FaDatabase, FaCamera } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const categories = [
    { name: 'Development', icon: <FaCode /> },
    { name: 'Design', icon: <FaPaintBrush /> },
    { name: 'Marketing', icon: <FaBullhorn /> },
    { name: 'Business', icon: <FaBriefcase /> },
    { name: 'Data Science', icon: <FaDatabase /> },
    { name: 'Photography', icon: <FaCamera /> }
];

const Categories = () => {
    return (
        <div className="bg-gray-900 py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                        Browse Categories
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Explore our wide range of course categories and find the perfect one for you.
                    </p>
                </div>
                <div className="flex justify-center">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl">
                        {categories.map((category, index) => (
                            <Link to={`/courses/category/${category.name}`} key={index}>
                                <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg border border-gray-700 text-white hover:border-purple-600 transition">
                                    <div className="text-4xl mb-4 text-purple-400">{category.icon}</div>
                                    <h3 className="text-lg font-semibold text-purple-300">{category.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;
