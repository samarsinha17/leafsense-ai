import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { getProfile, updateProfile } from "../services/api";
import { useAppStore } from "../store/useAppStore";

export function Settings() {
  const { user, setUser, theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? "");
  const [rawImage, setRawImage] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const cropPreviewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (localStorage.getItem("leafsense-access-token")) {
      getProfile().then((profile) => {
        setUser(profile);
        setFullName(profile.fullName);
        setProfileImage(profile.profileImage ?? "");
      }).catch(() => undefined);
    }
  }, [setUser]);

  useEffect(() => {
    if (!rawImage || !cropPreviewRef.current) return;
    drawCrop(cropPreviewRef.current, rawImage).catch(() => setStatus("Unable to preview this image."));
    // drawCrop intentionally uses the current crop controls for this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawImage, zoom, offsetX, offsetY]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    setSaving(true);
    try {
      const finalProfileImage = rawImage ? await createCroppedImage(rawImage) : profileImage;
      const updated = await updateProfile({ fullName, profileImage: finalProfileImage });
      setUser(updated);
      setProfileImage(updated.profileImage ?? finalProfileImage);
      setRawImage("");
      setZoom(1.15);
      setOffsetX(0);
      setOffsetY(0);
      setStatus("Account settings updated.");
      window.setTimeout(() => navigate("/profile"), 450);
    } catch {
      setStatus("Unable to update settings.");
    } finally {
      setSaving(false);
    }
  }

  function loadProfileFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(String(reader.result));
      setZoom(1.15);
      setOffsetX(0);
      setOffsetY(0);
      setStatus("Adjust crop and click Apply Crop.");
    };
    reader.readAsDataURL(file);
  }

  async function applyCrop() {
    if (!rawImage) return;
    const cropped = await createCroppedImage(rawImage);
    setProfileImage(cropped);
    setStatus("Profile photo crop applied. Click Save Settings.");
  }

  async function createCroppedImage(source: string): Promise<string> {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 320;
    await drawCrop(canvas, source);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  async function drawCrop(canvas: HTMLCanvasElement, source: string): Promise<void> {
    const image = new Image();
    image.src = source;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
    const size = canvas.width;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Profile image cropper is unavailable");
    }
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, size, size);
    const scale = Math.max(size / image.width, size / image.height) * zoom;
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const drawX = (size - drawWidth) / 2 + (offsetX / 100) * size;
    const drawY = (size - drawHeight) / 2 + (offsetY / 100) * size;
    context.save();
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    context.clip();
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    context.restore();
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <h1 className="font-heading text-4xl font-bold">Account Settings</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <label className="grid gap-2 text-sm font-semibold">
              Change Name
              <input className="rounded-2xl border border-border bg-transparent px-4 py-3 outline-none focus:border-primary" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </label>
            <div className="grid gap-4">
              <p className="text-sm font-semibold">Profile Picture</p>
              <div className="flex flex-wrap items-center gap-5">
                <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-primary/30 bg-primary/10">
                  {profileImage ? <img className="h-full w-full object-cover" src={profileImage} alt="Profile preview" /> : <span className="text-2xl font-bold text-primary">{fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>}
                </div>
                <label className="inline-flex cursor-pointer rounded-full border border-border bg-card/70 px-5 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary">
                  Upload Image
                  <input className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => loadProfileFile(event.target.files?.[0])} />
                </label>
              </div>
              {rawImage ? (
                <div className="rounded-2xl border border-border p-4">
                  <div className="mx-auto h-64 w-64 overflow-hidden rounded-full border-4 border-primary/40 bg-slate-900">
                    <canvas ref={cropPreviewRef} width="320" height="320" className="h-full w-full" aria-label="Crop preview" />
                  </div>
                  <div className="mt-5 grid gap-4">
                    <label className="grid gap-2 text-sm font-semibold">Zoom
                      <input type="range" min="0.8" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">Move Horizontal
                      <input type="range" min="-75" max="75" step="1" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold">Move Vertical
                      <input type="range" min="-75" max="75" step="1" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="secondary" onClick={applyCrop}>Apply Crop</Button>
                      <Button type="button" variant="secondary" onClick={() => { setZoom(1.15); setOffsetX(0); setOffsetY(0); }}>Reset Crop</Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {status ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{status}</p> : null}
            <Button disabled={saving} type="submit">{saving ? "Saving..." : "Save Settings"}</Button>
          </form>
        </Card>
        <div className="grid gap-6">
          <Card>
            <h2 className="font-heading text-xl font-bold">Notification Preferences</h2>
            <p className="mt-3 text-sm text-muted">Report alerts, diagnostic reminders, and assistant summaries are enabled for the current account workflow.</p>
          </Card>
          <Card>
            <h2 className="font-heading text-xl font-bold">Theme Preference</h2>
            <p className="mt-2 text-sm text-muted">Current theme: {theme}</p>
            <Button className="mt-4" type="button" variant="secondary" onClick={toggleTheme}>Toggle Theme</Button>
          </Card>
          <Card>
            <h2 className="font-heading text-xl font-bold">Privacy & Security</h2>
            <div className="mt-3 grid gap-2 text-sm text-muted">
              <p>Login method: {user?.isVerified ? "Google / Verified" : "Email password"}</p>
              <p>Active session: Browser JWT session</p>
              <p>Last login/update: {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Current session"}</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
