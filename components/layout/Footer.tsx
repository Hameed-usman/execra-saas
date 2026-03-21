import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

const FOOTER_LINKS = {
  product: [
    { name: "Agents", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Changelog", href: "#" },
    { name: "Roadmap", href: "#" },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contact", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

export const Footer = () => {
  return (
    <footer className="w-full bg-[var(--bg-deep)] border-t border-[rgba(var(--text-base-rgb),0.06)] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="font-heading font-bold text-[var(--text-base)] text-xl tracking-[-0.02em]">
              STRATARA
            </Link>
            <p className="font-sans text-[14px] text-[rgba(var(--text-base-rgb),0.6)] leading-relaxed max-w-xs">
              Autonomous AI agents for startup founders.
            </p>
            <div className="flex items-center gap-4 mt-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-[rgba(var(--text-base-rgb),0.4)] hover:text-[var(--accent-violet)] transition-colors"
                >
                  <Icon size={20} />
                </Link>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-4 relative z-10">
            <h4 className="font-sans font-semibold text-[var(--text-base)] text-sm mb-2">Product</h4>
            {FOOTER_LINKS.product.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-sans text-[14px] text-[rgba(var(--text-base-rgb),0.5)] hover:text-[var(--accent-violet)] transition-colors"
                style={{ position: 'relative', zIndex: 10 }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-4 relative z-10">
            <h4 className="font-sans font-semibold text-[var(--text-base)] text-sm mb-2">Company</h4>
            {FOOTER_LINKS.company.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-sans text-[14px] text-[rgba(var(--text-base-rgb),0.5)] hover:text-[var(--accent-violet)] transition-colors"
                style={{ position: 'relative', zIndex: 10 }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-4 relative z-10">
            <h4 className="font-sans font-semibold text-[var(--text-base)] text-sm mb-2">Legal</h4>
            {FOOTER_LINKS.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-sans text-[14px] text-[rgba(var(--text-base-rgb),0.5)] hover:text-[var(--accent-violet)] transition-colors"
                style={{ position: 'relative', zIndex: 10 }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[rgba(var(--text-base-rgb),0.05)] text-center relative z-10">
          <p className="font-sans text-[13px] text-[rgba(var(--text-base-rgb),0.35)]">
            &copy; 2026 STRATARA Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
