import { ReactNode } from "react";

type StatCardProps = {
    title: string
    value: string | number
    icon: ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
    return (
         <div className="bg-card border rounded-xl p-6">
      <div className="mb-4 text-blue-600">
        {icon}
      </div>

      <div className="text-3xl font-bold">
        {value}
      </div>

      <p className="text-sm text-muted-foreground mt-1">
        {title}
      </p>
    </div>
  );
}