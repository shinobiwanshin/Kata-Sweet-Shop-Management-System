import * as React from "react";
import { cn } from "../../lib/utils";

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange,
            isOpen,
            setIsOpen,
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ children, className, isOpen, setIsOpen }) => (
  <button
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
  >
    {children}
  </button>
);

const SelectValue = ({ placeholder, value }) => (
  <span>{value || placeholder}</span>
);

const SelectContent = ({ children, isOpen, setIsOpen, onValueChange }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md animate-in fade-in-80 w-full mt-1">
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onClick: (val) => {
                onValueChange(val);
                setIsOpen(false);
              },
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const SelectItem = ({ children, value, onClick, className }) => (
  <div
    onClick={() => onClick(value)}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 cursor-pointer",
      className
    )}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {/* Check icon could go here */}
    </span>
    <span className="truncate">{children}</span>
  </div>
);

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};

const SelectGroup = ({ children }) => <div>{children}</div>;
const SelectLabel = ({ children }) => (
  <div className="py-1.5 pl-8 pr-2 text-sm font-semibold">{children}</div>
);
const SelectSeparator = () => <div className="-mx-1 my-1 h-px bg-muted" />;
