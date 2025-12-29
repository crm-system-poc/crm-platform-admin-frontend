"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Permission structure derived from PlatformAdmin.js (backend model)
const PERMISSION_GROUPS = [
  {
    group: "Platform Home",
    permissions: [
      { key: "managePlatformHome", label: "Manage Platform Home" },
    ],
  },
  {
    group: "Platform Users",
    permissions: [
      { key: "managePlatformUsers", label: "Manage Platform Users" },
      { key: "platformUserActions.create", label: "Create Platform User" },
      { key: "platformUserActions.read", label: "Read Platform Users" },
      { key: "platformUserActions.update", label: "Update Platform Users" },
      { key: "platformUserActions.delete", label: "Delete Platform Users" },
    ],
  },
  {
    group: "Resellers",
    permissions: [
      { key: "manageResellers", label: "Manage Resellers" },
      { key: "resellerActions.create", label: "Create Reseller" },
      { key: "resellerActions.read", label: "Read Resellers" },
      { key: "resellerActions.update", label: "Update Resellers" },
      { key: "resellerActions.delete", label: "Delete Resellers" },
    ],
  },
  
];

/**
 * Returns the default permissions for a new PlatformStaff user,
 * not based on the currently logged-in user's permissions.
 */
function getInitialPermissions(): any {
  return {
    managePlatformHome: true,
    managePlatformUsers: false,
    platformUserActions: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    manageResellers: false,
    resellerActions: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    managePlatformSettings: false,
    platformSettingsActions: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
  };
}

export default function CreatePlatformStaffPage() {
  // Make sure permissions state is initialized ONLY to default PlatformStaff permissions,
  // not from the current user, so no permissions "leak".
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [permissions, setPermissions] = useState<any>(getInitialPermissions());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePermChange = (permKey: string, checked: boolean) => {
    // Handles nested permissions
    if (permKey.startsWith("platformUserActions.")) {
      const p = permKey.split(".")[1];
      setPermissions((curr: any) => ({
        ...curr,
        platformUserActions: { ...curr.platformUserActions, [p]: checked },
      }));
    } else if (permKey.startsWith("resellerActions.")) {
      const p = permKey.split(".")[1];
      setPermissions((curr: any) => ({
        ...curr,
        resellerActions: { ...curr.resellerActions, [p]: checked },
      }));
    } else if (permKey.startsWith("platformSettingsActions.")) {
      const p = permKey.split(".")[1];
      setPermissions((curr: any) => ({
        ...curr,
        platformSettingsActions: { ...curr.platformSettingsActions, [p]: checked },
      }));
    } else {
      setPermissions((curr: any) => ({
        ...curr,
        [permKey]: checked,
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/platform/create-staff", {
        ...form,
        permissions,
      });
      if (res.data.success) {
        toast.success("Platform Staff created!");
        router.push("/platform-staffs");
      } else {
        toast.error(res.data.error || "Failed to create staff.");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
        "Failed to create staff. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Platform Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* 3x3 Grid for main fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone (optional)"
                  className="mt-1"
                />
              </div>
              {/* Second row: Password and two empty columns */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  className="mt-1"
                />
              </div>
              <div />
              <div />
            </div>

            {/* Permissions Section from backend model */}
            <div>
              <h3 className="text-lg font-medium mb-2">Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PERMISSION_GROUPS.map((group) => (
                  <div
                    key={group.group}
                    className="border rounded-md p-4 bg-muted/40"
                  >
                    <div className="font-semibold mb-2">{group.group}</div>
                    <div className="flex flex-col gap-2">
                      {group.permissions.map((perm) => {
                        let checked = false;
                        if (perm.key.startsWith("platformUserActions.")) {
                          const p = perm.key.split(".")[1];
                          checked = !!permissions.platformUserActions?.[p];
                        } else if (perm.key.startsWith("resellerActions.")) {
                          const p = perm.key.split(".")[1];
                          checked = !!permissions.resellerActions?.[p];
                        } else if (perm.key.startsWith("platformSettingsActions.")) {
                          const p = perm.key.split(".")[1];
                          checked = !!permissions.platformSettingsActions?.[p];
                        } else {
                          checked = !!permissions[perm.key];
                        }
                        return (
                          <label
                            key={perm.key}
                            className="inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                handlePermChange(perm.key, !!value)
                              }
                            />
                            <span>{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex mt-6">
              <Button type="submit" className="ml-auto" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Staff"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
