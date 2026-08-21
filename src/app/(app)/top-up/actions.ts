"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const kodeSchema = z.string().trim().min(1).max(50);
const nonceSchema = z.uuid();
const refSchema = z
  .string()
  .trim()
  .regex(/^TOP[A-Z0-9]{6,40}$/);
const MIME_OK = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAKS_BYTE = 5 * 1024 * 1024;

/** Buat order top-up dari paket terpilih, lalu ke halaman pembayaran. */
export async function buatOrderAction(formData: FormData): Promise<void> {
  const kode = kodeSchema.safeParse(formData.get("paket"));
  const nonce = nonceSchema.safeParse(formData.get("nonce"));
  if (!kode.success || !nonce.success) redirect("/top-up?galat=input");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");

  const { data, error } = await supabase.rpc("buat_order_topup", {
    p_package_code: kode.success ? kode.data : "",
    p_idempotency_key: nonce.success ? nonce.data : "",
  });

  if (error || typeof data !== "string") {
    const sebab = error?.message?.includes("rekening") ? "rekening" : "order";
    redirect(`/top-up?galat=${sebab}`);
  }

  redirect(`/top-up/${data}`);
}

/** Unggah bukti transfer ke bucket privat + catat lewat submit_proof. */
export async function kirimBuktiAction(formData: FormData): Promise<void> {
  const ref = refSchema.safeParse(formData.get("ref"));
  const file = formData.get("bukti");
  if (!ref.success) redirect("/top-up?galat=order");
  const orderRef = ref.success ? ref.data : "";

  if (!(file instanceof File) || file.size === 0) redirect(`/top-up/${orderRef}?galat=berkas`);
  const berkas = file as File;
  if (berkas.size > MAKS_BYTE) redirect(`/top-up/${orderRef}?galat=ukuran`);
  if (!MIME_OK.has(berkas.type)) redirect(`/top-up/${orderRef}?galat=jenis`);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");

  const bytes = new Uint8Array(await berkas.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  const ext = berkas.type === "image/png" ? "png" : berkas.type === "image/webp" ? "webp" : "jpg";
  // ponytail: unggah apa adanya. Pipeline gambar (resize/strip metadata/target
  // ~75KB, SCHEMA §31.4) ditunda — bucket sudah batasi 5MB + mime.
  const path = `${user.id}/${orderRef}/${randomUUID()}.${ext}`;

  const admin = createSupabaseAdminClient();
  const unggah = await admin.storage
    .from("payment-proofs")
    .upload(path, bytes, { contentType: berkas.type, upsert: false });
  if (unggah.error) redirect(`/top-up/${orderRef}?galat=unggah`);

  const { error } = await supabase.rpc("submit_proof", {
    p_order_ref: orderRef,
    p_storage_path: path,
    p_content_hash: hash,
    p_mime_type: berkas.type,
    p_original_size: berkas.size,
    p_stored_size: berkas.size,
  });
  if (error) {
    // Bersihkan berkas yatim kalau pencatatan gagal.
    await admin.storage.from("payment-proofs").remove([path]);
    redirect(`/top-up/${orderRef}?galat=simpan`);
  }

  revalidatePath(`/top-up/${orderRef}`);
  redirect(`/top-up/${orderRef}`);
}
