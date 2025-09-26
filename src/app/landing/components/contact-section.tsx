"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Mail, MessageCircle, Phone, Globe } from 'lucide-react'

/**
 * Schema form (lokalisasi pesan validasi ke Bahasa Indonesia)
 */
const contactFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "Nama depan minimal 2 karakter.",
  }),
  lastName: z.string().min(2, {
    message: "Nama belakang minimal 2 karakter.",
  }),
  email: z.string().email({
    message: "Mohon masukkan alamat email yang valid.",
  }),
  subject: z.string().min(5, {
    message: "Subjek minimal 5 karakter.",
  }),
  message: z.string().min(10, {
    message: "Pesan minimal 10 karakter.",
  }),
})

export function ContactSection() {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    // TODO: ganti dengan endpoint backend / layanan notifikasi kamu
    console.log("Contact form submitted:", values)
    // beri konfirmasi sederhana dan reset form
    // (di proyek nyata: tampilkan toast / modal / kirim ke backend)
    alert("Pesan terkirim. Tim Stockwise akan menghubungi Anda.")
    form.reset()
  }

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */} 
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-6 text-lg px-4 py-2">
            Hubungi <span className="font-bold">Stockwise</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Butuh bantuan atau informasi pendaftaran?
          </h2>
          <p className="text-lg text-muted-foreground">
            Tim Stockwise siap membantu pendaftaran, konfirmasi pembayaran, dan informasi kelas Masterclass.
            Pilih cara yang paling nyaman: WhatsApp/Telepon, Discord komunitas, Instagram, atau isi formulir di bawah.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Options (kartu kiri) */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Pendaftaran & WA */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Pendaftaran / Info (WhatsApp)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Untuk informasi pendaftaran dan konfirmasi, hubungi WhatsApp/telepon resmi Stockwise.
                </p>
                <p className="mb-3 font-medium">WA / Telepon: <span className="text-foreground">+62 852-8386-1223</span></p>
                <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                  <a href="https://wa.me/6285283861223" target="_blank" rel="noopener noreferrer">
                    Chat WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Discord Community */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Komunitas (Discord)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Gabung komunitas Stockwise untuk diskusi, Q&A, dan update batch/kelas.
                </p>
                <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                  <a href="https://discord.com/invite/stockwise" target="_blank" rel="noopener noreferrer">
                    Gabung Discord
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Website & Instagram */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Website & Media Sosial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Info resmi, pendaftaran, dan pengumuman batch biasanya dipublikasikan di website & Instagram.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                    <a href="https://stockwise.id" target="_blank" rel="noopener noreferrer">Kunjungi Website</a>
                  </Button>
                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                    <a href="https://www.instagram.com/stockwise.id/" target="_blank" rel="noopener noreferrer">Instagram</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form (kanan, lebar 2 kolom) */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Kirim Pesan ke Tim Stockwise
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Depan</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Andi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Belakang</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Wijaya" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="nama@contoh.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subjek</FormLabel>
                          <FormControl>
                            <Input placeholder="Pertanyaan pendaftaran / pembayaran / jadwal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pesan</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tuliskan pesan: mis. nama paket, bukti pembayaran, atau pertanyaan lainnya..."
                              rows={8}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full cursor-pointer">
                      Kirim Pesan
                    </Button>
                  </form>
                </Form>

                <p className="text-sm text-muted-foreground mt-4">
                  Catatan: untuk konfirmasi pembayaran, sertakan bukti transfer dan nama paket (PREMIUM / VIP / UPGRADE).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
