"use client";
import { useEffect, useState } from "react";

/**
 * Typewriter – renders children text letter-by-letter.
 *
 * Props
 * ─────
 * text      : string to type out
 * speed     : ms per character  (default 50)
 * delay     : ms to wait before starting (default 0)
 * className : forwarded to the wrapper <span>
 * onDone    : callback fired once typing finishes
 * cursor    : show blinking cursor while typing (default true)
 */
export default function Typewriter({
    text = "",
    speed = 50,
    delay = 0,
    className = "",
    onDone,
    cursor = true,
}) {
    const [displayed, setDisplayed] = useState("");
    const [started, setStarted] = useState(false);
    const [done, setDone] = useState(false);

    // Wait for initial delay
    useEffect(() => {
        const t = setTimeout(() => setStarted(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    // Type characters one by one
    useEffect(() => {
        if (!started) return;
        if (displayed.length >= text.length) {
            setDone(true);
            onDone?.();
            return;
        }
        const t = setTimeout(() => {
            setDisplayed(text.slice(0, displayed.length + 1));
        }, speed);
        return () => clearTimeout(t);
    }, [started, displayed, text, speed, onDone]);

    return (
        <span className={className}>
            {displayed}
            {cursor && !done && (
                <span className="typewriter-cursor" aria-hidden="true">|</span>
            )}
        </span>
    );
}
