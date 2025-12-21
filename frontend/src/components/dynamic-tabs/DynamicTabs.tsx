import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { TabItem } from "@/interface/DynamicTabs";

interface DynamicTabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  tabClassName?: string;
  tabsListClassName?: string;
  tabsContentClassName?: string;
  onTabChange?: (tabId: string) => void;
}

export const DynamicTabs: React.FC<DynamicTabsProps> = ({
  tabs,
  defaultTabId,
  tabClassName,
  tabsListClassName,
  tabsContentClassName,
  onTabChange,
}) => {
  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <Tabs
      defaultValue={defaultTabId || tabs[0]?.id}
      className={cn("w-full", tabClassName)}
      onValueChange={onTabChange}
    >
      <TabsList className={cn("w-full justify-start", tabsListClassName)}>
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className={cn("mt-4", tabsContentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
