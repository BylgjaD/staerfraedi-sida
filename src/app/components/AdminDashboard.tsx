import StatCard from "./StatCard";
import {
  Users,
  GraduationCap,
  Bell,
  ChartColumn,
} from "lucide-react";
import { useState } from "react";
import PageHeader from "./PageHeader";
import TeacherManagement from "./TeacherManagement";
import StudentManagement from "./StudentManagement";


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  return (
    <div className="p-6">
      
      <div className="mb-8">
  <PageHeader
  title="👑 Stjórnborð stjórnanda"
  description="Hér er hægt að stjórna kennurum, nemendum og fylgstu með stöðu DELTA."
/>
</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Heildarfjöldi kennara" value={24} icon={<Users />} color="blue" />
        <StatCard title="Heildarfjöldi nemenda" value={342} icon={<GraduationCap />} color="green" />
        <StatCard title="Tilkynningar" value={5} icon={<Bell />} color="orange" />
        <StatCard title="Virkni í kerfi (%)" value={98} icon={<ChartColumn />} color="purple" />
      </div>

      <div className="flex border-b border-gray-200 dark:border-zinc-800 gap-4">
        <button onClick={() => setActiveTab("overview")}>
          Yfirlit
          </button>
          <button onClick={() => setActiveTab("teachers")}>
             Kennarar
             </button>
             <button onClick={() => setActiveTab("students")}>
               Nemendur
               </button>
               <button onClick={() => setActiveTab("notifications")}>
                Tilkynningar
                </button>
                </div>
                
                <div className="mt-4">
                  {activeTab === "overview" && (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    </div>
                    <div>
                      Hér kemur yfirlitið
                       </div>
                       </>
                      )}
                       {activeTab === "teachers" && (
                        <div className="border rounded-xl p-6 bg-card shadow-sm">
                          <h2 className="text-lg font-semibold mb-2"> Yfirlit kennara</h2>
                          <p className="text-sm text-muted-foreground mb-4"> Umsjón og tafla kennara </p>
                           <p>Hér kemur TeacherManagement.</p>
                            </div>
                           )}

        {activeTab === "students" && (
          <div className="border rounded-xl p-6 bg-card shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Umsjón með nemendum</h2>
            <p className="text-sm text-muted-foreground mb-4"> Nemendalisti </p>
            <div>
              Hér kemur StudentManagement seinna. 
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="border rounded-xl p-6 bg-card shadow-sm">
            <h2 className="text-lg font-semibold mb-2">
              Tilkynningar
              </h2>
              <p className="text-sm text-muted-foreground">
                Hér birtast tilkynningar frá kerfinu.
                </p>
                </div>
              )}
              </div>
              </div>
              );
            }