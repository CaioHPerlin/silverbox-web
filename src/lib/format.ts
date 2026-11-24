export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1).replace(".", ",")} ${units[i]}`;
}

export function formatDecimalBytes(bytes: string | bigint) {
  const amount = BigInt(bytes);
  const absoluteAmount = amount < 0n ? -amount : amount;
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let divisor = 1n;
  let unitIndex = 0;

  while (absoluteAmount >= divisor * 1_000n && unitIndex < units.length - 1) {
    divisor *= 1_000n;
    unitIndex += 1;
  }

  const sign = amount < 0n ? "−" : "";
  const whole = absoluteAmount / divisor;

  if (unitIndex === 0) {
    return `${sign}${new Intl.NumberFormat("pt-BR").format(whole)} ${units[unitIndex]}`;
  }

  let tenths = ((absoluteAmount % divisor) * 10n + divisor / 2n) / divisor;
  let roundedWhole = tenths === 10n ? whole + 1n : whole;

  if (tenths === 10n) {
    tenths = 0n;
    if (roundedWhole === 1_000n && unitIndex < units.length - 1) {
      unitIndex += 1;
      roundedWhole = 1n;
    }
  }

  const formattedWhole = new Intl.NumberFormat("pt-BR").format(roundedWhole);

  return `${sign}${formattedWhole},${tenths} ${units[unitIndex]}`;
}
