import { useState } from "react";
import StatCard from "./StatCard"; 
import PageHeader from "./PageHeader";
import { Users, Activity, AlertTriangle, Flag } from "lucide-react";
import { UserData } from "../../lib/types";

interface TeacherDashboardProps {
    currentUser: UserData;
  }

export default function TeacherDashboard( {currentUser}: TeacherDashboardProps) {
 const [activeTab, setActiveTab] = useState("overview");
  const hour = new Date().getHours();
  let greeting = "Góðan daginn";
   let description = "Fáðu yfirlit yfir nemendur, virkni og verkefni dagsins.";
  
  if (hour >= 18) {
    greeting = "Góða kvöldið";
    description = "Svona gekk dagurinn hjá nemendum."; 
  } else if (hour < 6) {
    greeting = "Góða nótt";
    description = "Sjáumst fersk á morgun!";
  }
  return (
    <div className="p-6">        
      <PageHeader
  title={`${greeting}, ${currentUser.name}!`}
  description={description}
/>
 <div className="flex gap-4 border-b mb-6 mt-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2 px-1 font-medium transition-all ${
            activeTab === "overview" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
          }`}
        >
          Yfirlit
        </button>
         <button
        onClick={() => setActiveTab("lessons")}
        className={`pb-2 px-1 font-medium transition-all ${
          activeTab === "lessons" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
        }`}
      >
        Kennslustundir
      </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`pb-2 px-1 font-medium transition-all ${
            activeTab === "notes" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
          }`}
        >
          Glósur
        </button>
        <button
        onClick={() => setActiveTab("students")}
        className={`pb-2 px-1 font-medium transition-all ${
          activeTab === "lessons" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
        }`}
      >
        Nemendur
      </button>
      </div>
      
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users />} value={18} title="Nemendur" color="blue" />
          <StatCard icon={<Activity />} value={12} title="Virkir í dag" color="green" />
          <StatCard icon={<AlertTriangle />} value={3} title="Þurfa aðstoð" color="orange" />
          <StatCard icon={<Flag />} value={5} title="Lokið í dag" color="purple" />
        </div>
      )}
      {activeTab === "lessons" && (
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="text-lg font-bold mb-2">Kennslustundir</h3>
        <p className="text-muted-foreground text-sm"> Hérna koma kennslustundir.</p>
      </div>
    )}

      {activeTab === "notes" && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold mb-2">Glósur</h3>
          <p className="text-muted-foreground text-sm">Hér koma glósur seinna.</p>
        </div>
      )}
       {activeTab === "students" && (
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="text-lg font-bold mb-2">Nemendur</h3>
        <p className="text-muted-foreground text-sm"> Hérna koma þínir nemendur. </p>
      </div>
    )}

    </div> 
  );
}
