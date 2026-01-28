import notifier from "node-notifier";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

export const formatDuration = (minutes) => {
  const m = Math.floor(minutes);
  const s = Math.round((minutes % 1) * 60);
  return `${m}m ${s}s`;
};

export const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const notifyUser = (title, message) => {
  // Resolve asset path relative to the script location
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const assetPath = path.resolve(__dirname, "..", "src", "assets");

  const soundPath = path.join(assetPath, "notification.wav");
  const iconPath = path.join(assetPath, "icon.png");

  // Play custom sound if it exists using PowerShell (Windows native)
  // Use PowerShell to play the WAV file (Native Windows support, no extra libs needed)
  const psCommand = `powershell -c (New-Object Media.SoundPlayer '${soundPath}').PlaySync()`;

  exec(psCommand, (err) => {
    if (err) {
      // console.error("Failed to play sound:", err);
    }
  });

  notifier.notify({
    title: `🎉 ${title || "Pomos"}`,
    message: message,
    icon: iconPath,
    sound: false, // Turn off default sound since we are playing custom one
    wait: false,
    appID: "Pomos",
  });
};

export const parseDuration = (input) => {
  // Supports formats like: "1h", "10m", "10m30s", "30s", "1h30m"
  if (!input) return 0;

  const hoursMatch = input.match(/(\d+)h/);
  const minutesMatch = input.match(/(\d+)m/);
  const secondsMatch = input.match(/(\d+)s/);

  let totalMinutes = 0;

  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }

  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }

  if (secondsMatch) {
    totalMinutes += parseInt(secondsMatch[1]) / 60;
  }

  // If no "h", "m" or "s" found, treat as minutes (default)
  if (!hoursMatch && !minutesMatch && !secondsMatch) {
    totalMinutes = parseFloat(input);
  }

  return totalMinutes || 0;
};
