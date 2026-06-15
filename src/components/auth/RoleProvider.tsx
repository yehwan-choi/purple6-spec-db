"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ParticlesBackground } from "./ParticlesBackground";

export type Role = "PURPLE6" | "GUEST" | "ADMIN";

interface Passwords {
  purple6: string;
  admin: string;
}

interface RoleContextValue {
  role: Role | null;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export function useCanWrite() {
  const { role } = useRole();
  return role !== "GUEST";
}

type GateMode = "select" | "purple6" | "admin";

function RoleGate({
  onSelect,
  passwords,
}: {
  onSelect: (role: Role) => void;
  passwords: Passwords;
}) {
  const [mode, setMode] = useState<GateMode>("select");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function reset() {
    setPassword("");
    setError("");
    setMode("select");
  }

  function handleConfirm() {
    if (mode === "purple6") {
      if (password === passwords.purple6) {
        onSelect("PURPLE6");
      } else {
        setError("비밀번호가 올바르지 않습니다.");
      }
    } else if (mode === "admin") {
      if (password === passwords.admin) {
        onSelect("ADMIN");
      } else {
        setError("비밀번호가 올바르지 않습니다.");
      }
    }
  }

  const inputClass =
    "flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white shadow-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-400 tracking-widest text-center";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#00001a]">
      <ParticlesBackground />
      <div className="relative z-10 w-full max-w-sm space-y-10 px-6">
        {/* 앱 타이틀 */}
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold tracking-widest text-purple-400 uppercase">Purple6</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">마감재 & 업체 통합 관리</h1>
          <p className="text-sm text-white/50">
            {mode === "select"
              ? "계속하려면 역할을 선택하세요"
              : mode === "purple6"
              ? "PURPLE6 비밀번호를 입력하세요"
              : "ADMIN 비밀번호를 입력하세요"}
          </p>
        </div>

        {mode === "select" ? (
          <>
            {/* 역할 선택 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("purple6")}
                className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-purple-500/40 bg-purple-500/10 px-4 py-6 hover:border-purple-400 hover:bg-purple-500/20 transition-colors group"
              >
                <span className="text-base font-bold text-purple-300">PURPLE6</span>
                <span className="text-xs text-white/50 group-hover:text-purple-300/70 transition-colors">퍼플식스 구성원</span>
              </button>
              <button
                onClick={() => onSelect("GUEST")}
                className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-white/20 bg-white/5 px-4 py-6 hover:border-white/40 hover:bg-white/10 transition-colors"
              >
                <span className="text-base font-bold text-white">GUEST</span>
                <span className="text-xs text-white/50">방문자</span>
              </button>
            </div>

            {/* Admin */}
            <div className="text-center">
              <button
                onClick={() => setMode("admin")}
                className="text-xs text-white/20 hover:text-white/50 transition-colors"
              >
                ADMIN
              </button>
            </div>
          </>
        ) : (
          /* 비밀번호 입력 화면 (PURPLE6 / ADMIN 공통) */
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value.replace(/\D/g, "").slice(0, 4));
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                placeholder="• • • •"
                autoFocus
                className={inputClass}
              />
              <button
                onClick={handleConfirm}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
              >
                확인
              </button>
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <div className="text-center">
              <button
                onClick={reset}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                ← 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function RoleProvider({
  children,
  passwords,
}: {
  children: ReactNode;
  passwords: Passwords;
}) {
  const [role, setRoleState] = useState<Role | null>(null);

  function setRole(r: Role) {
    setRoleState(r);
  }

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {role ? children : <RoleGate onSelect={setRole} passwords={passwords} />}
    </RoleContext.Provider>
  );
}
