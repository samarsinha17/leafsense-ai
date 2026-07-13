import { useEffect } from "react";
import { Card } from "../components/ui/Card";
import { getProfile } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { translate } from "../data/translations";

export function Profile() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const language = useAppStore((state) => state.language);
  const t = (key: string) => translate(language, key);

  useEffect(() => {
    if (localStorage.getItem("leafsense-access-token")) {
      getProfile().then(setUser).catch(() => undefined);
    }
  }, [setUser]);

  if (!user) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <Card><p className="text-muted">Please login to view your profile.</p></Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">{t("myProfile")}</h1>
      <Card className="mt-8">
        <div className="flex flex-wrap items-center gap-6">
          {user.profileImage ? (
            <img className="h-24 w-24 rounded-full object-cover" src={user.profileImage} alt={user.fullName} />
          ) : (
            <div className="grid h-24 w-24 place-items-center rounded-full bg-primary/15 text-3xl font-bold text-primary">
              {user.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="font-heading text-3xl font-bold">{user.fullName}</h2>
            <p className="mt-1 text-muted">{user.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{user.role}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border p-4">
            <p className="text-sm text-muted">{language === "hi" ? "जुड़ने की तारीख" : "Join Date"}</p>
            <p className="mt-2 font-semibold">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "Available after next login"}</p>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-sm text-muted">{language === "hi" ? "अंतिम लॉगिन / अपडेट" : "Last Login / Update"}</p>
            <p className="mt-2 font-semibold">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Current session"}</p>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <p className="text-sm text-muted">{language === "hi" ? "लॉगिन तरीका" : "Login Method"}</p>
            <p className="mt-2 font-semibold">{user.isVerified ? (language === "hi" ? "Google / Verified account" : "Google / Verified account") : (language === "hi" ? "Email password" : "Email password")}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
