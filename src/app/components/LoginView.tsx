import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

function LoginView({
  onLogin,
}: {
  onLogin: (email: string, pass: string) => Promise<string | null>
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Vinsamlegast sláðu inn netfang"); return; }
    setLoading(true);
    setTimeout(async() => {
      const err = await onLogin(email.trim().toLowerCase(), password);
      if (err) setError(err);
      setLoading(false);
    }, 400);
  };
return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1e3a5f 0%, #0f2240 60%, #0a1a30 100%)" }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-5xl font-bold" style={{ color: "#c8952a" }}>Δ</span>
            <div>
              <div className="text-xl font-semibold tracking-wide">DELTA</div>
              <div className="text-xs text-white/60 tracking-widest uppercase">Mælistika í stærðfræði</div>
            </div>
          </div>
          <div className="space-y-10 mt-8">
            {[
              { icon: "δ β α", label: "Þrjú stig", desc: "Delta · Beta · Alpha" },
              { icon: "7", label: "Sjö flokkar", desc: "Frá talnaskilningi - fjármála" },
              { icon: "🔓", label: "Kerfisbundið", desc: "Þú kemst hærra með því að klára hvern flokk" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "rgba(200,149,42,0.2)", color: "#c8952a" }}>
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-sm text-white/50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-white/30 text-sm">
          Kennari? Notaðu: kennari@delta.is
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-5"
          style={{ background: "#c8952a" }} />
        <div className="absolute top-20 -right-10 w-48 h-48 rounded-full opacity-5"
          style={{ background: "#c8952a" }} />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <span className="text-4xl font-bold" style={{ color: "#c8952a", fontFamily: "'Outfit', sans-serif" }}>Δ</span>
            <div>
              <div className="text-lg font-bold" style={{ color: "#1e3a5f" }}>DELTA</div>
              <div className="text-xs text-muted-foreground tracking-widest uppercase">Mælistika í stærðfræði</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: "#1e3a5f" }}>Velkominn!</h1>
          <p className="text-muted-foreground text-sm mb-8">Skráðu þig inn til að halda áfram</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1e3a5f" }}>Netfang</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="þú@dæmi.is"
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 text-sm"
                style={{ background: "#f0ece4", fontFamily: "'Inter', sans-serif" }}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1e3a5f" }}>Lykilorð</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 text-sm pr-10"
                  style={{ background: "#f0ece4", fontFamily: "'Inter', sans-serif" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-98"
              style={{ background: "#1e3a5f", color: "#fff", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Skrái inn..." : "Skrá inn"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Ekki með aðgang? Hafðu samband við kennarann þinn  
          </p>
        </div>
      </div>
    </div>
  );
}
export default LoginView;