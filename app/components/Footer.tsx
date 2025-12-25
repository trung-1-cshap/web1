"use client";

import React from "react";

export default function Footer() {
  const scrollTop = () => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#07263a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:justify-between gap-8 items-start">
          <div>
            <img
              src="https://www.ndahome.com/_next/image?url=%2Flogo.png&w=384&q=75"
              alt="NDA Home"
              className="h-20 w-auto"
            />
            <p className="mt-4 text-gray-200 max-w-xs">
              Cầu nối uy tín giữa người cho thuê và người cần thuê.
            </p>
          </div>


     
          <div>
            <h4 className="font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1 1 0 01-1.414 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <div>
                  <div className="text-gray-200">Số 37/33 Bình Hưng Hòa B, Bình Tân , TP HCM </div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V8a5 5 0 0110 0v2" />
                  <circle cx="9" cy="14" r="0.5" fill="currentColor" />
                  <circle cx="12" cy="14" r="0.5" fill="currentColor" />
                  <circle cx="15" cy="14" r="0.5" fill="currentColor" />
                </svg>
                <div className="text-gray-200">098.484.3052</div>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8l-9 6-9-6" />
                </svg>
                <div className="text-gray-200">contact@ndahome.com</div>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-600 my-6" />

        <div className="text-center text-gray-300 py-4">
          © 2025 NDa Home. All rights reserved.
        </div>
      </div>

      <button
        onClick={scrollTop}
        aria-label="scroll to top"
        className="fixed right-6 bottom-6 w-12 h-12 rounded-full bg-yellow-500 text-white shadow-lg flex items-center justify-center hover:bg-yellow-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </footer>
  );
}
