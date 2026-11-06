"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AuthSectionThree({ onLogin }: { onLogin?: (data: { email: string; role: string }) => void }) {
  const [email, setEmail] = useState("admin@edutest.sch.id");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      onLogin({ email, role: "Super Admin" });
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 p-3 text-slate-900 antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Side - Login Form (Google & Apple buttons removed as requested) */}
        <div className="flex min-h-[760px] items-center justify-center rounded-xl border border-slate-200/80 bg-white px-6 py-12 dark:border-white/5 dark:bg-[#0a0a0c] lg:min-h-0 lg:px-14 lg:py-20 xl:px-20 shadow-xs">
          <div className="mx-auto w-full max-w-[440px]">
            {/* Header Badge & Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal Seleksi Admisi & Penguji</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Masuk ke Edu-Test
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Silakan masukkan kredensial akun Asatidz / Penguji untuk mengakses lembar penilaian.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <InputField
                label="Email / Username Asatidz"
                value={email}
                placeholder="nama@pesantren.sch.id"
                type="email"
                onChange={(val) => setEmail(val)}
              />

              <InputField
                label="Kata Sandi (Password)"
                value={password}
                placeholder="Masukkan kata sandi"
                type="password"
                onChange={(val) => setPassword(val)}
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>

                <a
                  href="#bantuan"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                >
                  Lupa kata sandi?
                </a>
              </div>

              <button
                type="submit"
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
              >
                Masuk ke Dashboard Seleksi
              </button>

              {/* Demo Quick Selector */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                <p className="text-[11px] font-medium text-slate-400 mb-2">Akun Demo Cepat Penguji:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setEmail("ustadz.tpa@edutest.sch.id")}
                    className="p-2 text-left rounded border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                  >
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Penguji TPA</div>
                    <div className="text-[10px] text-slate-400">Ust. Abdul Malik</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmail("ustadz.pesantren@edutest.sch.id")}
                    className="p-2 text-left rounded border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                  >
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Kepesantrenan</div>
                    <div className="text-[10px] text-slate-400">Ust. Nurul Huda</div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Marketing & Mockup Showcase */}
        <div className="relative flex min-h-[720px] flex-col overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 text-white sm:p-12 lg:min-h-0 lg:p-16 shadow-lg">
          {/* Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 h-full w-full flex flex-col justify-between">
            <div className="max-w-[480px] lg:pt-8">
              {/* Reviewer / Asatidz info */}
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                  alt="Ustadz Penguji"
                  className="size-11 shrink-0 rounded-full border border-white/20 object-cover shadow-sm"
                />
                <div>
                  <div className="font-semibold leading-tight text-white flex items-center gap-1.5">
                    Ust. H. Nurul Huda, Lc.
                    <CheckCircle2 className="size-4 text-blue-400" />
                  </div>
                  <div className="mt-0.5 text-xs text-blue-200/70">
                    Koordinator Dewan Penguji PPDB 2027/2028
                  </div>
                </div>
              </div>

              <blockquote className="mt-8 text-2xl font-light leading-snug tracking-tight text-slate-100 sm:text-3xl">
                “Proses penilaian terstandarisasi, rekapitulasi real-time, dan keputusan sidang pleno santri baru kini 100% berbasis data empiris.”
              </blockquote>

              <div className="mt-6 flex items-center gap-6 text-xs text-slate-300">
                <div>
                  <div className="text-xl font-bold text-white">80 Kursi</div>
                  <div className="text-slate-400">Kuota Utama</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-xl font-bold text-emerald-400">100% Valid</div>
                  <div className="text-slate-400">Tie-Breaker Otomatis</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-xl font-bold text-blue-400">Neon PG</div>
                  <div className="text-slate-400">Singapore Region</div>
                </div>
              </div>
            </div>

            {/* Mockup Preview Card */}
            <div className="mt-10 w-full overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-2 shadow-2xl backdrop-blur-xl">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/90">
                <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/50 px-4 py-3 select-none">
                  <div className="size-2.5 rounded-full bg-rose-500/80" />
                  <div className="size-2.5 rounded-full bg-amber-500/80" />
                  <div className="size-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-4 text-[10px] font-mono tracking-wider text-slate-400">
                    edutest-iqy.pages.dev/dashboard
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold text-white">Status Gelombang 1</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-medium">Aktif</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                      <div className="text-[10px] text-slate-400">Calon Santri</div>
                      <div className="text-base font-bold text-white mt-1">2 Terdaftar</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                      <div className="text-[10px] text-slate-400">Tes TPA</div>
                      <div className="text-base font-bold text-blue-300 mt-1">Selesai</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2.5 border border-white/5">
                      <div className="text-[10px] text-slate-400">Kepesantrenan</div>
                      <div className="text-base font-bold text-emerald-300 mt-1">Terkunci</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange?: (val: string) => void;
}) {
  const [val, setVal] = useState(value);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 text-left w-full">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative flex h-11 items-center rounded-lg border border-slate-300/80 bg-white px-3.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all dark:border-white/10 dark:bg-white/5">
        <input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
