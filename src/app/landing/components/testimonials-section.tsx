"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type Testimonial = {
  name: string
  role: string
  image: string
  quote: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Peserta Batch 2023',
    role: 'Alumni Stockwise Masterclass',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-3',
    quote:
      'Materi sangat praktis — dari dasar sampai strategi multibagger. Setelah menerapkan framework yang diajarkan, saya menjadi lebih sistematis dalam memilih saham dan mulai melihat pertumbuhan portofolio yang nyata.',
  },
  {
    name: 'Ibu Sari',
    role: 'Wirausaha, Alumni',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-2',
    quote:
      'Pembelajaran tentang money management dan risk control membuat saya berani ambil keputusan yang lebih disiplin. Hasilnya saya mampu mewujudkan tujuan finansial—termasuk beli rumah dalam beberapa tahun setelah ikut program.',
  },
  {
    name: 'Mas Budi',
    role: 'Karyawan & Investor Pemula',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
    quote:
      'Kelas 4 hari (lebih dari 10 jam materi) benar-benar padat dan fokus. Sesi live Q&A dan review dari mentor membantu mempercepat pemahaman saya tentang valuasi dan tesis investasi.',
  },
  {
    name: 'Rina',
    role: 'Investor Ritel',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-4',
    quote:
      'Komunitas dan mentoring membuat perbedaan besar — diskusi case study, feedback portfolio, dan dukungan alumni sangat membantu saat pasar bergerak volatil.',
  },
  {
    name: 'Arif',
    role: 'Alumni VIP',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-5',
    quote:
      'Beberapa alumni melaporkan hasil yang sangat signifikan setelah konsisten menerapkan metode Stockwise; tentu hasil tiap orang berbeda, tetapi framework-nya jelas membantu menangkap peluang besar di pasar Indonesia.',
  },
  {
    name: 'Testimoni Gabungan',
    role: 'Alumni Stockwise',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-5',
    quote:
      'Ringkasan: materi praktis, mentor berpengalaman (Andry Hakim), komunitas aktif, dan access ke rekaman — kombinasi ini yang membuat banyak peserta merasa lebih percaya diri mengambil keputusan investasi.',
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="container mx-auto px-8 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-6 text-lg px-4 py-2">
            <span className="font-bold">Testimoni</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Apa Kata Alumni Stockwise Masterclass
          </h2>
          <p className="text-lg text-muted-foreground">
            Pengalaman nyata peserta: materi intensif (4 hari &gt;10 jam), mentoring langsung, dan dukungan komunitas—dinyatakan membantu peserta dalam membangun strategi investasi yang lebih matang.
          </p>
        </div>

        {/* Testimonials Masonry Grid */}
        <div className="columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 lg:gap-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="mb-6 break-inside-avoid shadow-none lg:mb-4">
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="bg-muted size-12 shrink-0">
                    <AvatarImage
                      alt={testimonial.name}
                      src={testimonial.image}
                      loading="lazy"
                      width="120"
                      height="120"
                    />
                    <AvatarFallback>
                      {testimonial.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <a href="#" onClick={e => e.preventDefault()} className="cursor-pointer">
                      <h3 className="font-medium hover:text-primary transition-colors">{testimonial.name}</h3>
                    </a>
                    <span className="text-muted-foreground block text-sm tracking-wide">
                      {testimonial.role}
                    </span>
                  </div>
                </div>

                <blockquote className="mt-4">
                  <p className="text-sm leading-relaxed text-balance whitespace-pre-line">{testimonial.quote}</p>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Small note about sources / authenticity */}
        <div className="mt-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            Catatan: testimoni di atas disusun berdasarkan rangkuman pengalaman alumni Stockwise Masterclass
            (4 hari intensif &gt;10 jam) dan laporan publik peserta. Hasil individual dapat berbeda-beda. 
          </p>
        </div>
      </div>
    </section>
  )
}
