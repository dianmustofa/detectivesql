import initSqlJs, { Database } from "sql.js";

let db: Database | null = null;

export interface QueryResult {
  success: boolean;
  data: Record<string, unknown>[];
  error?: string;
}

export async function initializeDatabase(
  seedQueries: string[] = []
): Promise<QueryResult> {
  try {
    const SQL = await initSqlJs({
      locateFile: (file) => `/${file}`,
    });

    db = new SQL.Database();

    if (seedQueries.length > 0) {
      for (const query of seedQueries) {
        db.run(query);
      }
    }

    return { success: true, data: [] };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Failed to initialize SQLite WASM:", error);
    return {
      success: false,
      data: [],
      error: error?.message || "Gagal memuat SQLite WASM.",
    };
  }
}

export function executeQuery(sql: string): QueryResult {
  if (!db) {
    return {
      success: false,
      data: [],
      error: "Database belum siap atau belum terinisialisasi.",
    };
  }

  try {
    const trimmedSql = sql.trim();
    if (!trimmedSql) {
      return { success: true, data: [] };
    }

    const execResults = db.exec(trimmedSql);

    if (!execResults || execResults.length === 0) {
      return { success: true, data: [] };
    }

    const { columns, values } = execResults[0];
    const formattedData: Record<string, unknown>[] = values.map((row) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((colName, index) => {
        obj[colName] = row[index];
      });
      return obj;
    });

    return { success: true, data: formattedData };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      data: [],
      error: error?.message || "Terjadi kesalahan sintaks/eksekusi SQL.",
    };
  }
}
