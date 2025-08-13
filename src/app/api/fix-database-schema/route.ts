import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log(
      "🚨 [DATABASE FIX] Correction d'urgence du schéma de base de données...",
    );

    // Import dynamique pour éviter les erreurs de build
    const { sql } = await import("drizzle-orm");
    const { db } = await import("@/lib/db/pg/db.pg");

    // 1. Vérifier les tables existantes
    console.log("🔍 [DATABASE FIX] Vérification des tables...");

    let hasUser = false;
    let hasUsers = false;

    try {
      // Vérifier table 'user'
      const userCheck = await db.execute(sql`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user'
        LIMIT 1;
      `);
      hasUser =
        userCheck &&
        (Array.isArray(userCheck)
          ? userCheck.length > 0
          : (userCheck as any).rowCount > 0);

      // Vérifier table 'users'
      const usersCheck = await db.execute(sql`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
        LIMIT 1;
      `);
      hasUsers =
        usersCheck &&
        (Array.isArray(usersCheck)
          ? usersCheck.length > 0
          : (usersCheck as any).rowCount > 0);

      console.log("📋 [DATABASE FIX] Tables trouvées:", { hasUser, hasUsers });
    } catch (error) {
      console.error(
        "❌ [DATABASE FIX] Erreur lors de la vérification des tables:",
        error,
      );
      throw error;
    }

    // 2. Correction selon le cas
    if (hasUser && !hasUsers) {
      console.log(
        '🔧 [DATABASE FIX] Renommage de la table "user" en "users"...',
      );
      await db.execute(sql`ALTER TABLE "user" RENAME TO "users"`);
      console.log("✅ [DATABASE FIX] Table renommée avec succès !");
    } else if (hasUsers && hasUser) {
      console.log(
        '⚠️  [DATABASE FIX] Suppression de l\'ancienne table "user"...',
      );
      await db.execute(sql`DROP TABLE "user" CASCADE`);
      console.log("✅ [DATABASE FIX] Ancienne table supprimée !");
    } else if (!hasUsers && !hasUser) {
      console.log("❌ [DATABASE FIX] Aucune table user/users trouvée !");
      return NextResponse.json(
        {
          success: false,
          message:
            "Aucune table user/users trouvée. Vérifiez les migrations Drizzle.",
        },
        { status: 500 },
      );
    }

    // 3. Vérifier et ajouter les colonnes manquantes
    console.log("🔧 [DATABASE FIX] Vérification des colonnes...");

    // Vérifier la colonne role
    const roleExists = await db.execute(sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'role'
      LIMIT 1;
    `);

    const hasRoleColumn =
      roleExists &&
      (Array.isArray(roleExists)
        ? roleExists.length > 0
        : (roleExists as any).rowCount > 0);
    if (!hasRoleColumn) {
      console.log('🔧 [DATABASE FIX] Ajout de la colonne "role"...');
      await db.execute(
        sql`ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user'`,
      );
      console.log('✅ [DATABASE FIX] Colonne "role" ajoutée !');
    }

    // Vérifier la colonne email_verified_at
    const emailVerifiedAtExists = await db.execute(sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'email_verified_at'
      LIMIT 1;
    `);

    const hasEmailVerifiedAtColumn =
      emailVerifiedAtExists &&
      (Array.isArray(emailVerifiedAtExists)
        ? emailVerifiedAtExists.length > 0
        : (emailVerifiedAtExists as any).rowCount > 0);
    if (!hasEmailVerifiedAtColumn) {
      console.log(
        '🔧 [DATABASE FIX] Ajout de la colonne "email_verified_at"...',
      );
      await db.execute(
        sql`ALTER TABLE "users" ADD COLUMN "email_verified_at" TIMESTAMP`,
      );
      console.log('✅ [DATABASE FIX] Colonne "email_verified_at" ajoutée !');
    }

    console.log("🎉 [DATABASE FIX] Correction terminée avec succès !");

    return NextResponse.json({
      success: true,
      message: "Schéma de base de données corrigé avec succès !",
      details: {
        hasUser,
        hasUsers,
        tablesFound:
          hasUser && hasUsers
            ? ["user", "users"]
            : hasUser
              ? ["user"]
              : hasUsers
                ? ["users"]
                : [],
      },
    });
  } catch (error) {
    console.error("❌ [DATABASE FIX] Erreur lors de la correction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la correction du schéma",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
