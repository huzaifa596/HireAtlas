export default function Overlay({ flipped, onFlip }) {
  return (
    <div className={`overlay-wrap${flipped ? " flipped" : ""}`}>
      <div className={`overlay${flipped ? " flipped" : ""}`}>

        {/* Left panel — visible after flip: prompts user to sign in */}
        <div className="overlay-panel left">
          <div className="corner-accent tl" />
          <div className="corner-accent br" />
          <p className="overlay-tag">Already a member?</p>
          <h2>Welcome back.</h2>
          <div className="overlay-divider" />
          <p>Sign in with your credentials to pick up right where you left off.</p>
          <button className="btn-ghost" onClick={() => onFlip(false)}>
            Sign In
          </button>
        </div>

        {/* Right panel — visible by default: prompts user to sign up */}
        <div className="overlay-panel right">
          <div className="corner-accent tl" />
          <p className="overlay-tag">New here?</p>
          <h2>Start your journey.</h2>
          <div className="overlay-divider" />
          <p>Create a free account in seconds and unlock everything we have to offer.</p>
          <button className="btn-ghost" onClick={() => onFlip(true)}>
            Sign Up
          </button>
        </div>

      </div>
    </div>
  );
}
