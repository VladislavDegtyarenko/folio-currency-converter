import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { type Messages } from "../i18n/messages";
import { type Notice } from "./model";

const NOTICE_DURATION_MS = 5_000;

type Props = {
  notice: Notice | null;
  isSuspended: boolean;
  messages: Messages;
  onDismiss: () => void;
  onUndo: () => void;
};

export function Toast({
  notice,
  isSuspended,
  messages,
  onDismiss,
  onUndo,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const previousFocus = useRef<HTMLElement | null>(null);
  const currentNotice = useRef({ notice, isSuspended });
  const reducedTimer = useRef({ id: 0, remaining: NOTICE_DURATION_MS });
  const isReduced = useReducedMotion();
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    currentNotice.current = { notice, isSuspended };
  }, [notice, isSuspended]);

  useEffect(() => {
    if (!notice || notice.canUndo) {
      return;
    }

    if (reducedTimer.current.id !== notice.id) {
      reducedTimer.current = { id: notice.id, remaining: NOTICE_DURATION_MS };
    }

    if (!isReduced || isHovered || isFocused || isSuspended) {
      return;
    }

    const startedAt = performance.now();
    const timer = window.setTimeout(
      () => dismiss(),
      reducedTimer.current.remaining,
    );
    return () => {
      window.clearTimeout(timer);
      reducedTimer.current.remaining = Math.max(
        0,
        reducedTimer.current.remaining - (performance.now() - startedAt),
      );
    };
  }, [notice, isHovered, isFocused, isSuspended, isReduced]);

  function close() {
    if (previousFocus.current?.isConnected) {
      previousFocus.current.focus();
    }

    onDismiss();
  }

  return (
    <div className="toast-region">
      <span className="sr-only" role="status" aria-atomic="true">
        {notice && !isSuspended && (
          <span key={notice.id}>{messages[notice.messageKey]}</span>
        )}
      </span>
      <AnimatePresence initial={false} mode="wait">
        {notice && !isSuspended && (
          <motion.div
            key={notice.id}
            className="toast"
            initial={{ opacity: 0, y: isReduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isReduced ? 0 : 6 }}
            transition={{ duration: isReduced ? 0 : 0.16 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                previousFocus.current =
                  event.relatedTarget instanceof HTMLElement
                    ? event.relatedTarget
                    : null;
              }

              setIsFocused(true);
            }}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsFocused(false);
              }
            }}
          >
            {!isReduced && !notice.canUndo && (
              <span
                aria-hidden="true"
                className="toast-timer"
                style={{
                  animationDuration: `${NOTICE_DURATION_MS}ms`,
                  animationPlayState:
                    isHovered || isFocused ? "paused" : "running",
                }}
                onAnimationEnd={() => {
                  if (
                    currentNotice.current.notice?.id === notice.id &&
                    !currentNotice.current.isSuspended
                  ) {
                    onDismiss();
                  }
                }}
              />
            )}
            <span className="toast-message">{messages[notice.messageKey]}</span>
            {notice.canUndo && (
              <button
                type="button"
                className="toast-undo"
                onClick={() => {
                  previousFocus.current?.focus();
                  onUndo();
                }}
              >
                {messages.undo}
              </button>
            )}
            <button
              type="button"
              className="icon-button toast-close"
              aria-label={messages.close}
              onClick={close}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
