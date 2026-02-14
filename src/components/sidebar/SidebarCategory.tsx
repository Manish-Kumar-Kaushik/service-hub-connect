import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ServiceCategory, ServiceItem } from "./SidebarData";

interface SidebarCategoryProps {
  category: ServiceCategory;
  isOpen: boolean;
  onToggle: () => void;
  onSelectItem: (item: ServiceItem) => void;
}

const SidebarCategory = ({ category, isOpen, onToggle, onSelectItem }: SidebarCategoryProps) => {
  const CatIcon = category.icon;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left group">
        <CatIcon className="w-[18px] h-[18px] text-foreground shrink-0" />
        <span className="flex-1 text-sm font-medium text-foreground">{category.title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 space-y-0.5 py-0.5">
          {category.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.label}
                className="flex items-center gap-3 w-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors"
                onClick={() => onSelectItem(item)}
              >
                <ItemIcon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SidebarCategory;
