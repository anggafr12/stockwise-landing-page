"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CardDecorator } from '@/components/ui/card-decorator'
import { BookOpen, Users, TrendingUp, Award } from 'lucide-react'

const values = [
  {
    icon: BookOpen,
    title: 'Pembelajaran Praktis',
    description:
      'Materi fokus ke aplikasi nyata: fundamental, valuasi, hingga case study investasi jangka panjang.'
  },
  {
    icon: Users,
    title: 'Instruktur & Komunitas',
    description:
      'Dibimbing investor berpengalaman dan bergabung ke komunitas aktif untuk diskusi dan update pasar.'
  },
  {
    icon: TrendingUp,
    title: 'Strategi Teruji',
    description:
      'Program intensif (masterclass) yang mengajarkan kerangka mencari saham berpotensi multibagger.'
  },
  {
    icon: Award,
    title: 'Dukungan Lengkap',
    description:
      'Webinar, sesi tanya jawab, materi rekaman dan simulasi agar peserta siap berinvestasi dengan percaya diri.'
  }
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-6 text-lg px-4 py-2">
            Tentang <span className="font-bold">Stockwise</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Akademi Investasi Saham — Praktis & Terbukti
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Stockwise menghadirkan pembelajaran investasi saham yang berbasis praktik dan pengalaman pasar.
            Mulai dari investor baru sampai yang ingin mengembangkan portofolio jangka panjang, kami menyediakan
            kelas terstruktur, masterclass intensif, dan komunitas yang mendukung setiap langkah Anda.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
          {values.map((value, index) => (
            <Card key={index} className="group shadow-xs py-2">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <CardDecorator>
                    <value.icon className="h-6 w-6" aria-hidden />
                  </CardDecorator>
                  <h3 className="mt-6 font-medium text-balance">{value.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm">{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-muted-foreground">🔎 Siap tingkatkan kemampuan investasi Anda?</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="cursor-pointer" asChild>
              <a
                href="https://stockwise.id"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Daftar Kelas Stockwise"
              >
                <BookOpen className="mr-2 h-4 w-4 inline" />
                Daftar Kelas
              </a>
            </Button>

            {/* Komunitas Discord */}
            <Button size="lg" variant="outline" className="cursor-pointer text-lg px-6 py-3" asChild>
              <a
                href="https://discord.com/invite/stockwise" // ganti dengan link Discord Stockwise
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Gabung Komunitas Discord Stockwise"
                className="flex items-center"
              >
                <img
                  src="https://cdn.worldvectorlogo.com/logos/discord-6.svg"
                  alt="Discord"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Gabung Komunitas
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
