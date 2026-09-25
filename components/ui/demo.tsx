import * as React from "react";
import { motion } from "framer-motion";
import { ImageSlider } from "@/components/ui/image-slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Apple, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function ImageSliderLoginDemo() {
  const images = [
    "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=1000&auto=format&fit=crop", // Professional streaming/gaming studio
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop", // Modern camera content creation setup
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop", // Dynamic digital creator workstation
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop", // High-fidelity audio podcasting setup
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 14,
      },
    },
  };

  return (
    <div className="w-full h-screen min-h-[720px] flex items-center justify-center bg-[#F7F7F5] p-4 font-sans">
      <motion.div 
        className="w-full max-w-5xl h-[680px] grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left side: Image Slider with dynamic welcome overlays */}
        <div className="hidden lg:block relative h-full">
          <ImageSlider images={images} interval={4500} />
          {/* Subtle brand overlay on top of the image slider */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent p-8 flex items-start justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D4F636] text-black flex items-center justify-center font-black text-sm shadow-md">
                sh
              </div>
              <span className="text-white font-extrabold tracking-tight text-base drop-shadow-xs">
                Skill2Bills
              </span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#D4F636] bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
              Live Masterclasses
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 flex flex-col justify-end text-white pointer-events-none">
            <h3 className="text-xl font-extrabold text-[#D4F636] mb-1.5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 fill-[#D4F636] stroke-none" />
              Build Your Digital Empire
            </h3>
            <p className="text-xs text-slate-200 max-w-sm leading-relaxed font-medium">
              From absolute novice to high-earning creator. Master streaming, viral video content, and premium AI personas.
            </p>
          </div>
        </div>

        {/* Right side: Login Form matching the website color system */}
        <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8 md:p-12 relative overflow-y-auto">
          <motion.div 
            className="w-full max-w-sm space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header section with brand adaptation */}
            <motion.div variants={itemVariants} className="space-y-2 text-center lg:text-left">
              <div className="inline-flex lg:hidden items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#D4F636] animate-ping" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600">Skill2Bills</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Welcome Back
              </h1>
              <p className="text-sm font-semibold text-slate-500">
                Sign in to resume your 7-day masterclass trials.
              </p>
            </motion.div>

            {/* Social Logins */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3.5">
              <Button 
                variant="outline" 
                className="w-full h-11 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-extrabold text-xs text-slate-800 flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Chrome className="h-4 w-4 text-rose-500 fill-rose-500/10" />
                Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-11 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-extrabold text-xs text-slate-800 flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Apple className="h-4 w-4 text-slate-900 fill-slate-900" />
                Apple
              </Button>
            </motion.div>

            {/* Separator */}
            <motion.div variants={itemVariants} className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Or security code login
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </motion.div>

            {/* Native styled Form matching standard brand color scheme */}
            <motion.form variants={itemVariants} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@creator.com" 
                  required 
                  className="h-11 px-4 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Creator Password
                  </Label>
                  <a href="#" className="text-xs font-bold text-slate-500 hover:text-black transition-colors">
                    Forgot key?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="h-11 px-4 rounded-xl border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-[#D4F636] hover:bg-[#c2e42b] text-black font-black text-sm rounded-xl transition-all cursor-pointer shadow-md border border-black/10 flex items-center justify-center gap-2"
              >
                <span>Enter Launchpad</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Button>
            </motion.form>

            {/* Footer Sign Up link */}
            <motion.p variants={itemVariants} className="text-center text-xs font-semibold text-slate-500">
              Don't have an account?{" "}
              <a href="#" className="font-extrabold text-black hover:underline underline-offset-2">
                Join Skill2Bills now
              </a>
            </motion.p>

            {/* Extra assurance badge */}
            <motion.div 
              variants={itemVariants}
              className="pt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4F636] stroke-[2.5]" />
              <span>Secure 256-Bit Encrypted Portal</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
