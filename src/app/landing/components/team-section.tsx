"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CardDecorator } from '@/components/ui/card-decorator'
import { Linkedin, Globe } from 'lucide-react'

const team = [
  {
    id: 1,
    name: 'Andry Hakim',
    role: 'Founder & CIO, Stockwise',
    description:
      'Investor multibagger & financial engineer, membangun strategi portofolio jangka panjang yang terbukti. MBA dari AS dan aktif mengembangkan komunitas investor Indonesia.', 
    image: 'https://assets.pikiran-rakyat.com/crop/0x0:0x0/720x0/webp/photo/2025/08/08/4165077053.jpg ', // ganti kalau ada foto resmi
    fallback: 'AH',
    social: {
      linkedin: 'https://www.linkedin.com/in/andryhakim', 
      github: '', 
      website: 'https://andryhakim.com' // atau situs pribadi jika ada
    }
  },
  {
    id: 2,
    name: 'Douglas Goh',
    role: 'Co-Founder & CEO, Stockwise',
    description:
      'Pengalaman di dunia investasi & edukasi saham; memimpin pelaksanaan program kelas, community & manajemen operasional akademi.', 
    image: 'https://pbs.twimg.com/profile_images/1725148409957343233/mV8T0bbj_400x400.jpg', // ganti dengan foto resmi kalau ada
    fallback: 'DG',
    social: {
      linkedin: 'https://www.linkedin.com/in/goh-douglas',
      github: '',
      website: ''
    }
  }
]

export function TeamSection() {
  return (
    <section id="team" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-6 text-lg px-4 py-2">
            Meet our <span className="font-bold">Founders</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Pendidik dan Penggerak di Balik Stockwise
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Dipimpin oleh para investor profesional yang memiliki rekam jejak nyata di pasar saham Indonesia.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-2">
          {team.map((member) => (
            <Card key={member.id} className="shadow-xs py-2">
              <CardContent className="p-4">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <CardDecorator>
                      <Avatar className="h-24 w-24 border shadow-lg">
                        <AvatarImage
                          src={member.image}
                          alt={member.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-lg font-semibold">
                          {member.fallback}
                        </AvatarFallback>
                      </Avatar>
                    </CardDecorator>
                  </div>

                  {/* Nama & Role */}
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-primary mb-3">
                    {member.role}
                  </p>

                  {/* Deskripsi */}
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {member.description}
                  </p>

                  {/* Tautan sosial */}
                  <div className="flex items-center justify-center gap-3">
                    {member.social.linkedin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer hover:text-primary"
                        asChild
                      >
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} LinkedIn`}
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {member.social.website && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 cursor-pointer hover:text-primary"
                        asChild
                      >
                        <a
                          href={member.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} Website`}
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
