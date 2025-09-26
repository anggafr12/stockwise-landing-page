"use client"

import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DotPattern } from '@/components/dot-pattern'
import { getAppUrl } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pt-20 sm:pt-32 pb-16">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Dot pattern overlay using reusable component */}
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="px-4 py-2 border-foreground">
              <Star className="w-3 h-3 mr-2 fill-current" />
              New: Premium Template Collection
              <ArrowRight className="w-3 h-3 ml-2" />
            </Badge>
          </div> */}

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Learn Smart
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}Stock Investing{" "}
            </span>
            with
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}Stockwise{" "}
            </span>
            Academy
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Mari berkembang bersama Stockwise. temukan materi saham praktis, strategi jitu, analisis pasar mendalam, dan simulasi trading interaktif. 
            Dari kelas dasar hingga program eksklusif, semua untuk Anda.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base cursor-pointer" asChild>
              <a href={getAppUrl("/auth/sign-up")}>
                Gabung Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-base cursor-pointer" asChild>
              <a href="https://www.youtube.com/@TheStockwise">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </a>
            </Button>
          </div>
        </div>

        {/* Hero Image/Visual */}
        <div className="mx-auto mt-20 max-w-6xl">
          <div className="relative group">
            {/* Top background glow effect - positioned above the image */}
            <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl"></div>

            <div className="relative max-w-5xl mx-auto rounded-xl border bg-card shadow-2xl aspect-video">
              {/* Thumbnail YouTube video */}
              <img
                src="https://img.youtube.com/vi/H3ohBjXW1bY/maxresdefault.jpg"
                alt="Stockwise Demo Video"
                className="w-full h-full rounded-xl object-cover"
              />

              {/* Bottom fade effect - gradient overlay */}
              <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-b from-transparent via-background/70 to-background rounded-b-xl"></div>

              {/* Overlay play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="rounded-full h-20 w-20 p-0 cursor-pointer hover:scale-110 transition-transform shadow-xl"
                  asChild
                >
                  <a
                    href="https://www.youtube.com/watch?v=H3ohBjXW1bY"
                    aria-label="Watch demo video"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-10 w-10 fill-current" />
                  </a>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
