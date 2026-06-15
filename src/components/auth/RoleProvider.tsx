"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Role = "PURPLE6" | "GUEST" | "ADMIN";

const ADMIN_PASSWORD = "1234";

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

function RoleGate({ onSelect }: { onSelect: (role: Role) => void }) {
  const [showAdmin, setShowAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleAdmin() {
    if (password === ADMIN_PASSWORD) {
      onSelect("ADMIN");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-10 px-6">
        {/* 앱 타이틀 */}
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Purple6</p>
          <h1 className="text-2xl font-bold tracking-tight">마감재 & 업체 통합 관리</h1>
          <p className="text-sm text-muted-foreground">계속하려면 역할을 선택하세요</p>
        </div>

        {/* 역할 선택 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelect("PURPLE6")}
            className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-6 hover:border-primary hover:bg-primary/10 transition-colors group"
          >
            <span className="text-base font-bold text-primary">PURPLE6</span>
            <span className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">퍼플식스 구성원</span>
          </button>
          <button
            onClick={() => onSelect("GUEST")}
            className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-border px-4 py-6 hover:border-foreground/40 hover:bg-accent transition-colors"
          >
            <span className="text-base font-bold">GUEST</span>
            <span className="text-xs text-muted-foreground">방문자</span>
          </button>
        </div>

        {/* Admin */}
        <div className="text-center">
          {!showAdmin ? (
            <button
              onClick={() => setShowAdmin(true)}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              ADMIN
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdmin()}
                  placeholder="비밀번호"
                  autoFocus
                  className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={handleAdmin}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  확인
                </button>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  function setRole(r: Role) {
    setRoleState(r);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground animate-pulse">로딩 중...</div>
      </div>
    );
  }

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {role ? children : <RoleGate onSelect={setRole} />}
    </RoleContext.Provider>
  );
}
