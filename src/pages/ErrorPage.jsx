import React from 'react';
import { Link, useRouteError } from 'react-router-dom';

const ErrorPage = () => {

    const error = useRouteError();
    console.error(error); 

    let status = error.status || 404;
    let statusText = error.statusText || "Page Not Found";
    let message = "Sorry, we couldn’t find the page you’re looking for.";

   
    if (status !== 404) {
        message = error.message || "An unexpected error has occurred.";
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-center px-6">
            <div className="max-w-md bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
                <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 drop-shadow-lg">
                    {status}
                </h1>
                <p className="text-2xl md:text-3xl font-bold mt-4 text-white">
                    {statusText}
                </p>
                <p className="text-lg text-gray-400 mt-3">
                    {message}
                </p>
                <Link to="/" className="btn btn-primary mt-8 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Go Back to Homepage
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;