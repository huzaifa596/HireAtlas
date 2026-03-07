// ─────────────────────────────────────────
// InputField — labelled input with icon and
//              green tick / red border validation
// ─────────────────────────────────────────
export function InputField({ type, placeholder, autoComplete, value, onChange, icon, validity }) {
  const cls = `input-group${validity === true ? " valid" : validity === false ? " invalid" : ""}`;
  return (
    <div className={cls}>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
      />
      <i className={`${icon} input-icon`} />
      <span className="check-icon">
        <i className="fas fa-check" />
      </span>
    </div>
  );
}

// ─────────────────────────────────────────
// SocialButtons — Facebook / Google / LinkedIn
// ─────────────────────────────────────────
export function SocialButtons() {
  return (
    <div className="socials">
      <a href="#" className="social-btn" title="Facebook">
        <i className="fab fa-facebook-f" />
      </a>
      <a href="#" className="social-btn" title="Google">
        <i className="fab fa-google" />
      </a>
      <a href="#" className="social-btn" title="LinkedIn">
        <i className="fab fa-linkedin-in" />
      </a>
    </div>
  );
}
