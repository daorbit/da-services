import { ShieldCheck, Users, Mail, CreditCard } from "lucide-react";
import { Wordmark } from "@/shared/components/Brand";

const FEATURES = [
  { icon: Users, label: "Admin access, scoped per app" },
  { icon: CreditCard, label: "Payments across the ecosystem" },
  { icon: Mail, label: "Transactional email, one place" },
];

export function AuthBrand() {
  return (
    <div className="auth-brand">
      <div className="ab-grid" aria-hidden />
      <div className="ab-orb ab-orb-1" aria-hidden />
      <div className="ab-orb ab-orb-2" aria-hidden />

      <div className="ab-chip" style={{ top: "14%", right: "12%" }}>
        <span className="ab-chip-val">
          <ShieldCheck size={15} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          super_admin
        </span>
        <span className="ab-chip-label">role verified</span>
      </div>

      <div className="ab-content">
        <Wordmark />
        <h2>One console for every app in the ecosystem.</h2>
        <p>
          Manage admin access, payments and email across Quantalog and every
          product that joins it — from a single sign-in.
        </p>
        <div className="ab-features">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div className="ab-feature" key={label}>
              <span className="ab-feature-ic">
                <Icon size={15} />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
