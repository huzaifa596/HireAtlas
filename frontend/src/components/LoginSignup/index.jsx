/**
 * LoginSignup/index.jsx
 * Entry point: shows LoadingScreen first, then AuthContainer.
 * Drop this into your router wherever you currently render the auth page.
 *
 * Usage in App.jsx:
 *   import HireAtlasAuth from "./components/LoginSignup";
 *   <Route path="/auth" element={<HireAtlasAuth />} />
 */

import { useState } from "react";
import LoadingScreen from "./LoadingScreen/LoadingScreen.jsx";
import AuthContainer from "./AuthContainer/AuthContainer.jsx";
import "./AuthContainer/AuthContainer.css";

export default function HireAtlasAuth() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && <AuthContainer />}
    </>
  );
}
