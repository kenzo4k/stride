import React, { useState } from 'react';


const Chatbot = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] font-sans ${open ? '' : ''}`}>
      {!open ? (
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-6 py-2 shadow-md cursor-pointer transition-shadow hover:shadow-lg flex items-center"
          onClick={() => setOpen(true)}
        >
          <span className="text-lg">💬 Chat</span>
        </div>
      ) : (
        <div className="w-[340px] h-[480px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-4 flex justify-between items-center font-semibold">
            <span>Chatbot</span>
            <button
              className="bg-transparent border-none text-white text-xl cursor-pointer"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="flex-1 px-4 py-4 overflow-y-auto bg-gray-800">
            {/* Chat messages will go here */}
            <div className="mb-3 px-4 py-2 rounded-xl max-w-[80%] text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-gray-900 self-start">
              Hi! How can I help you?
            </div>
          </div>
          <div className="flex px-4 py-3 bg-gray-800 border-t border-blue-900">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-700 text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-900 text-white placeholder:text-gray-400"
            />
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-2 font-medium hover:from-blue-700 hover:to-purple-700 transition-colors">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
