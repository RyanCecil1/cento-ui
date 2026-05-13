"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useState } from "react";
import type { FAQItem } from "@/data/site";

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="grid gap-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <button
            key={item.question}
            className="w-full rounded-lg border border-line bg-white p-6 text-left shadow-[var(--shadow-quiet)]"
            onClick={() => setOpenIndex(isOpen ? -1 : index)}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {item.question}
                </h3>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                    isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-3xl text-sm leading-7 text-muted">{item.answer}</p>
                  </div>
                </div>
              </div>
              <CaretDown
                size={18}
                className={`mt-1 shrink-0 text-primary transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                weight="bold"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
