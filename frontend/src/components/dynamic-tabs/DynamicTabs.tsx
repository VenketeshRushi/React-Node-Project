import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { TabItem } from "@/interface/DynamicTabs";

interface DynamicTabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  tabClassName?: string;
  onTabChange?: (tabId: string) => void;
}

export const DynamicTabs: React.FC<DynamicTabsProps> = ({
  tabs,
  defaultTabId,
  tabClassName,
  onTabChange,
}) => {
  return (
    <Tabs
      defaultValue={defaultTabId || tabs[0]?.id}
      className={cn("", tabClassName)}
      onValueChange={onTabChange}
    >
      <TabsList className='flex space-x-4 border-b border-primary-200 mb-4 px-2'>
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className='cursor-pointer px-2 py-2'
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
