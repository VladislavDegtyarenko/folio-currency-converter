import { BRANDING } from "./branding";
import { useLocale } from "./i18n/LocaleProvider";

export function Footer() {
  const { messages } = useLocale();
  return (
    <footer className="footer">
      <span>
        {messages.createdBy}
        <a
          className="footer-author"
          href="https://www.vd-developer.online/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>{BRANDING.author}</strong>
        </a>
      </span>
      {BRANDING.donationUrl ? (
        <a
          className="donate-button"
          href={BRANDING.donationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          ♡ {messages.donate}
        </a>
      ) : (
        <span title={messages.donateUnavailable}>
          <button
            type="button"
            className="donate-button"
            disabled
            aria-label={`${messages.donate}: ${messages.donateUnavailable}`}
          >
            ♡ {messages.donate}
          </button>
        </span>
      )}
    </footer>
  );
}
