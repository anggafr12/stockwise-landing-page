"use client"

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const plans = [
  {
    name: 'PREMIUM',
    description: 'Learn the fundamental of stock market to get multibagger profit.',
    price: 8_000_000,
    cta: 'Daftar Sekarang',
    features: [
      '4 days online class via Zoom',
      'Live Q&A via Zoom',
      '10 hours+ class',
      'Access Stockwise community',
    ],
    popular: false,
  },
  {
    name: 'VIP',
    description: 'Learn from our founder story to get the next multibagger stocks.',
    price: 13_000_000,
    oldPrice: 175_000_000,
    cta: 'Daftar Sekarang',
    features: [
      '4 days online class via Zoom',
      'Live Q&A via Zoom',
      '10 hours+ class',
      'Access Stockwise community',
      'FREE 1 day offline meet up',
      'Get bonus worth of 175 JT',
    ],
    popular: true,
  },
  {
    name: 'UPGRADE',
    description: 'Upgrade your membership to VIP and get more benefits.',
    price: 5_000_000,
    cta: 'Upgrade to VIP',
    features: [
      '4 days online class via Zoom',
      'Live Q&A via Zoom',
      '10 hours+ class',
      'Access Stockwise community',
      'FREE 1 day offline meet up',
    ],
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        

        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-6 text-lg px-4 py-2">
            Paket <span className="font-bold">Belajar</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Pilih Paket Stockwise Akademi
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Mulai dari belajar fundamental hingga strategi multibagger bersama mentor berpengalaman.
          </p>
        </div>

        {/* Info Next Batch */}
        <div className="text-center mb-6">
          <h2 className="text-sm font-medium text-primary">
            Next Batch : <span className="font-semibold">2–6 September 2025</span>
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border">
            <div className="grid lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`p-8 grid grid-rows-subgrid row-span-4 gap-6 ${
                    plan.popular
                      ? 'my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10 backdrop-blur'
                      : ''
                  }`}
                >
                  {/* Header */}
                  <div>
                    <div className="text-lg font-semibold tracking-tight mb-2 flex items-center justify-between">
                      {plan.name}
                      {plan.popular && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm">{plan.description}</div>
                  </div>

                  {/* Harga */}
                  <div>
                    {plan.oldPrice && (
                      <div className="text-muted-foreground line-through text-sm">
                        Rp {plan.oldPrice.toLocaleString('id-ID')}
                      </div>
                    )}
                    <div className="text-4xl font-bold mb-1">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </div>
                    <div className="text-muted-foreground text-sm">Satu kali bayar</div>
                  </div>

                  {/* Button */}
                  <div>
                    <Button
                      className={`w-full cursor-pointer my-2 ${
                        plan.popular
                          ? 'shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90'
                          : 'shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </div>

                  {/* Features */}
                  <div>
                    <ul role="list" className="space-y-3 text-sm">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="text-muted-foreground size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Semua paket termasuk akses komunitas & materi pembelajaran.  
            Untuk pertanyaan lebih lanjut, silakan hubungi tim Stockwise Akademi.
          </p>
        </div>
      </div>
    </section>
  )
}
