// src/pages/Home/TopInstructors.jsx

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

const TopInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/users/public/instructors`)
            .then(res => {
                setInstructors(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load instructors", err);
                setLoading(false);
            });
    }, []);

    const defaultSocials = [
        { icon: Linkedin, url: '#' },
        { icon: Twitter, url: '#' },
        { icon: Github, url: '#' },
    ];

    if (loading) {
        return (
            <div className="bg-slate-900 py-16 text-center">
                <span className="loading loading-spinner text-cyan-400"></span>
                <span className="text-gray-400 ml-2">Loading instructors…</span>
            </div>
        );
    }

    if (!instructors.length) return null;

    return (
        <div className="bg-slate-900 py-16 sm:py-24">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                        Meet Our Top Instructors
                    </h2>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                        Learn from industry experts who are passionate about teaching.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {instructors.map((instructor) => (
                        <motion.div
                            key={instructor._id}
                            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden text-center group transition-all duration-300 transform hover:scale-105 hover:border-cyan-600 shadow-lg"
                            variants={itemVariants}
                        >
                            <div className="relative">
                                <img 
                                    src={instructor.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=random`} 
                                    alt={instructor.name} 
                                    className="w-full h-64 object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div className="p-6 -mt-16 relative z-10">
                                <h3 className="text-xl font-bold text-white">{instructor.name}</h3>
                                <p className="text-sm text-indigo-400 font-semibold mt-1">{instructor.title || 'Expert Instructor'}</p>
                                <div className="mt-4 flex justify-center space-x-4">
                                    {defaultSocials.map((social, index) => (
                                        <span key={index} className="text-gray-400 hover:text-cyan-400 transition-colors">
                                            <social.icon className="w-5 h-5" />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default TopInstructors;