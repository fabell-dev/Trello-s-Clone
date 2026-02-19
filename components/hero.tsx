"use client";
import { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "motion/react";
import Link from "next/link";
import { Suspense } from "react";
import { useTheme } from "next-themes";
import { AuthButton } from "./auth-button";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { StarsCanvas } from "./stars-canvas";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

export const Hero = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  // Cambiar el color de fondo según el tema usando CSS variables
  const backgroundBaseColor = `var(--hero-bg)`;
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, ${backgroundBaseColor} 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <>
      {mounted && (
        <motion.section
          style={{
            backgroundImage,
          }}
          className="relative grid h-[calc(100vh-4rem)] place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
        >
          <div className="relative z-10 flex flex-col items-center">
            <span className="mb-1.5 inline-block rounded-full bg-gray-600/50 px-3 py-1.5 text-sm ">
              Personal Project
            </span>
            <h1 className="max-w-3xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-medium leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
              Trello's Clone Project by Fabell-Dev
            </h1>
            <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quae,
              et, distinctio eum impedit nihil ipsum modi.
            </p>
            {user && (
              <Link href={"/dashboard"}>
                <motion.button
                  style={{
                    border,
                    boxShadow,
                  }}
                  whileHover={{
                    scale: 1.015,
                  }}
                  whileTap={{
                    scale: 0.985,
                  }}
                  className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/10 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50"
                >
                  Dashboard
                  <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
                </motion.button>
              </Link>
            )}

            <Suspense fallback={<Skeleton className="h-8 w-52" />}>
              <AuthButton Type="Hero" />
            </Suspense>
          </div>

          <StarsCanvas />
        </motion.section>
      )}
    </>
  );
};
