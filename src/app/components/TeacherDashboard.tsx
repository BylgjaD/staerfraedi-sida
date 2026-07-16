import StatCard from "./StatCard"; 
import { Users, Activity, AlertTriangle, Flag } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div className="p-6">        
      <h1 className="text-2xl font-bold mb-6">
      Kennarayfirlit
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
            icon={<Users />}
            value={18}
            title="Nemendur"
        />
        <StatCard
            icon={<Activity />}
            value={12}
            title="Virkir í dag"
        />
        <StatCard
            icon={<AlertTriangle />}
            value={3}
            title="Þurfa aðstoð"
        />
        <StatCard
            icon={<Flag />}
            value={5}
            title="Lokið í dag"
        />
      </div>
    </div>
  );
}
