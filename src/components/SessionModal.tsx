import { useSession } from "@/context/SessionContext";
import { useState } from "react";

export default function SessionModal() {
  const { sessionActive, setSessionActive } = useSession();
  const [input, setInput] = useState("");
  const [berhasil, setBerhasil] = useState(true);

  const aksesLogin = {
    mhnmd: {lokasi: "Mahendradata", role: "penimbang"},
    cpdv: {lokasi: "Cargo", role: "penimbang"},
    "*abg1": {lokasi: null, role: "admin"}
  };

  if (sessionActive) return null;

  const handleLogin = () => {
    const user = aksesLogin[input];
    if (user) {
      setSessionActive(user);
      setBerhasil(true);
    } else {
      setBerhasil(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg flex flex-col gap-4 min-w-[300px]">
        <h2 className="text-xl font-bold">Enter Session Key</h2>
        <input
          type="password"
          value={input}
          onChange={e => {setInput(e.target.value); setBerhasil(true)}}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin()
          }}
          className="border p-2 rounded"
          autoFocus
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          onClick={handleLogin}
        >
          Login
        </button>
        {!berhasil && (
          <span className="text-red-500 text-sm">Password salah</span>
        )}
      </div>
    </div>
  );
}