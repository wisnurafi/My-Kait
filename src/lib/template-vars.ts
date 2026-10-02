/**
 * Template variable substitution.
 * See PRD section 3.10 (P2).
 *
 * Supported variables:
 * {tanggal}      — current date (ID format)
 * {tanggal_en}   — current date (EN format)
 * {waktu}        — current time
 * {timestamp}    — ISO timestamp
 * {tanggal_lengkap} — full date+time
 * {hari}         — day name (ID)
 * {bulan}        — month name (ID)
 * {tahun}        — year
 */

const dayNamesID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const monthNamesID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const dayNamesEN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNamesEN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function substituteVariables(text: string, customVars?: Record<string, string>): string {
  const now = new Date();
  
  const defaults: Record<string, string> = {
    "{tanggal}": now.toLocaleDateString("id-ID"),
    "{tanggal_en}": now.toLocaleDateString("en-US"),
    "{waktu}": now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    "{timestamp}": now.toISOString(),
    "{tanggal_lengkap}": now.toLocaleString("id-ID"),
    "{hari}": dayNamesID[now.getDay()],
    "{hari_en}": dayNamesEN[now.getDay()],
    "{bulan}": monthNamesID[now.getMonth()],
    "{bulan_en}": monthNamesEN[now.getMonth()],
    "{tahun}": String(now.getFullYear()),
  };

  // Merge custom vars over defaults
  const vars = { ...defaults, ...customVars };

  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

/**
 * Recursively substitute variables in a payload object.
 * Traverses all string values in the payload.
 */
export function substitutePayloadVariables(
  payload: Record<string, unknown>,
  customVars?: Record<string, string>,
): Record<string, unknown> {
  function processValue(value: unknown): unknown {
    if (typeof value === "string") {
      return substituteVariables(value, customVars);
    }
    if (Array.isArray(value)) {
      return value.map(processValue);
    }
    if (value && typeof value === "object") {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        result[k] = processValue(v);
      }
      return result;
    }
    return value;
  }

  return processValue(payload) as Record<string, unknown>;
}
