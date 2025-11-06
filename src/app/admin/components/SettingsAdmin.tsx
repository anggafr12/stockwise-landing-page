"use client";

import { toast } from "sonner";
import { seedData } from "@/app/admin/services/seed";
import { Button } from "@/components/ui/button";

export default function SettingsAdmin() {
  async function handleSeed() {
    try {
      await seedData();
      toast.success("Seed OK — data contoh dimasukkan");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Settings</h3>
      <p className="text-gray-300 mb-4">
        Gunakan tombol di bawah untuk memasukkan data contoh (users, courses, videos, events).
      </p>
      <Button onClick={handleSeed} className="bg-[#3B82F6] hover:bg-[#2563EB]">
        Seed Sample Data
      </Button>
    </div>
  );
}
