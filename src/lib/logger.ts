const started = Date.now();

function stamp(): string {
  return `${((Date.now() - started) / 1000).toFixed(1)}s`;
}

export const log = {
  step(name: string, detail = ""): void {
    console.log(`[${stamp()}] ▸ ${name}${detail ? ` — ${detail}` : ""}`);
  },
  info(message: string): void {
    console.log(`[${stamp()}]   ${message}`);
  },
  warn(message: string): void {
    console.warn(`[${stamp()}] ! ${message}`);
  },
  error(message: string): void {
    console.error(`[${stamp()}] ✗ ${message}`);
  },
};
