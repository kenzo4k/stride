// src/pages/Home/TopInstructors.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github } from 'lucide-react';

// Updated data structure for better management and more details
const instructors = [
    { 
        id: 1,
        name: 'Emad Bakr', 
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
        expertise: 'Web Development',
        socials: [
            { icon: Linkedin, url: '#' },
            { icon: Twitter, url: '#' },
            { icon: Github, url: '#' },
        ]
    },
    { 
        id: 2,
        name: 'Jane Smith', 
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
        expertise: 'Data Science & AI',
        socials: [
            { icon: Linkedin, url: '#' },
            { icon: Twitter, url: '#' },
        ]
    },
    { 
        id: 3,
        name: 'Emily White', 
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
        expertise: 'Digital Marketing',
        socials: [
            { icon: Linkedin, url: '#' },
            { icon: Twitter, url: '#' },
        ]
    },
    { 
        id: 4,
        name: 'Michael Brown', 
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
        expertise: 'Machine Learning',
        socials: [
            { icon: Linkedin, url: '#' },
            { icon: Github, url: '#' },
        ]
    },
];

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
                            key={instructor.id}
                            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden text-center group transition-all duration-300 transform hover:scale-105 hover:border-cyan-600 shadow-lg"
                            variants={itemVariants}
                        >
                            <div className="relative">
                                <img src={instructor.image} alt={instructor.name} className="w-full h-64 object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div className="p-6 -mt-16 relative z-10">
                                <h3 className="text-xl font-bold text-white">{instructor.name}</h3>
                                <p className="text-sm text-indigo-400 font-semibold mt-1">{instructor.expertise}</p>
                                <div className="mt-4 flex justify-center space-x-4">
                                    {instructor.socials.map((social, index) => (
                                        <span key={index} className="text-gray-400">
                                            <social.icon className="w-6 h-6" />
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