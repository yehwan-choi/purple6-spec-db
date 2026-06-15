"use client";

import { useState, useTransition } from "react";
import { updateAppPassword } from "@/lib/actions";

interface Props {
  purple6Password: string;
  adminPassword: string;
}

function PasswordSection({
  title,
  currentPassword,
  settingKey,
}: {
  title: string;
  currentPassword: string;
  settingKey: "purple6_password" | "admin_password";
}) {
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDigitInput(value: string, setter: (v: string) => void) {
    setter(value.replace(/\D/g, "").slice(0, 4));
  }

  function handleSubmit() {
    if (newPw.length !== 4) {
      setMessage({ type: "error", text: "새 비밀번호는 숫자 4자리여야 합니다." });
      return;
    }
    if (newPw !== confirmPw) {
      setMessage({ type: "error", text: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다." });
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await updateAppPassword(settingKey, newPw);
      if (result?.success) {
        setMessage({ type: "success", text: "비밀번호가 변경되었습니다." });
        setNewPw("");
        setConfirmPw("");
      } else {
        setMessage({ type: "error", text: result?.error ?? "저장에 실패했습니다." });
      }
    });
  }

  const inputClass =
    "w-32 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring tracking-widest text-center";

  return (
    <div className="rounded-xl border bg-card p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="w-28 text-sm text-muted-foreground shrink-0">현재 비밀번호</span>
          <span className="text-sm font-mono font-bold tracking-[0.3em] text-foreground">
            {currentPassword}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-28 text-sm text-muted-foreground shrink-0">새 비밀번호</span>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={newPw}
            onChange={(e) => handleDigitInput(e.target.value, setNewPw)}
            placeholder="• • • •"
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="w-28 text-sm text-muted-foreground shrink-0">비밀번호 확인</span>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={confirmPw}
            onChange={(e) => handleDigitInput(e.target.value, setConfirmPw)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="• • • •"
            className={inputClass}
          />
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
          {message.text}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isPending ? "저장 중..." : "변경 완료"}
      </button>
    </div>
  );
}

export function PasswordManager({ purple6Password, adminPassword }: Props) {
  return (
    <div className="space-y-6">
      <PasswordSection
        title="PURPLE6 비밀번호"
        currentPassword={purple6Password}
        settingKey="purple6_password"
      />
      <PasswordSection
        title="ADMIN 비밀번호"
        currentPassword={adminPassword}
        settingKey="admin_password"
      />
    </div>
  );
}
