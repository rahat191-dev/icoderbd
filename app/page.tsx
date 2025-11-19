"use client"
import Image from "next/image"
import About from "./components/About"

export default function Home() {
  return (
    <main>
      <div className="flex flex-col lg:flex-row items-center sm:items-start gap-6">

        <div className="flex-shrink-0 sm:w-[95%] sm:h-[90%] lg:h-0 lg:w-0">
          <Image 
  src="/images/brand/rahat.webp"
  alt="Rahat Hossain"
  height={300}
  width={300}
  className="w-full h-[460px] lg:h-[300px] lg:w-[300px] lg:h-[90%] object-cover lg:fixed"
/>

        </div>

        <div className="text-center sm:pr-18 sm:text-left lg:pl-80"> 
          <About />
        </div>

      </div>
    </main>
  );
}
