import React, { useState } from "react";

const Collapsible = ({
  children,
  header = null,
  label,
}: {
  header: React.JSX.Element | null;
  children: React.JSX.Element | null;
  label: string;
}) => {
  const [open, setOpen] = useState(true);
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
