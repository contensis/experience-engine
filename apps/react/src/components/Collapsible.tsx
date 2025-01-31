import React, { useEffect, useState } from "react";

const Collapsible = ({
  children,
  header = null,
  label = "",
  openState = false,
  onToggle,
}: {
  header?: React.JSX.Element | null;
  children: React.JSX.Element | null;
  label?: string;
  openState?: boolean;
  onToggle?: (state: boolean) => void;
}) => {
  const [open, setOpen] = useState(openState);
  useEffect(() => {
    if (onToggle) onToggle(open);
  }, [open, onToggle]);
  return (
    <div>
      <button
        className="collapsible"
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? "Close" : "View"} {label}
      </button>
      {header}
      {open && <div className="toggle">{children}</div>}
    </div>
  );
};

export default Collapsible;
