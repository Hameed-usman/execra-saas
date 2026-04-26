"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Accordion, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

const FAQS = [
  {
    value: "item-1",
    question: "Is my Gmail data safe?",
    answer: "Yes. STRATARA uses strict OAuth scopes and never stores your email content. Agents only read threads they initiate or are explicitly cc'd on. We undergo annual SOC2 Type II audits.",
  },
  {
    value: "item-2",
    question: "Do emails send automatically?",
    answer: "No. By default, every outbound message is added to your Approval Queue. You can review, edit, or approve with one click. Once you trust an agent, you can toggle it to 'Autonomous Mode'.",
  },
  {
    value: "item-3",
    question: "What if I'm not on Stripe yet?",
    answer: "The CFO Agent integrates directly with Stripe, but we also support manual CSV uploads and Quickbooks via API. However, to get the full real-time runway experience, Stripe is highly recommended.",
  },
];

export const FAQ = () => {
  const [value, setValue] = useState("");

  return (
    <section className="w-full max-w-[720px] mx-auto px-6 py-24 sm:py-32" aria-labelledby="faq-heading">
      {/* Section Header */}
      <div className="mb-16 text-center">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-[13px] text-[var(--accent-violet)] mb-4 tracking-wider"
        >
          {`// section — faq`}
        </m.div>
        <m.h2
          id="faq-heading"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="font-heading font-extrabold text-[clamp(28px,4vw,48px)] text-[var(--text-base)] leading-[1.1] tracking-tight mb-4"
        >
          COMMON QUESTIONS.
        </m.h2>
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Accordion 
          type="single" 
          collapsible 
          className="w-full"
          value={value}
          onValueChange={setValue}
        >
          {FAQS.map((faq) => (
            <AccordionItem key={faq.value} value={faq.value}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionPrimitive.Content forceMount asChild>
                <AnimatePresence initial={false}>
                  {value === faq.value && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pt-0 px-4 font-sans text-[15px] text-[rgba(var(--text-base-rgb),0.65)] leading-[1.7]">
                        {faq.answer}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </AccordionPrimitive.Content>
            </AccordionItem>
          ))}
        </Accordion>
      </m.div>
    </section>
  );
};

export default FAQ;
