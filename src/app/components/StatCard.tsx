import {
  Card,
  CardContent,
} from "./ui/card";
import { ReactNode } from "react";

const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  purple: "bg-purple-100 text-purple-600",
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: keyof typeof colorClasses;
};

export default function StatCard({
  title,
  value,
  icon,
  color = "blue",
}: StatCardProps) {
  return (
<Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
  <CardContent className="p-6">
    <div
  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${colorClasses[color]}`}
>
  {icon}
</div>
    <div className="text-3xl font-bold tracking-tight">
      {value}
    </div>
    <p className="mt-2 text-sm text-muted-foreground">
      {title}
    </p>
  </CardContent>
</Card>
 );
}