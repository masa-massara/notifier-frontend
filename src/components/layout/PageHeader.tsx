import React from "react";

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode; // Optional actions
}

export default function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {actions && <div>{actions}</div>}
    </div>
  );
}
