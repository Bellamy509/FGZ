import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🚨 [EMERGENCY] Correction urgente de la table user...");

    // Import direct avec gestion d'erreurs robuste
    const postgres = await import("postgres");

    const connectionString =
      process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) {
      return NextResponse.json(
        {
          error: "No database connection string found",
          success: false,
        },
        { status: 500 },
      );
    }

    const sql = postgres.default(connectionString);

    try {
      // 1. Vérifier si table 'user' existe
      const userTableExists = await sql`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user'
        LIMIT 1;
      `;

      // 2. Vérifier si table 'users' existe
      const usersTableExists = await sql`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
        LIMIT 1;
      `;

      console.log(
        `📋 [EMERGENCY] user table exists: ${userTableExists.length > 0}`,
      );
      console.log(
        `📋 [EMERGENCY] users table exists: ${usersTableExists.length > 0}`,
      );

      const actions: string[] = [];

      // 3. Si 'user' existe mais pas 'users', renommer
      if (userTableExists.length > 0 && usersTableExists.length === 0) {
        console.log("🔧 [EMERGENCY] Renommage user -> users...");
        await sql`ALTER TABLE "user" RENAME TO "users"`;
        actions.push("Renamed 'user' table to 'users'");
      }

      // 4. Si les deux existent, supprimer 'user'
      else if (userTableExists.length > 0 && usersTableExists.length > 0) {
        console.log("🗑️ [EMERGENCY] Suppression table user en double...");
        await sql`DROP TABLE "user" CASCADE`;
        actions.push("Dropped duplicate 'user' table");
      }

      // 5. Vérifier/ajouter colonnes manquantes
      const emailVerifiedAtExists = await sql`
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' 
        AND column_name = 'email_verified_at'
        LIMIT 1;
      `;

      if (emailVerifiedAtExists.length === 0) {
        console.log("🔧 [EMERGENCY] Ajout colonne email_verified_at...");
        await sql`ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP`;
        actions.push("Added email_verified_at column");
      }

      const roleExists = await sql`
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' 
        AND column_name = 'role'
        LIMIT 1;
      `;

      if (roleExists.length === 0) {
        console.log("🔧 [EMERGENCY] Ajout colonne role...");
        await sql`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`;
        actions.push("Added role column");
      }

      await sql.end();

      console.log("✅ [EMERGENCY] Correction terminée avec succès!");

      return NextResponse.json({
        success: true,
        message: "Database schema emergency fix completed",
        actions: actions,
        timestamp: new Date().toISOString(),
      });
    } catch (dbError: any) {
      console.error("❌ [EMERGENCY] Erreur base de données:", dbError);
      await sql.end();

      return NextResponse.json(
        {
          error: "Database operation failed",
          details: dbError.message,
          success: false,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("❌ [EMERGENCY] Erreur générale:", error);

    return NextResponse.json(
      {
        error: "Emergency fix failed",
        details: error.message,
        success: false,
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  return GET(); // Même logique pour POST
}
