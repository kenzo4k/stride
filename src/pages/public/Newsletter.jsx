
// src/pages/Home/Newsletter.jsx

import React from 'react';

const Newsletter = () => {
    return (
        <div className="bg-gray-900 py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                        Subscribe to Our Newsletter
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Stay updated with our latest courses, offers, and news.
                    </p>
                </div>
                <div className="max-w-md mx-auto">
                    <form className="flex flex-col md:flex-row gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="input input-bordered bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 w-full md:w-2/3"
                        />
                        <button type="submit" className="btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none w-full md:w-1/3 shadow-lg">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Newsletter;
