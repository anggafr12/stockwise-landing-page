import { useLocation } from "react-router-dom";
import Verify from "./components/verify";

export default function VerifyPage() {
  const location = useLocation();
  const email =
    location.state?.email || localStorage.getItem("pendingEmail") || "";

  return <Verify email={email} />;
}
