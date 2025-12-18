"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

export default function EditResellerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    api.get(`/api/platform/reseller/${id}`).then((res) => {
      setForm(res.data.data);
    });
  }, [id]);

  const update = async () => {
    try {
      await api.put(`/api/platform/reseller/${id}`, form);
      toast.success("Reseller updated");
      router.push("/resellers");
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-8 ">Edit Reseller</h1>
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
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full"
            />
          </div>
          {/* Fill remaining cells to maintain 3x3 structure */}
          <div className="col-span-1" />
          <div className="col-span-1" />
          <div className="col-span-1" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1" />
          <div className="col-span-1 flex gap-3 ">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={update}>Update</Button>
          </div>
          <div className="col-span-1" />
        </div>
      </div>
    </div>
  );
}
