import React, { useEffect, useState } from "react";

export default function SettingsToggle() {
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    try { setShow(localStorage.getItem("ai:showReasons") === "1"); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("ai:showReasons", show ? "1" : "0"); } catch {}
  }, [show]);

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" checked={show} onChange={(e) => setShow(e.currentTarget.checked)} />
      Vis AI-forklaringer (tooltips)
    </label>
  );
}
