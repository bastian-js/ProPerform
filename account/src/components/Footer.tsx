import { Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";

const LINKS = [
  { label: "Impressum", href: "https://properform.app/impressum" },
  { label: "Datenschutz", href: "https://properform.app/datenschutz" },
];

const SOCIALS = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
];

export default function Footer() {
  return (
    <>
      <footer
        className="pf-footer w-full"
        style={{
          background: "#08090a",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "28px 40px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="pf-dot" />
            <span
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              ProPerform
            </span>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 13 }}>
              © {new Date().getFullYear()}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="pf-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
                <ArrowUpRight size={11} className="pf-arrow" />
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="pf-social"
              >
                <Icon size={14} strokeWidth={1.8} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
