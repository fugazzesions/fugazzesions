'use client';

import { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id);

  const active = tabs.find((t) => t.id === activeTab);

  return (
    <>
      <div className="flex gap-2.5 border-b-2 border-ink mx-4">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2.5 border-2 border-ink border-b-0 rounded-t-md
                text-xs font-bold uppercase tracking-[0.1em]
                relative top-0.5
                ${isActive
                  ? 'bg-paper text-ink'
                  : 'bg-ink text-paper'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  {tab.count.toString().padStart(2, '0')}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div>{active?.content}</div>
    </>
  );
}