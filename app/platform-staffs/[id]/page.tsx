"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Permissions Groups matching the PlatformAdmin.js model (see backend):
 * - managePlatformHome: Boolean (default: true)
 * - managePlatformUsers: Boolean (default: false)
 *   - platformUserActions: { create, read, update, delete }
 * - manageResellers: Boolean (default: false)
 *   - resellerActions: { create, read, update, delete }
 * - managePlatformSettings: Boolean (default: false)
 *   - platformSettingsActions: { create, read, update, delete }
 */

type ActionSet = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

type Permissions = {
  managePlatformHome: boolean;
  managePlatformUsers: boolean;
  platformUserActions: ActionSet;
  manageResellers: boolean;
  resellerActions: ActionSet;
  managePlatformSettings: boolean;
  platformSettingsActions: ActionSet;
  [key: string]: any;
};
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

function getInitialPermissions(): Permissions {
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

export default function UpdatePlatformStaffPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [permissions, setPermissions] = useState<Permissions>(getInitialPermissions());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/api/platform/staff/${id}`)
      .then((res) => {
        const staff = res?.data?.data;
        setForm({
          name: staff.name || "",
          email: staff.email || "",
          phone: staff.phone || "",
        });
        // Merge to ensure fields present, but preserve existing structure
        setPermissions((old) => ({
          ...old,
          ...staff.permissions,
          platformUserActions: {
            ...old.platformUserActions,
            ...(staff.permissions?.platformUserActions || {}),
          },
          resellerActions: {
            ...old.resellerActions,
            ...(staff.permissions?.resellerActions || {}),
          },
          platformSettingsActions: {
            ...old.platformSettingsActions,
            ...(staff.permissions?.platformSettingsActions || {}),
          },
        }));
        setLoading(false);
      })
      .catch((err: any) => {
        setFetchError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to fetch staff data"
        );
        setLoading(false);
      });
  }, [id]);

  const handlePermChange = (permKey: string, checked: boolean) => {
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
    setSaving(true);
    setFetchError(null);
    try {
      const res = await api.put(`/api/platform/staff/${id}`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        permissions,
      });
      if (res.data.success) {
        toast.success("Platform Staff updated!");
        router.push("/platform-staffs");
      } else {
        toast.error(res.data.message || res.data.error || "Failed to update staff.");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update staff. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Platform Staff</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading...
            </div>
          ) : fetchError ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
          ) : (
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
              </div>

              {/* Permissions Section (matching PlatformAdmin.js model) */}
              <div>
                <h3 className="text-lg font-medium mb-2">Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.group} className="border rounded-md p-4 bg-muted/40">
                      <div className="font-semibold mb-2">{group.group}</div>
                      <div className="flex flex-col gap-2">
                        {group.permissions.map((perm) => {
                          let checked = false;
                          if (perm.key.startsWith("platformUserActions.")) {
                            const p = perm.key.split(".")[1] as keyof ActionSet;
                            checked = !!permissions.platformUserActions?.[p];
                          } else if (perm.key.startsWith("resellerActions.")) {
                            const p = perm.key.split(".")[1] as keyof ActionSet;
                            checked = !!permissions.resellerActions?.[p];
                          } else if (perm.key.startsWith("platformSettingsActions.")) {
                            const p = perm.key.split(".")[1] as keyof ActionSet;
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
                <Button type="submit" className="ml-auto" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
