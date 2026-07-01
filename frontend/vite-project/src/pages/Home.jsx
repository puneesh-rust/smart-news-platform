import React from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import bg from "../assest/6th.jpg";
import CatCursor from "../components/ui/CatCursor";

const featureCards = [
  {
    icon: "⚡",
    title: "Real-Time Updates",
    description:
      "Get breaking news as it happens. Our live feed ensures you're always the first to know.",
  },
  {
    icon: "🌍",
    title: "Global Coverage",
    description:
      "From technology to sports, business to health — every category covered in one place.",
  },
  {
    icon: "🎯",
    title: "Personalized Feed",
    description:
      "News tailored to your interests. The more you read, the smarter it gets.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
    <CatCursor />
    <div
      style={{ backgroundImage: `url(${bg})` }}
      className="relative min-h-screen w-full bg-cover bg-center overflow-hidden"
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-slate-900/60 to-cyan-950/70 backdrop-blur-sm" />

      {/* Glow Effects */}
      <div className="absolute top-40 left-20 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Navbar */}
<nav className="flex items-center justify-between ml-5 px-8 md:px-12 py-6">
  <h1 className="text-8xl md:text-6xl font-extrabold text-white tracking-wide">
    News<span className="text-cyan-400">App</span>
  </h1>


          <div className="flex gap-3 mr-12">
            <Button
              variant="ghost"
              className="!text-white !font-extrabold hover:bg-white/10 rounded-full !px-5 !py-2 !h-auto"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              className="bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-full !px-5 !py-2 !h-auto"
              onClick={() => navigate("/register")}
            >
              Register
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 px-6 md:px-12 py-10 flex-1 max-w-7xl mx-auto w-full">

          {/* Left Side */}
          <div className="lg:w-1/2 flex flex-col justify-center">

          
            <div className="text-4xl md:text-6xl font-extrabold leading-tight text-white min-h-[180px]">
              <Typewriter
                onInit={(typewriter) => {
                  typewriter
                    .typeString("Stay Ahead With Real-Time News ")
                    .pauseFor(2000)
                    .deleteAll()
                    .typeString("Technology, Sports, Business & More ")
                    .pauseFor(2000)
                    .start();
                }}
                options={{ loop: true, delay: 40 }}
              />
            </div>

          
            <p className="text-gray-300 mt-6 text-lg leading-8 max-w-xl">
              Get real-time updates across Technology, Business, Sports, Health,
              and Entertainment. Built with modern technologies for speed,
              clarity, and a premium reading experience.
            </p>

            

          </div>

          {/* Right Side — 3 Feature Cards */}
          <div className="lg:w-[480px] w-full flex flex-col gap-5 ml-auto mt-10">
            {featureCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                whileHover={{ scale: 1.02, y: -3 }}
              >
                <Card className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl backdrop-blur-xl transition-all duration-300">
                  <CardContent className="p-6 flex items-start gap-5">
                    <div className="text-4xl mt-1">{card.icon}</div>
                    <div>
                      <h3 className="text-white text-lg font-semibold mb-2">
                        {card.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-6">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div></>
  );
}
