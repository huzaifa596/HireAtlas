import { useState } from "react";
import "./auth.css";
import SignInPanel from "./SignInPanel";
import SignUpPanel from "./SignUpPanel";
import Overlay from "./Overlay";

export default function AuthForm() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="auth-root">
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="auth-card">
        <SignInPanel flipped={flipped} onFlip={setFlipped} />
        <SignUpPanel flipped={flipped} onFlip={setFlipped} />
        <Overlay flipped={flipped} onFlip={setFlipped} />
      </div>
    </div>
  );
}
