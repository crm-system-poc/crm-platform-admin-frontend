"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/components/context/AuthContext";
import { useRouter } from "next/router";
import { hasAction } from "@/lib/permissions";

export default function ResellerListPage() {
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const permissions = user?.permissions || {};

  const loadResellers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/platform/reseller");
      setResellers(res.data.data);
    } catch {
      toast.error("Failed to load resellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResellers();
  }, []);

  const handleDeleteReseller = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/platform/reseller/${deleteId}`);
      toast.success("Reseller deleted");
      setDeleteId(null);
      loadResellers();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-10 space-y-6">
      <Card className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Resellers</h1>
          {hasAction(user?.permissions, "manageResellers", "create") && (
          <Link href="/resellers/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Reseller
            </Button>
          </Link>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : resellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No resellers found
                  </TableCell>
                </TableRow>
              ) : (
                resellers.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.phone || "-"}</TableCell>
                    <TableCell>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                    {hasAction(user?.permissions, "manageResellers", "update") && (
                      <Link href={`/resellers/${r.id}`}>
                        <Button size="sm" variant="outline">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      
                      </Link>
                        )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                        {hasAction(user?.permissions, "manageResellers", "delete") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete reseller
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this reseller? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setDeleteId(null)}
                              disabled={deleting}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteReseller}
                              disabled={deleting}
                            >
                              {deleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
