"use client"

import { Card } from "@/components/ui/card"

interface LogoItem {
  name: string
  url: string
}

const indoCompanies: LogoItem[] = [
  { name: "BBCA", url: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" },
  { name: "BBRI", url: "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg" },
  { name: "BMRI", url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" },
  { name: "TLKM", url: "https://upload.wikimedia.org/wikipedia/id/thumb/c/c4/Telkom_Indonesia_2013.svg/1920px-Telkom_Indonesia_2013.svg.png" },
  { name: "ASII", url: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Logo_of_PT_Astra_International_Tbk_terbaru_2025.png" },
  { name: "UNVR", url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Unilever_logo.png" },
  { name: "ICBP", url: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Indofood_logo-id.svg" },
  { name: "ANTM", url: "https://upload.wikimedia.org/wikipedia/id/thumb/3/30/Logo_Antam.svg/1920px-Logo_Antam.svg.png" },
]

export function LogoCarousel() {
  return (
    <section className="pb-12 sm:pb-16 lg:pb-20 pt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-8">
            Dipercaya oleh perusahaan saham terkemuka di Indonesia
          </p>

          <div className="relative">
            {/* Fade kiri */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

            {/* Fade kanan */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            {/* Logo Container */}
            <div className="overflow-hidden">
              <div className="flex animate-logo-scroll space-x-8 sm:space-x-12">
                {[...indoCompanies, ...indoCompanies].map((company, index) => (
                  <Card
                    key={index}
                    className="flex-shrink-0 flex items-center justify-center h-16 w-44 
                               opacity-70 hover:opacity-100 transition-opacity duration-300 
                               border-0 shadow-none bg-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={company.url}
                        alt={company.name}
                        width={36}
                        height={36}
                        className="object-contain filter brightness-0 dark:invert dark:brightness-0 dark:contrast-200"
                        loading="lazy"
                      />
                      <span className="text-foreground text-lg font-semibold whitespace-nowrap">
                        {company.name}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
