import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
};

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 p-6">
      <div className="mb-4 text-blue-600">
        {icon}
      </div>

      <div className="text-3xl font-bold">
        {value}
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {title}
      </p>
    </div>
  );
}