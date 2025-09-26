"use client"

import {
  BookOpen,
  Users,
  TrendingUp,
  Lightbulb,
  Award,
  Map,
  Shield,
  Globe,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image3D } from '@/components/image-3d'

const mainFeatures = [
  {
    icon: BookOpen,
    title: 'Kelas Terstruktur',
    description: 'Materi disusun dari dasar hingga lanjutan, dengan modul dan tugas praktis tiap sesi.'
  },
  {
    icon: Users,
    title: 'Mentor & Komunitas',
    description: 'Pendamping langsung dari trader/analist, dengan komunitas aktif untuk diskusi dan review.'
  },
  {
    icon: TrendingUp,
    title: 'Strategi Multibagger',
    description: 'Belajar cara memilih saham berpotensi tinggi (multibagger) berdasarkan riset fundamental.'
  },
  {
    icon: Lightbulb,
    title: 'Mindset & Psikologi',
    description: 'Bagian penting: mengelola emosi pasar — agar keputusan investasi lebih bijak dan konsisten.'
  }
]

const secondaryFeatures = [
  {
    icon: Award,
    title: 'Sertifikat & Pengakuan',
    description: 'Peserta mendapatkan sertifikat resmi sebagai bukti kompetensi investasi.'
  },
  {
    icon: Map,
    title: 'Roadmap Investasi',
    description: 'Rencana jangka panjang & tahapan langkah agar portofolio tumbuh sistematis.'
  },
  {
    icon: Shield,
    title: 'Manajemen Risiko',
    description: 'Belajar strategi membatasi kerugian dan menjaga modal agar lebih aman.'
  },
  {
    icon: Globe,
    title: 'Akses Materi Nasional',
    description: 'Video, slide, dan rekaman acara dapat diakses kapan dan di mana saja.'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
        <Badge variant="outline" className="mb-6 text-lg px-4 py-2">
            Fitur <span className="font-bold">Stockwise</span> Akademi
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Apa yang Anda Dapat Setelah Bergabung
          </h2>
          <p className="text-lg text-muted-foreground">
            Bergabung dengan Stockwise berarti mendapatkan pendampingan penuh: materi, strategi,
            komunitas, dan pelatihan praktis agar Anda bisa berinvestasi saham lebih percaya diri.
          </p>
        </div>

        {/* First Feature Section */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          {/* Image (opsional) */}
          <Image3D
            lightSrc="feature-1-light.png"
            darkSrc="feature-1-dark.png"
            alt="Stockwise Akademi"
            direction="left"
          />
          {/* Konten */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Transformasi Menjadi Investor Profesional
              </h3>
              <p className="text-muted-foreground text-base">
                Dalam Stockwise Akademi, Anda tidak hanya belajar teori — Anda juga langsung mempraktekkan
                analisis saham, menyusun strategi, serta mendapatkan review dari mentor berpengalaman seperti 
                Andry Hakim dan dukungan penuh dari komunitas.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors"
                >
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer">
                <a href="https://stockwise.id/kelas" className="flex items-center">
                  Daftar Kelas
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer">
                <a href="https://stockwise.id" target="_blank" rel="noopener noreferrer">
                  Pelajari Lebih Lanjut
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Second Feature Section */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Konten */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Dukung Setiap Langkah Anda
              </h3>
              <p className="text-muted-foreground text-base">
                Kami menyediakan mentor, review rutin, serta komunitas aktif agar Anda tak sendirian
                dalam menghadapi dinamika pasar saham Indonesia.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors"
                >
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer">
                <a href="https://stockwise.id/testimoni" className="flex items-center">
                  Lihat Testimoni
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>

          {/* Image */}
          <Image3D
            lightSrc="feature-2-light.png"
            darkSrc="feature-2-dark.png"
            alt="Support & Community"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div>
      </div>
    </section>
  )
}
