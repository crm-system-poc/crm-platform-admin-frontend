"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateResellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const submit = async () => {
    try {
      setLoading(true);
      await api.post("/api/platform/reseller", form);
      toast.success("Reseller created successfully");
      router.push("/resellers");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-8 ">Create Reseller</h1>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col col-span-1">
            <label className="mb-2 font-medium text-sm text-gray-700" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              placeholder="Reseller Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="mb-2 font-medium text-sm text-gray-700" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="mb-2 font-medium text-sm text-gray-700" htmlFor="phone">
              Phone
            </label>
            <Input
              id="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="mb-2 font-medium text-sm text-gray-700" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full"
            />
          </div>
          {/* Fill remaining cells to maintain 3x3 structure */}
          <div className="col-span-1" />
          <div className="col-span-1" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1" />
          <div className="col-span-1 flex gap-3 ">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
          <div className="col-span-1" />
        </div>
      </div>
    </div>
  );
}
