import type { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  tone?: "default" | "notice" | "danger";
};

export function SectionCard({
  title,
  description,
  children,
  tone = "default",
}: SectionCardProps) {
  return (
    <section className={`section-card tone-${tone}`}>
      {title || description ? (
        <div className="section-card-header">
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
