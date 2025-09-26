"use client"

import {
  Users,
  Clock,
  Award,
  Globe
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DotPattern } from '@/components/dot-pattern'

const stats = [
  {
    icon: Users,
    value: '2.000+',
    label: 'Member aktif',
    description: 'Komunitas Stockwise yang berdedikasi'
  },
  {
    icon: Clock,
    value: '10+ jam',
    label: 'Durasi Materi',
    description: 'Total jam kelas intensif'
  },
  {
    icon: Award,
    value: '99% Feedback',
    label: 'Satisfaction Rate',
    description: 'Kepuasan peserta rata-rata'
  },
  {
    icon: Globe,
    value: 'Indonesia',
    label: 'Cakupan Nasional',
    description: 'Member dari berbagai kota'
  }
]

export function StatsSection() {
  return (
    <section className="py-12 sm:py-16 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/20" />
      <DotPattern className="opacity-75" size="md" fadeStyle="circle" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center bg-background/60 backdrop-blur-sm border-border/50 py-0"
            >
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {stat.value}
                  </h3>
                  <p className="font-semibold text-foreground">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
