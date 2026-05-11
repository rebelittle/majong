import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { upsertMyProfile, uploadProfilePhoto } from "../lib/dataApi";
import { resizeImage, initialsOf } from "../lib/utils";
import type { SkillLevel } from "../lib/database.types";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel | "">("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setSkillLevel(profile.skill_level ?? "");
      setNotes(profile.notes ?? "");
      setPhotoUrl(profile.photo_url);
    }
  }, [profile]);

  const isNew = !profile;

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await resizeImage(file, 800, 0.85);
      setPendingPhoto(blob);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Failed to read image.");
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!displayName.trim()) {
      setErrMsg("Please enter a name.");
      return;
    }
    setSaving(true);
    setErrMsg("");
    try {
      let nextPhotoUrl = photoUrl;
      if (pendingPhoto) {
        nextPhotoUrl = await uploadProfilePhoto(user.id, pendingPhoto);
      }
      await upsertMyProfile(user.id, user.email ?? "", {
        display_name: displayName.trim(),
        skill_level: (skillLevel || null) as SkillLevel | null,
        notes: notes.trim() || null,
        photo_url: nextPhotoUrl,
      });
      await refreshProfile();
      navigate("/");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6">
      <div className="mb-7">
        <p className="pill">{isNew ? "Welcome" : "Your profile"}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">
          {isNew ? "Make your place card." : "Edit your place card."}
        </h1>
        <p className="mt-2 max-w-lg text-fox-ink/75">
          This is what shows up on your chair when you reserve a seat — so other moms
          know who they're sitting with.
        </p>
      </div>

      <form onSubmit={onSave} className="card overflow-hidden">
        <div className="grid gap-7 p-7 sm:grid-cols-[180px_1fr] sm:p-9">
          <div>
            <span className="label">Photo</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative block aspect-square w-full overflow-hidden rounded-2xl border-2 border-dashed border-fox-cream-200 bg-fox-cream-50/50 transition hover:border-fox-yellow-500/60"
            >
              {(photoPreview || photoUrl) ? (
                <img
                  src={photoPreview || photoUrl!}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full place-items-center font-display text-4xl text-fox-yellow-700/40">
                  {displayName ? initialsOf(displayName) : "+"}
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-fox-navy-900/0 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-fox-cream-50 opacity-0 transition group-hover:bg-fox-navy-900/70 group-hover:opacity-100">
                Change
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
            />
            <p className="mt-2 text-[11px] text-fox-ink/50">
              Resized to 800px max before upload.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="label">Display name</label>
              <input
                id="name"
                type="text"
                required
                placeholder="Sarah L."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <span className="label">Skill level</span>
              <div className="flex flex-wrap gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSkillLevel(lvl)}
                    className={
                      "rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition " +
                      (skillLevel === lvl
                        ? "bg-fox-navy-700 text-fox-cream-50"
                        : "border border-fox-cream-200 bg-white text-fox-navy-700 hover:bg-fox-cream-100")
                    }
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="label">Anything we should know? <span className="font-normal normal-case tracking-normal text-fox-ink/50">(optional)</span></label>
              <textarea
                id="notes"
                rows={3}
                placeholder="I bring my own set / kid is Lily / allergic to peanuts"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input resize-none"
              />
            </div>
          </div>
        </div>

        {errMsg && (
          <p className="border-t border-tile-red/30 bg-tile-red/5 px-7 py-3 text-sm text-tile-red sm:px-9">
            {errMsg}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-fox-cream-200 bg-fox-cream-50/60 px-7 py-4 sm:px-9">
          {!isNew && (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-ghost"
              disabled={saving}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : isNew ? "Save and continue" : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
