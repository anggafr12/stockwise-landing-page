"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Logo } from '@/components/logo'
import { Instagram, Youtube, Globe } from 'lucide-react'

const newsletterSchema = z.object({
  email: z.string().email({
    message: "Mohon masukkan alamat email yang valid.",
  }),
})

const footerLinks = {
  product: [
    { name: 'Kelas & Masterclass', href: 'https://stockwise.id/masterclass' },
    { name: 'Paket & Harga', href: '#pricing' },
    { name: 'Testimoni', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ],
  company: [
    { name: 'Tentang Stockwise', href: 'https://stockwise.id' },
    { name: 'Tim & Mentor', href: '#team' },
    { name: 'Karir', href: 'https://glints.com/id/companies/stockwise-indonesia' },
    { name: 'Blog & Artikel', href: '#blog' },
  ],
  resources: [
    { name: 'Komunitas (Discord)', href: 'https://discord.com/invite/stockwise' },
    { name: 'Panduan Pendaftaran', href: '#contact' },
    { name: 'Kebijakan Privasi', href: 'https://privacy.stockwise.id/' },
    { name: 'Syarat & Ketentuan', href: '#terms' },
  ],
  legal: [
    { name: 'Privacy Policy', href: 'https://privacy.stockwise.id/' },
    { name: 'Return and Refund Policy', href: 'https://www.stockwise.id/refund-policy' },
  ],
}

const socialLinks = [
  { name: 'Instagram', href: 'https://www.instagram.com/stockwise.id/', icon: Instagram },
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UCS2PVh8IoDD8vWxaYHnvdxA', icon: Youtube },
  { name: 'Website', href: 'https://stockwise.id', icon: Globe },
]

export function LandingFooter() {
  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof newsletterSchema>) {
    // TODO: kirim ke backend / layanan newsletter kamu
    console.log("subscribe:", values)
    form.reset()
    // di aplikasi nyata: tampilkan toast/sukses
  }

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter Section */}
        <div className="mb-16">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Dapatkan Info Kelas & Batch</h3>
            <p className="text-muted-foreground mb-6">
              Berlangganan untuk pengumuman batch terbaru, promo pendaftaran, dan materi gratis dari Stockwise.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 max-w-md mx-auto sm:flex-row">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@contoh.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="cursor-pointer">Berlangganan</Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid gap-8 grid-cols-4 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="col-span-4 lg:col-span-2 max-w-2xl">
            <div className="flex items-center space-x-2 mb-4 max-lg:justify-center">
              <a href="https://stockwise.id" target='_blank' rel="noopener noreferrer" className="flex items-center space-x-2 cursor-pointer">
                <Logo size={36} />
                <span className="font-bold text-xl">Stockwise</span>
              </a>
            </div>
            <p className="text-muted-foreground mb-4 max-lg:text-center">
              Platform edukasi & komunitas investasi saham — Masterclass intensif, mentoring, dan komunitas untuk membantu Anda menjadi investor yang lebih percaya diri.
            </p>

            <div className="flex items-center gap-2 mb-3 max-lg:justify-center">
              <span className="text-sm text-muted-foreground">Info pendaftaran / WA:</span>
              <a href="https://wa.me/6285283861223" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium">
                +62 852-8386-1223
              </a>
            </div>

            <div className="flex space-x-4 max-lg:justify-center">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="icon" asChild>
                  <a
                    href={social.href}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className='max-md:col-span-2 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Program</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='max-md:col-span-2 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Perusahaan</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='max-md:col-span-2 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Komunitas & Bantuan</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='max-md:col-span-2 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-2">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-muted-foreground text-sm">
            <span>© {new Date().getFullYear()} Stockwise — Semua hak dilindungi.</span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-4 md:mt-0">
            <a href="https://privacy.stockwise.id/" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#cookies" className="hover:text-foreground transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
