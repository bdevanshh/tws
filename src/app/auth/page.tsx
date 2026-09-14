"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { uid, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const { db, patch } = useStore();
  const router = useRouter();
  const [lE, setLE] = useState("customer@wish.com");
  const [lP, setLP] = useState("wish123");
  const [rN, setRN] = useState("");
  const [rE, setRE] = useState("");
  const [rP, setRP] = useState("");

  const login = () => {
    const u = db.users.find(
      (x) => x.email === lE.trim().toLowerCase() && x.pass === lP
    );
    if (!u) return toast.error("Invalid credentials");
    patch((d) => ({ ...d, session: u.id }));
    toast.success(`Welcome back, ${u.name}`);
    router.push(u.role === "admin" ? "/admin" : "/account");
  };

  const register = () => {
    const e = rE.trim().toLowerCase();
    if (!rN.trim() || !e || !rP) return toast.error("Fill all fields");
    if (db.users.some((x) => x.email === e)) return toast.error("Email already registered");
    const id = uid("u");
    patch((d) => {
      d.users.push({
        id,
        name: rN.trim(),
        email: e,
        pass: rP,
        role: "customer",
        address: "",
        joined: new Date().toISOString().slice(0, 10),
      });
      d.session = id;
      return d;
    });
    toast.success("Account created — choose your box!");
    router.push("/boxes");
  };

  return (
    <div className="mx-auto max-w-4xl py-10">
      <h1 className="font-serif text-4xl tracking-tight">Welcome, Seeker</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="login">
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
                <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="le">Email</Label>
                  <Input id="le" value={lE} onChange={(e) => setLE(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lp">Password</Label>
                  <Input id="lp" type="password" value={lP} onChange={(e) => setLP(e.target.value)} />
                </div>
                <Button onClick={login}>Login</Button>
                <p className="text-[13px] text-muted-foreground">
                  Demo: customer@wish.com / wish123 · admin@wish.com / admin123
                </p>
              </TabsContent>
              <TabsContent value="register" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="rn">Name</Label>
                  <Input id="rn" value={rN} onChange={(e) => setRN(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="re">Email</Label>
                  <Input id="re" value={rE} onChange={(e) => setRE(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rp">Password</Label>
                  <Input id="rp" type="password" value={rP} onChange={(e) => setRP(e.target.value)} />
                </div>
                <Button onClick={register}>Create account</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Why join?
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Sealed orders + live tracking</li>
              <li>Digital Mystery Bookshelf</li>
              <li>Collectibles binder & wish status</li>
              <li>Admins get the Vault (full control room)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
