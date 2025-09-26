"use client"

import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: 'item-1',
    question: 'Apa itu Stockwise Masterclass?',
    answer:
      'Kelas intensif pembelajaran tentang keuangan dan investasi saham dari nol - dengan total materi lebih dari 10 jam, yang dibagikan selama 4 hari berturut-turut (2-3 jam per hari).',
  },
  {
    value: 'item-2',
    question: 'Apakah Masterclass ini cocok untuk orang awam?',
    answer:
      `Materi yang sudah dikurasi dan disiapkan oleh tim Stockwise ini memang bertujuan untuk me-reset ulang semua pemahaman kalian tentang investasi di bursa saham, terutama di Indonesia - baik untuk pemula, sampai yang sudah berpengalaman.
      
      Allow us to re-wire how your brain thinks, and you\'ll multiply your assets in time.`,
  },
  {
    value: 'item-3',
    question: 'Apakah saya akan mendapatkan Watchlist?',
    answer:
      `Tidak ada. Kelas dan Komunitas Stockwise tidak memberikan dan juga menyarankan Watchlist, karena itu malah membuat para member kehilangan cara untuk belajar dan menganalisa untuk diri sendiri. 
      
      Namun, member yang sudah mengikuti dan menerapkan semua pelajaran dari Stockwise Masterclass, semua sudah merasakan keuntungan berlipat hingga milyaran, bahkan hingga membeli hal-hal seperti Rumah, Mobil dan barang mewah lainnya.`,
  },
  {
    value: 'item-4',
    question: 'Apakah multi-bagger hingga ribuan % akan saya rasakan juga?',
    answer:
      `Beberapa member Stockwise Masterclass Batch 2023 sudah merasakan keuntungan hingga 1,000%. Apakah kamu juga akan merasakannya? Tergantung. 
      
      Tergantung seberapa kamu menerapkan ilmu yang kamu pelajari, tergantung dengan gerakan dan perubahan bursa saham, dan tergantung management keuanganmu disaat muncul kesempatan.`,
  },
  {
    value: 'item-5',
    question: 'Apa rekening resmi untuk Stockwise Masterclass?',
    answer:
      `Ada beberapa cara untuk melakukan pembayaran, tapi yang utama hanya 2; 

      1. Melalui transfer ke rekening dengan atas nama PT. Stockwise Karya Digital. 

      2. Melalui Digital Payment Gateway (Mayar) dari link di Website ini, atau dari Official Instagram Stockwise. 
      
      Selain itu, pembayaran ke pihak yang meng-atasnamakan Stockwise tidak akan dianggap sah.`,
  },
  {
    value: 'item-6',
    question: 'Saya berhalangan untuk salah satu hari, apa saya bisa mengulang kelas?',
    answer:
      `Ya, semua member yang berhalangan dengan alasan yang tepat (bukan malas) akan diberikan kesempatan untuk re-seat, atau ikut lagi di sesi Masterclass berikutnya. 
      
      Mohon diingat, untuk member yang TIDAK berhalangan, tidak akan diizinkan mengikuti kelas berikutnya lagi tanpa mendaftar ulang.`,
  },
  {
    value: 'item-7',
    question: 'Kapan jadwal Masterclass selanjutnya?',
    answer:
      `Jadwal Stockwise Masterclass terbaru ada di 2 - 6 September 2025, ditunggu pendaftarannya! 
      
      *last updated 28 Juli 2025.`,
  },
  {
    value: 'item-8',
    question: 'Apa itu Stockwise Community?',
    answer:
      `Stockwise Community adalah komunitas (Group Chat) eksklusif untuk semua member Stockwise yang sudah lulus mengikuti Stockwise Masterclass. 
      
      Di dalam Stockwise Community, member akan bebas berdiskusi, bertanya, sharing, dan tentu saja akan mendapatkan berbagai macam perks seperti insights dan info dari tim Stockwise. Diluar itu, member juga akan bisa menikmati fasilitas khusus Member Stockwise seperti Partnership Promotion (TASA Group dan KB Valbury) dan Stockwise Platform (ETA 2023).`,
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-6 text-lg px-4 py-2">
            <span className="font-bold">FAQ</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Semua hal yang perlu kamu ketahui tentang Stockwise Masterclass & Community.
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <Accordion type='single' collapsible className='space-y-5'>
            {faqItems.map(item => (
              <AccordionItem key={item.value} value={item.value} className='rounded-md !border bg-transparent'>
                <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                      <CircleHelp className='size-5' />
                    </div>
                    <span className='text-start font-semibold'>{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='p-4 bg-transparent whitespace-pre-line'>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Masih ada pertanyaan lain? Tim Stockwise siap membantu.
            </p>
            <Button className='cursor-pointer' asChild>
              <a href="#contact">
                Hubungi Kami
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
