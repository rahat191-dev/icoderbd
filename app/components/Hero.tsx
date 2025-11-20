"use client"
import Image from "next/image";
import TypingAnimation from "./features/TypingAnimation";

export default function Hero() {

    return (
    <div 
        className="relative lg:ml-6 flex-shrink-0 w-full h-[500px] 
                   lg:fixed z-20 lg:w-[300px] lg:h-[95%] 
                   rounded-xl overflow-hidden 
                   lg:-skew-x-3 lg:origin-top-left" 
      >
        <Image
          src="/images/brand/rahat.webp"
          alt="Rahat Hossain"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 300px "
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-30 px-4">
    <h1 className="text-white text-3xl lg:text-4xl font-extrabold drop-shadow-lg">
      Rahat Hossain
    </h1>
    <div className="text-xl lg:text-xl text-brand2 drop-shadow-md">
      <TypingAnimation />
    </div>
  </div>

<div className="absolute inset-x-0 bottom-0 flex justify-center z-30">
          <div className="flex w-full max-w-lg text-white font-extrabold justify-between border-t border-white p-4 !cursor-pointer relative">
            <div className="absolute left-1/2 top-0 h-full w-px bg-white"></div>
            <a href="#"> 
              DOWNLOAD CV
            </a>
            <a href="#">
              CONTACT ME
            </a>
          </div>
        </div>

      </div>
)}