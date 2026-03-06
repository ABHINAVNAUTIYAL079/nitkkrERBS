"use client";
import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { RefreshCw, Volume2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(len = 6) {
    return Array.from({ length: len }, () =>
        CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join("");
}

/** Draw the CAPTCHA on a <canvas> with noise & skew so it looks real */
function drawCaptcha(canvas, code) {
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d");

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#f0f4f8");
    bg.addColorStop(1, "#e8edf2");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid lines (subtle)
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 12) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 12) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 80; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 120},${Math.random() * 120},${Math.random() * 120},0.25)`;
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Random bezier curves
    for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgba(${80 + Math.random() * 100},${80 + Math.random() * 100},${80 + Math.random() * 100},0.30)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * W, Math.random() * H);
        ctx.bezierCurveTo(
            Math.random() * W, Math.random() * H,
            Math.random() * W, Math.random() * H,
            Math.random() * W, Math.random() * H
        );
        ctx.stroke();
    }

    // Draw each character with colour/rotation/skew variation
    const charW = (W - 20) / code.length;
    const colors = ["#1a56db", "#0e7490", "#7e3af2", "#b45309", "#dc2626", "#047857"];

    code.split("").forEach((ch, i) => {
        ctx.save();
        const cx = 12 + i * charW + charW / 2;
        const cy = H / 2 + 4;
        ctx.translate(cx, cy);
        ctx.rotate((Math.random() - 0.5) * 0.5);

        const fontSize = 22 + Math.floor(Math.random() * 6);
        ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
        ctx.fillStyle = colors[i % colors.length];
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Slight shadow for depth
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillText(ch, 0, 0);
        ctx.restore();
    });
}

// ── component ─────────────────────────────────────────────────────────────────
const CaptchaWidget = forwardRef(
    function CaptchaWidget(_props, ref) {
        const canvasRef = useRef(null);
        const [code, setCode] = useState(() => generateCode());
        const [answer, setAnswer] = useState("");
        const [status, setStatus] = useState("idle");
        const [speaking, setSpeaking] = useState(false);

        // Draw whenever code changes
        useEffect(() => {
            if (canvasRef.current) drawCaptcha(canvasRef.current, code);
        }, [code]);

        // Refresh helper
        const refresh = useCallback(() => {
            setCode(generateCode());
            setAnswer("");
            setStatus("idle");
        }, []);

        // Expose isValid + refresh to parent via ref
        useImperativeHandle(ref, () => ({
            isValid: status === "ok",
            refresh,
        }), [status, refresh]);

        // Text-to-speech
        const speak = () => {
            if (!window.speechSynthesis) return;
            window.speechSynthesis.cancel();
            setSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(
                "The captcha code is: " + code.split("").join(", ")
            );
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.lang = "en-US";
            utterance.onend = () => setSpeaking(false);
            utterance.onerror = () => setSpeaking(false);
            window.speechSynthesis.speak(utterance);
        };

        // Validate
        const validate = () => {
            const trimmed = answer.trim().toUpperCase();
            if (trimmed === code) {
                setStatus("ok");
            } else {
                setStatus("error");
                // Auto-refresh after a short delay
                setTimeout(() => {
                    setCode(generateCode());
                    setAnswer("");
                    setStatus("idle");
                }, 1400);
            }
        };

        return (
            <div
                className="rounded-xl overflow-hidden"
                style={{
                    border: status === "ok"
                        ? "1.5px solid #22c55e"
                        : status === "error"
                            ? "1.5px solid #ef4444"
                            : "1.5px solid rgba(255,255,255,0.12)",
                    background: "rgba(15,23,42,0.8)",
                    backdropFilter: "blur(12px)",
                    boxShadow: status === "ok"
                        ? "0 0 0 3px rgba(34,197,94,0.18)"
                        : status === "error"
                            ? "0 0 0 3px rgba(239,68,68,0.18)"
                            : "0 4px 24px rgba(0,0,0,0.35)",
                    transition: "border 0.25s, box-shadow 0.25s",
                }}
            >
                {/* ── Top bar: Google-style header ── */}
                <div
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        background: "rgba(255,255,255,0.03)",
                    }}
                >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-300 tracking-wide">
                        Security Verification
                    </span>
                    <span className="ml-auto text-[10px] text-slate-500 font-medium">
                        not a robot
                    </span>
                </div>

                {/* ── Canvas + action buttons ── */}
                <div className="px-4 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                        {/* Canvas */}
                        <div
                            className="relative rounded-lg overflow-hidden"
                            style={{ border: "1px solid rgba(255,255,255,0.10)" }}
                        >
                            <canvas
                                ref={canvasRef}
                                width={200}
                                height={56}
                                style={{ display: "block", cursor: "default", userSelect: "none" }}
                            />
                            {/* Overlay text watermark */}
                            <span
                                className="absolute bottom-0.5 right-1 text-[9px] font-semibold"
                                style={{ color: "rgba(100,120,160,0.55)", letterSpacing: "0.05em" }}
                            >
                                NIT KKR
                            </span>
                        </div>

                        {/* Controls: refresh + speak */}
                        <div className="flex flex-col gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={refresh}
                                title="Refresh CAPTCHA"
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={speak}
                                title="Speak CAPTCHA"
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${speaking
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                <Volume2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Input row */}
                    <div className="flex items-center gap-2 mt-2.5">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => {
                                    setAnswer(e.target.value.toUpperCase());
                                    if (status !== "idle") setStatus("idle");
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") { e.preventDefault(); validate(); }
                                }}
                                placeholder="Type the code above"
                                maxLength={6}
                                autoComplete="off"
                                className="w-full px-3 py-2 text-sm font-mono tracking-widest text-white placeholder-slate-500 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: status === "error"
                                        ? "1px solid rgba(239,68,68,0.6)"
                                        : "1px solid rgba(255,255,255,0.10)",
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={validate}
                            disabled={!answer || status === "ok"}
                            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-40"
                            style={{
                                background: status === "ok"
                                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                                    : "linear-gradient(135deg,#3b82f6,#2563eb)",
                                color: "#fff",
                                boxShadow: "0 2px 8px rgba(59,130,246,0.30)",
                            }}
                        >
                            Verify
                        </button>
                    </div>

                    {/* Status messages */}
                    {status === "ok" && (
                        <p className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2 animate-fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            CAPTCHA verified successfully!
                        </p>
                    )}
                    {status === "error" && (
                        <p className="flex items-center gap-1.5 text-xs text-red-400 font-medium mt-2 animate-fade-in">
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            Incorrect code. Refreshing&hellip;
                        </p>
                    )}
                </div>

                {/* ── Bottom bar: Google-style branding ── */}
                <div
                    className="flex items-center justify-between px-4 py-1.5"
                    style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                    }}
                >
                    <span className="text-[10px] text-slate-600">Privacy · Terms</span>
                    <span className="text-[10px] text-slate-600 font-semibold tracking-wide">
                        CAPTCHA
                    </span>
                </div>
            </div>
        );
    }
);

CaptchaWidget.displayName = "CaptchaWidget";
export default CaptchaWidget;
