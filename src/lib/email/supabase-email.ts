import { createClient } from "@supabase/supabase-js";

// Debug des variables d'environnement
console.log("🔍 DEBUG Variables Supabase:", {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://fsgossoeshkajzhblufs.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZ29zc29lc2hrYWp6aGJsdWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNjQ4NDEsImV4cCI6MjA2Mzk0MDg0MX0.lener_f3RySOuUFUtgnbjTkbDlikjB-scIoK_hTI_N4";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function sendVerificationEmailWithSupabase({
  email,
  verificationUrl,
  userName,
}: {
  email: string;
  verificationUrl: string;
  userName: string;
}) {
  try {
    console.log(
      `📧 Tentative d'envoi d'email de vérification à ${email} via Supabase...`,
    );
    console.log(`🔗 URL de vérification : ${verificationUrl}`);

    // Créer un utilisateur temporaire dans Supabase pour déclencher l'email
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: "temp_password_123!", // Mot de passe temporaire
      options: {
        data: {
          name: userName,
          verification_url: verificationUrl, // Stocker l'URL de vérification
        },
        emailRedirectTo: verificationUrl,
      },
    });

    if (error) {
      console.error("❌ Erreur Supabase Email:", error);
      // Fallback : afficher le lien dans les logs
      console.log(`🔗 LIEN DE VÉRIFICATION POUR ${userName} (${email}):`);
      console.log(`${verificationUrl}`);
      console.log(`📧 Copiez ce lien dans votre navigateur`);
      return { success: true, fallback: true };
    }

    console.log(`✅ Email de vérification envoyé via Supabase à : ${email}`);
    console.log(`📮 ID Supabase: ${data.user?.id}`);
    return { success: true, supabaseId: data.user?.id };
  } catch (error) {
    console.error("❌ Erreur Supabase:", error);
    // Fallback : afficher le lien dans les logs
    console.log(`🔗 LIEN DE VÉRIFICATION POUR ${userName} (${email}):`);
    console.log(`${verificationUrl}`);
    console.log(`📧 Copiez ce lien dans votre navigateur`);
    return { success: true, fallback: true };
  }
}

export async function logEmailVerification(
  email: string,
  status: "sent" | "verified" | "failed",
) {
  const timestamp = new Date().toISOString();
  console.log(`📧 [${timestamp}] Email ${email}: ${status}`);
}
