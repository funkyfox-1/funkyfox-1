import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion'
import './FAQSection.css'

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQSectionProps {
  title?: string
  subtitle?: string
  contactPrompt?: string
  contactLinkText?: string
  contactHref?: string
  items?: FAQItem[]
}

const FIVE_ESSENTIAL_FAQS: FAQItem[] = [
  {
    question: 'What makes Funky Fox garments different?',
    answer:
      'All our tees and everyday layers are custom-knitted from 220 GSM heavyweight combed organic cotton. It features a dense, structured drape that prevents bacon-neck collars, retains its shape wash after wash, and undergoes bio-silicon pre-washing to eliminate shrinkage.',
  },
  {
    question: 'How long does delivery take and where do orders ship from?',
    answer:
      'Orders are dispatched within 24 hours from our Vijayawada flagship fulfilment depot (Door No. 40-1-58, MG Road, Near Benz Circle · 520010). Standard pan-India delivery takes 2–4 business days with live SMS & WhatsApp tracking. All orders over ₹1,499 receive automatic free doorstep delivery.',
  },
  {
    question: 'What is your return and doorstep exchange policy?',
    answer:
      'We offer a 15-day risk-free doorstep exchange policy. If the size or fit isn’t perfect, request an exchange in two clicks and our express courier picks it up directly from your doorstep with zero pickup fees.',
  },
  {
    question: 'How do I choose my ideal size and fit?',
    answer:
      'Our fits are relaxed true-to-size. For an effortless modern drape, pick your regular size. Check our detailed size guide on each product page for exact chest, shoulder, and length measurements.',
  },
  {
    question: 'Which payment methods do you support?',
    answer:
      'We accept UPI (Google Pay, PhonePe, Paytm, BHIM), all Visa / Mastercard / RuPay credit and debit cards, NetBanking, and Cash on Delivery (COD) across 19,000+ pin codes in India.',
  },
]

export default function FAQSection({
  title = 'FAQs',
  subtitle = 'Everything you need to know about Funky Fox',
  contactPrompt = "Can’t find what you’re looking for? Reach out to our",
  contactLinkText = 'Funky Fox support team',
  contactHref = '/help',
  items = FIVE_ESSENTIAL_FAQS,
}: FAQSectionProps) {
  // Use the 5 core FAQs
  const displayItems = items && items.length > 0 ? items.slice(0, 5) : FIVE_ESSENTIAL_FAQS

  return (
    <section
      id="faq"
      className="fox-faq-section scroll-mt-20 py-16 sm:py-20 lg:py-24"
      aria-labelledby="faq-heading"
    >
      <div className="fox-faq-container">
        <div className="fox-faq-grid">
          {/* Left Column: Heading + Subtitle + Support Note (2-column layout matching Ruixen UI reference) */}
          <div className="fox-faq-left">
            <h2 id="faq-heading" className="fox-faq-heading">
              {title}
            </h2>
            <p className="fox-faq-desc">
              {subtitle}
            </p>
            <p className="fox-faq-contact">
              {contactPrompt}{' '}
              <Link to={contactHref} className="fox-faq-contact-link">
                {contactLinkText}
              </Link>{' '}
              for assistance.
            </p>
          </div>

          {/* Right Column: 5 Questions with Thin Dividers & Text Reveal Accordion */}
          <div className="fox-faq-right">
            <Accordion type="single" collapsible className="w-full">
              {displayItems.map((item, index) => (
                <AccordionItem
                  key={`faq-${index}`}
                  value={`faq-${index}`}
                  className="fox-faq-item"
                >
                  <AccordionTrigger className="fox-faq-trigger group">
                    <span className="fox-faq-q-text">{item.question}</span>
                    <span className="fox-faq-icon-wrap" aria-hidden="true">
                      <ChevronDown size={18} className="fox-faq-chevron" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="fox-faq-content">
                    <p className="fox-faq-a-text">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
