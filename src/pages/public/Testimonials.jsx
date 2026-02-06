// src/pages/Home/Testimonials.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

// Data is now separated from the component for easier management
const testimonialsData = [
    {
        id: 1,
        quote: "This platform transformed my career. The courses are practical and the instructors are top-notch. Highly recommended!",
        name: "Alex Johnson",
        role: "Full-Stack Developer",
        image: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
    },
    {
        id: 2,
        quote: "I was a complete beginner, but the step-by-step guidance helped me build confidence and land my first developer job.",
        name: "Maria Garcia",
        role: "Frontend Engineer",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        id: 3,
        quote: "The flexibility to learn at my own pace was a game-changer. I could balance my studies with my full-time job perfectly.",
        name: "David Chen",
        role: "Data Scientist",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
];

// Animation variants for the container and items
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Adds a small delay between each card animating in
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
        },
    },
};


const Testimonials = () => {
    return (
        <div className="py-16 sm:py-24 bg-gray-900 text-white">
            <div className="container mx-auto px-4">
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        What Our <span className="text-indigo-400">Students</span> Say
                    </h2>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                        Real stories from learners who have transformed their skills and careers with us.
                    </p>
                </motion.div>
                
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% of the section is in view
                >
                    {testimonialsData.map((testimonial) => (
                        <motion.div 
                            key={testimonial.id} 
                            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-cyan-600 transition flex flex-col shadow-lg"
                            variants={itemVariants}
                        >
                            <div className="flex-grow">
                                <Quote className="w-10 h-10 text-indigo-500 mb-4" />
                                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                            </div>
                            <div className="mt-6 flex items-center">
                                <img 
                                    src={testimonial.image} 
                                    alt={testimonial.name} 
                                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500"
                                />
                                <div className="ml-4">
                                    <div className="font-bold text-lg text-white">{testimonial.name}</div>
                                    <div className="text-sm text-indigo-400">{testimonial.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Testimonials;