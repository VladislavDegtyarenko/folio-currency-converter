import { useId, useState } from "react";
import { BRANDING } from "../branding";
import { type Messages } from "../i18n/messages";
import { InfoDisclosure } from "./InfoDisclosure";

type Props = {
  messages: Messages;
};

export function InfoSection({ messages }: Props) {
  const id = useId();
  const [openItem, setOpenItem] = useState<
    "calculations" | "rates" | "feedback" | null
  >(null);

  return (
    <section className="info-section" aria-labelledby={id}>
      <h2 id={id}>{messages.faq}</h2>
      <InfoDisclosure
        title={messages.rateInfo}
        open={openItem === "rates"}
        onOpenChange={(open) => setOpenItem(open ? "rates" : null)}
      >
        <p>{messages.rateDetails}</p>
      </InfoDisclosure>
      <InfoDisclosure
        title={messages.calculationInfo}
        open={openItem === "calculations"}
        onOpenChange={(open) => setOpenItem(open ? "calculations" : null)}
      >
        <p>{messages.calculationDetails}</p>
      </InfoDisclosure>
      <InfoDisclosure
        title={messages.feedbackInfo}
        open={openItem === "feedback"}
        onOpenChange={(open) => setOpenItem(open ? "feedback" : null)}
      >
        <p>
          {messages.feedbackPrompt}{" "}
          <a href={`mailto:${BRANDING.feedbackEmail}`}>
            {BRANDING.feedbackEmail}
          </a>
        </p>
      </InfoDisclosure>
    </section>
  );
}
