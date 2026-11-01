import * as React from 'react'
import { cn } from '../../lib/utils'

interface AccordionContextType {
  openItem: string | null
  setOpenItem: (value: string | null) => void
  collapsible?: boolean
}

const AccordionContext = React.createContext<AccordionContextType | null>(null)

export interface AccordionProps {
  type?: 'single'
  collapsible?: boolean
  className?: string
  children: React.ReactNode
}

export function Accordion({ collapsible = true, className, children }: AccordionProps) {
  const [openItem, setOpenItem] = React.useState<string | null>(null)

  return (
    <AccordionContext.Provider value={{ openItem, setOpenItem, collapsible }}>
      <div className={cn('w-full', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

export interface AccordionItemProps {
  value: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

const ItemContext = React.createContext<{ value: string; isOpen: boolean }>({
  value: '',
  isOpen: false,
})

export function AccordionItem({ value, className, style, children }: AccordionItemProps) {
  const context = React.useContext(AccordionContext)
  const isOpen = context?.openItem === value

  return (
    <ItemContext.Provider value={{ value, isOpen }}>
      <div
        data-state={isOpen ? 'open' : 'closed'}
        className={cn('transition-all', className)}
        style={style}
      >
        {children}
      </div>
    </ItemContext.Provider>
  )
}

export interface AccordionTriggerProps {
  className?: string
  children: React.ReactNode
}

export function AccordionTrigger({ className, children }: AccordionTriggerProps) {
  const accordionContext = React.useContext(AccordionContext)
  const itemContext = React.useContext(ItemContext)

  const toggle = () => {
    if (!accordionContext || !itemContext) return
    if (itemContext.isOpen) {
      if (accordionContext.collapsible) {
        accordionContext.setOpenItem(null)
      }
    } else {
      accordionContext.setOpenItem(itemContext.value)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      data-state={itemContext.isOpen ? 'open' : 'closed'}
      className={cn('flex w-full cursor-pointer items-center justify-between', className)}
    >
      {children}
    </button>
  )
}

export interface AccordionContentProps {
  className?: string
  children: React.ReactNode
}

export function AccordionContent({ className, children }: AccordionContentProps) {
  const itemContext = React.useContext(ItemContext)

  if (!itemContext.isOpen) return null

  return (
    <div
      data-state={itemContext.isOpen ? 'open' : 'closed'}
      className={cn('overflow-hidden transition-all animate-in fade-in-50 duration-200', className)}
    >
      {children}
    </div>
  )
}
