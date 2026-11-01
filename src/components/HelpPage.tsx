import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Package,
  Truck,
  RotateCcw,
  Ruler,
  CreditCard,
  ChevronDown,
  MessageSquare,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
} from 'lucide-react'
import Footer from './Footer'
import { InlineFieldError } from './feedback'
import './HelpPage.css'

interface FAQItem {
  id: string
  topic: string
  question: string
  answer: string
}

const FAQ_DATA: FAQItem[] = [
  // Orders
  {
    id: 'orders-how-to-place',
    topic: 'Orders',
    question: 'How do I place an order?',
    answer:
      "Browse our collection, select your preferred size and colour, and choose 'Add to Bag'. When you're ready, proceed to your bag and continue to checkout. As this storefront is currently in preview mode, official order placement will be available once we launch.",
  },
  {
    id: 'orders-cancel-change',
    topic: 'Orders',
    question: 'Can I change or cancel my order?',
    answer:
      'Order modification and cancellation capabilities will be published here alongside our launch operations. If you need assistance with an inquiry, please contact our team.',
  },

  // Shipping
  {
    id: 'shipping-info',
    topic: 'Shipping',
    question: 'Where can I find shipping information?',
    answer:
      'Shipping details, carrier partners, and delivery guidelines will be published here before launch. Tracked doorstep delivery across India is currently being prepared.',
  },
  {
    id: 'shipping-track',
    topic: 'Shipping',
    question: 'How can I track my order?',
    answer:
      'Order tracking will be enabled when our logistics network goes live. Tracking links will be provided via SMS and email confirmation once orders dispatch.',
  },

  // Returns & Exchanges
  {
    id: 'returns-policy',
    topic: 'Returns & Exchanges',
    question: 'What is your return or exchange policy?',
    answer:
      'Our official policy will be published here before launch. Please contact our team for assistance with any policy inquiries.',
  },
  {
    id: 'returns-request',
    topic: 'Returns & Exchanges',
    question: 'How do I request a return or exchange?',
    answer:
      'A self-service return and exchange portal will be integrated prior to our store launch. Until then, our support team is available to assist.',
  },

  // Products & Sizing
  {
    id: 'products-choose-size',
    topic: 'Products & Sizing',
    question: 'How do I choose the right size?',
    answer:
      'Each product detail page displays available sizes (S through XXL) and garment specifications. A complete sizing guide with detailed body measurements will be available soon.',
  },
  {
    id: 'products-check-availability',
    topic: 'Products & Sizing',
    question: 'How can I check product availability?',
    answer:
      'Stock status is indicated directly on each product card and product page. Unavailable sizes or out-of-stock items are visually disabled.',
  },

  // Payments
  {
    id: 'payments-methods',
    topic: 'Payments',
    question: 'Which payment methods will be available?',
    answer:
      'Our confirmed payment options will be announced at launch, covering standard Indian digital payment methods including UPI, cards, and net banking. No payments are collected during this preview period.',
  },
  {
    id: 'payments-verify',
    topic: 'Payments',
    question: 'How can I check whether my payment was successful?',
    answer:
      'Payment verification steps and instant receipt notifications will be published once our payment gateway is activated at launch.',
  },
]

const TOPIC_CONFIG = [
  { name: 'All Topics', icon: MessageSquare },
  { name: 'Orders', icon: Package },
  { name: 'Shipping', icon: Truck },
  { name: 'Returns & Exchanges', icon: RotateCcw },
  { name: 'Products & Sizing', icon: Ruler },
  { name: 'Payments', icon: CreditCard },
] as const

interface ContactFormValues {
  name: string
  email: string
  topic: string
  message: string
}

interface ContactFormErrors {
  name?: string
  email?: string
  topic?: string
  message?: string
}

export default function HelpPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTopic = searchParams.get('topic') || 'All Topics'

  const [activeTopic, setActiveTopic] = React.useState<string>(initialTopic)
  const [openIds, setOpenIds] = React.useState<string[]>([FAQ_DATA[0].id])
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false)

  // Contact form state
  const [formValues, setFormValues] = React.useState<ContactFormValues>({
    name: '',
    email: '',
    topic: 'General Inquiry',
    message: '',
  })
  const [formErrors, setFormErrors] = React.useState<ContactFormErrors>({})
  const [formTouched, setFormTouched] = React.useState<Record<string, boolean>>({})
  const [formSubmitted, setFormSubmitted] = React.useState(false)

  // Scroll to hash on mount if present (e.g. #contact)
  React.useEffect(() => {
    if (window.location.hash === '#contact') {
      const el = document.getElementById('contact')
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  // Sync state if topic query param changes
  React.useEffect(() => {
    const topicFromUrl = searchParams.get('topic')
    if (topicFromUrl) {
      setActiveTopic(topicFromUrl)
      // Automatically open the first FAQ in that topic
      const firstInTopic = FAQ_DATA.find((f) => f.topic.toLowerCase() === topicFromUrl.toLowerCase())
      if (firstInTopic) {
        setOpenIds([firstInTopic.id])
      }
    }
  }, [searchParams])

  // Select topic
  const handleSelectTopic = (topic: string) => {
    setActiveTopic(topic)
    const newParams = new URLSearchParams(searchParams)
    if (topic === 'All Topics') {
      newParams.delete('topic')
    } else {
      newParams.set('topic', topic)
    }
    setSearchParams(newParams, { replace: true })

    // Open first FAQ of the selected topic
    if (topic !== 'All Topics') {
      const firstInTopic = FAQ_DATA.find((f) => f.topic === topic)
      if (firstInTopic) {
        setOpenIds([firstInTopic.id])
      }
    }
  }

  // Toggle accordion item
  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Filtered FAQs
  const displayedFAQs = React.useMemo(() => {
    if (activeTopic === 'All Topics') {
      return FAQ_DATA
    }
    return FAQ_DATA.filter(
      (f) => f.topic.toLowerCase() === activeTopic.toLowerCase()
    )
  }, [activeTopic])

  // Group displayed FAQs by topic if "All Topics" is selected
  const groupedFAQs = React.useMemo(() => {
    const groups: Record<string, FAQItem[]> = {}
    displayedFAQs.forEach((item) => {
      if (!groups[item.topic]) {
        groups[item.topic] = []
      }
      groups[item.topic].push(item)
    })
    return groups
  }, [displayedFAQs])

  // Contact form validation
  const validateForm = (): boolean => {
    const errors: ContactFormErrors = {}

    if (!formValues.name.trim()) {
      errors.name = 'Please enter your name.'
    } else if (formValues.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.'
    }

    if (!formValues.email.trim()) {
      errors.email = 'Enter a valid email address, such as name@example.com.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) {
      errors.email = 'Enter a valid email address, such as name@example.com.'
    }

    if (!formValues.message.trim()) {
      errors.message = 'Please enter your message.'
    } else if (formValues.message.trim().length < 10) {
      errors.message = 'Please provide a little more detail (at least 10 characters).'
    }

    setFormErrors(errors)
    setFormTouched({ name: true, email: true, topic: true, message: true })
    return Object.keys(errors).length === 0
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setFormSubmitted(true)
    } else {
      const order = ['contact-name', 'contact-email', 'contact-message']
      setTimeout(() => {
        for (const id of order) {
          const el = document.getElementById(id)
          if (el && el.getAttribute('aria-invalid') === 'true') {
            el.focus()
            break
          }
        }
      }, 50)
    }
  }

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false)
    setFormSubmitted(false)
  }

  return (
    <div className="help-page">
      {/* 2. PAGE INTRODUCTION */}
      <section className="help-intro" aria-labelledby="help-heading">
        <div className="help-container">
          <div className="help-intro-content">
            <p className="help-eyebrow">
              <span className="help-eyebrow-dot" aria-hidden="true" />
              Customer Care
            </p>
            <h1 id="help-heading" className="help-heading">
              How Can We Help?
            </h1>
            <p className="help-supporting-text">
              Need a hand with something? Find answers to common questions or get
              in touch with our team.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HELP TOPIC NAVIGATION */}
      <div className="help-topics-wrapper" aria-label="Help topics filter">
        <div className="help-container">
          <div className="help-topics-scroll" role="tablist">
            {TOPIC_CONFIG.map(({ name, icon: Icon }) => {
              const isActive = activeTopic.toLowerCase() === name.toLowerCase()
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectTopic(name)}
                  className={`help-topic-btn ${
                    isActive ? 'help-topic-btn--active' : ''
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  <span>{name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="help-faq-section" aria-labelledby="faq-heading">
        <div className="help-container">
          <div className="help-faq-inner">
            <div className="border-b border-line pb-4 mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <h2 id="faq-heading" className="help-faq-title">
                The Details, Made Simple.
              </h2>
              {activeTopic !== 'All Topics' && (
                <button
                  type="button"
                  onClick={() => handleSelectTopic('All Topics')}
                  className="text-xs font-bold uppercase tracking-wider text-soft hover:text-fox transition-colors underline underline-offset-4 self-start"
                >
                  Show all questions
                </button>
              )}
            </div>

            {/* Questions by Group */}
            {Object.entries(groupedFAQs).map(([topicName, items]) => (
              <div key={topicName} className="help-category-group">
                {activeTopic === 'All Topics' && (
                  <div className="help-category-badge">
                    <span>{topicName}</span>
                  </div>
                )}

                <div className="divide-y divide-line border-t border-line">
                  {items.map((item) => {
                    const isOpen = openIds.includes(item.id)
                    const panelId = `panel-${item.id}`
                    const triggerId = `trigger-${item.id}`

                    return (
                      <div key={item.id} className="help-accordion-item">
                        <button
                          type="button"
                          id={triggerId}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => toggleAccordion(item.id)}
                          className="help-accordion-trigger"
                        >
                          <span>{item.question}</span>
                          <ChevronDown
                            size={18}
                            className={`help-accordion-chevron ${
                              isOpen ? 'help-accordion-chevron--open' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div
                            id={panelId}
                            role="region"
                            aria-labelledby={triggerId}
                            className="help-accordion-panel"
                          >
                            <p>{item.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CONTACT SECTION */}
      <section
        id="contact"
        className="help-contact-section"
        aria-labelledby="contact-heading"
      >
        <div className="help-container">
          <div className="help-contact-inner">
            <p className="help-eyebrow">
              <span className="help-eyebrow-dot" aria-hidden="true" />
              Need a Little More Help?
            </p>

            <h2 id="contact-heading" className="help-contact-heading">
              Let's Talk.
            </h2>

            <p className="help-contact-desc">
              Can't find what you're looking for? Reach out to our team and we'll
              help you find the right answer.
            </p>

            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="help-contact-btn"
            >
              <span>CONTACT OUR TEAM</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT FORM MODAL */}
      {isContactModalOpen && (
        <div
          className="help-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseContactModal()
            }
          }}
        >
          <div className="help-contact-modal">
            <div className="help-modal-header">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-soft">
                  Customer Support
                </p>
                <h3
                  id="contact-modal-title"
                  className="font-display text-xl font-black uppercase tracking-tight text-ink sm:text-2xl mt-0.5"
                >
                  Get In Touch
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseContactModal}
                aria-label="Close contact dialog"
                className="text-soft hover:text-ink transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {formSubmitted ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand text-fox mb-4">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
                  Contact Preview Received
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-soft leading-relaxed max-w-sm mx-auto">
                  Thank you, <strong className="text-ink">{formValues.name}</strong>!
                  Your message regarding <span className="font-medium text-ink">{formValues.topic}</span> has
                  been recorded for this session.
                </p>
                <p className="mt-3 text-[11px] text-soft bg-sand/60 p-3 rounded">
                  Contact preview — our customer support channels will be live
                  at launch. No message is sent to an external server.
                </p>
                <button
                  type="button"
                  onClick={handleCloseContactModal}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-ink px-7 text-xs font-bold uppercase tracking-wider text-paper hover:bg-fox transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} noValidate>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="contact-name" className="help-form-label">
                      Your Name <span className="text-fox">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      value={formValues.name}
                      onChange={(e) => {
                        setFormValues((p) => ({ ...p, name: e.target.value }))
                        if (formErrors.name) setFormErrors((p) => ({ ...p, name: undefined }))
                      }}
                      aria-invalid={Boolean(formErrors.name && formTouched.name)}
                      aria-describedby={formErrors.name && formTouched.name ? 'contact-name-error' : undefined}
                      className="help-form-input"
                      placeholder="e.g. Karan Roy"
                    />
                    {formTouched.name && (
                      <InlineFieldError id="contact-name-error" message={formErrors.name} />
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="contact-email" className="help-form-label">
                      Email Address <span className="text-fox">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      value={formValues.email}
                      onChange={(e) => {
                        setFormValues((p) => ({ ...p, email: e.target.value }))
                        if (formErrors.email) setFormErrors((p) => ({ ...p, email: undefined }))
                      }}
                      aria-invalid={Boolean(formErrors.email && formTouched.email)}
                      aria-describedby={formErrors.email && formTouched.email ? 'contact-email-error' : undefined}
                      className="help-form-input"
                      placeholder="karan@example.com"
                    />
                    {formTouched.email && (
                      <InlineFieldError id="contact-email-error" message={formErrors.email} />
                    )}
                  </div>

                  {/* Topic */}
                  <div>
                    <label htmlFor="contact-topic" className="help-form-label">
                      Topic
                    </label>
                    <select
                      id="contact-topic"
                      value={formValues.topic}
                      onChange={(e) =>
                        setFormValues((p) => ({ ...p, topic: e.target.value }))
                      }
                      className="help-form-select"
                    >
                      <option value="Orders">Orders</option>
                      <option value="Shipping">Shipping</option>
                      <option value="Returns & Exchanges">Returns &amp; Exchanges</option>
                      <option value="Products & Sizing">Products &amp; Sizing</option>
                      <option value="Payments">Payments</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="help-form-label">
                      Message <span className="text-fox">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      value={formValues.message}
                      onChange={(e) => {
                        setFormValues((p) => ({ ...p, message: e.target.value }))
                        if (formErrors.message) setFormErrors((p) => ({ ...p, message: undefined }))
                      }}
                      aria-invalid={Boolean(formErrors.message && formTouched.message)}
                      aria-describedby={formErrors.message && formTouched.message ? 'contact-message-error' : undefined}
                      className="help-form-textarea"
                      placeholder="Tell us what you need help with..."
                    />
                    {formTouched.message && (
                      <InlineFieldError id="contact-message-error" message={formErrors.message} />
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-line">
                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-fox px-6 text-xs font-bold uppercase tracking-[.18em] text-white transition-colors hover:bg-fox-deep shadow-sm"
                  >
                    <span>Send Message</span>
                    <Send size={14} />
                  </button>
                  <p className="mt-2 text-center text-[10.5px] text-soft">
                    Preview mode • No actual message will be dispatched
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  )
}

