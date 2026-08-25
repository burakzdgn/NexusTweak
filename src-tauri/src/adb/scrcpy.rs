use std::path::{Path, PathBuf};
use std::process::Stdio;
use tokio::process::{Child, Command};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrcpyOptions {
    pub turn_screen_off: bool,
    pub stay_awake: bool,
    pub show_touches: bool,
    pub max_fps: Option<u32>,
    pub bit_rate_mb: Option<u32>,
    pub record_to_file: bool,
    pub always_on_top: bool,
    pub no_audio: bool,
    pub read_only: bool,
}

pub struct ScrcpyManager;

impl ScrcpyManager {
    /// Resolves the scrcpy binary path
    pub fn get_scrcpy_path() -> String {
        let is_windows = cfg!(target_os = "windows");
        let bin_name = if is_windows { "scrcpy.exe" } else { "scrcpy" };

        // 1. Check binaries/scrcpy/
        let local_scrcpy = PathBuf::from("binaries").join("scrcpy").join(bin_name);
        if local_scrcpy.exists() {
            return local_scrcpy.to_string_lossy().to_string();
        }

        // 2. Check binaries/
        let local_bin = PathBuf::from("binaries").join(bin_name);
        if local_bin.exists() {
            return local_bin.to_string_lossy().to_string();
        }

        // 3. Fallback to system PATH
        "scrcpy".to_string()
    }

    /// Check if scrcpy is executable
    pub async fn check_available() -> bool {
        let bin = Self::get_scrcpy_path();
        let mut cmd = Command::new(&bin);
        cmd.arg("--version");

        #[cfg(target_os = "windows")]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

        match tokio::time::timeout(std::time::Duration::from_secs(4), cmd.output()).await {
            Ok(Ok(output)) => output.status.success(),
            _ => false,
        }
    }

    /// Download and extract official scrcpy release from GitHub
    pub async fn download_and_install() -> Result<String, String> {
        let scrcpy_dir = PathBuf::from("binaries").join("scrcpy");
        if !scrcpy_dir.exists() {
            let _ = std::fs::create_dir_all(&scrcpy_dir);
        }

        let is_windows = cfg!(target_os = "windows");
        let is_macos = cfg!(target_os = "macos");

        let url = if is_windows {
            "https://github.com/Genymobile/scrcpy/releases/download/v3.1/scrcpy-win64-v3.1.zip"
        } else if is_macos {
            "https://github.com/Genymobile/scrcpy/releases/download/v3.1/scrcpy-macos-v3.1.tar.gz"
        } else {
            "https://github.com/Genymobile/scrcpy/releases/download/v3.1/scrcpy-linux-v3.1.tar.gz"
        };

        let zip_path = PathBuf::from("binaries").join("scrcpy_download.zip");

        #[cfg(target_os = "windows")]
        {
            let download_cmd = format!(
                "Invoke-WebRequest -Uri '{}' -OutFile '{}'; Expand-Archive -Path '{}' -DestinationPath '{}' -Force; Remove-Item -Path '{}' -Force",
                url,
                zip_path.to_string_lossy(),
                zip_path.to_string_lossy(),
                PathBuf::from("binaries").to_string_lossy(),
                zip_path.to_string_lossy()
            );

            let mut cmd = Command::new("powershell");
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
            cmd.arg("-NoProfile").arg("-Command").arg(&download_cmd);

            let output = cmd.output().await.map_err(|e| format!("Failed to download scrcpy: {}", e))?;
            if !output.status.success() {
                return Err(format!("Download failed: {}", String::from_utf8_lossy(&output.stderr)));
            }

            // Move contents from scrcpy-win64-v3.1 folder if extracted with parent
            let unzipped_dir = PathBuf::from("binaries").join("scrcpy-win64-v3.1");
            if unzipped_dir.exists() {
                let _ = std::fs::rename(&unzipped_dir, &scrcpy_dir);
            }
        }

        #[cfg(not(target_os = "windows"))]
        {
            let download_cmd = format!(
                "curl -L '{}' -o '{}' && tar -xzf '{}' -C '{}' && rm -f '{}'",
                url,
                zip_path.to_string_lossy(),
                zip_path.to_string_lossy(),
                PathBuf::from("binaries").to_string_lossy(),
                zip_path.to_string_lossy()
            );

            let mut cmd = Command::new("sh");
            cmd.arg("-c").arg(&download_cmd);

            let output = cmd.output().await.map_err(|e| format!("Failed to download scrcpy: {}", e))?;
            if !output.status.success() {
                return Err(format!("Download failed: {}", String::from_utf8_lossy(&output.stderr)));
            }
        }

        let bin_name = if is_windows { "scrcpy.exe" } else { "scrcpy" };
        let installed_bin = scrcpy_dir.join(bin_name);

        if installed_bin.exists() {
            Ok(installed_bin.to_string_lossy().to_string())
        } else {
            // Check if installed in PATH
            if Self::check_available().await {
                Ok("scrcpy (system PATH)".to_string())
            } else {
                Err("scrcpy binary could not be verified after installation.".to_string())
            }
        }
    }

    /// Spawn a scrcpy screen mirroring process
    pub fn spawn_mirror(
        serial: &str,
        adb_path: &str,
        options: &ScrcpyOptions,
    ) -> Result<Child, String> {
        let scrcpy_bin = Self::get_scrcpy_path();
        let mut cmd = Command::new(&scrcpy_bin);

        // Target device
        cmd.arg("-s").arg(serial);

        // Point to custom adb if available
        if Path::new(adb_path).exists() {
            cmd.env("ADB", adb_path);
        }

        // Window title
        cmd.arg(format!("--window-title=NexusTweak Screen Mirror [{}]", serial));

        if options.turn_screen_off {
            cmd.arg("--turn-screen-off");
        }

        if options.stay_awake {
            cmd.arg("--stay-awake");
        }

        if options.show_touches {
            cmd.arg("--show-touches");
        }

        if options.always_on_top {
            cmd.arg("--always-on-top");
        }

        if options.no_audio {
            cmd.arg("--no-audio");
        }

        if options.read_only {
            cmd.arg("--no-control");
        }

        if let Some(fps) = options.max_fps {
            cmd.arg(format!("--max-fps={}", fps));
        }

        if let Some(mb) = options.bit_rate_mb {
            cmd.arg(format!("-b={}M", mb));
        }

        if options.record_to_file {
            let rec_dir = PathBuf::from("recordings");
            let _ = std::fs::create_dir_all(&rec_dir);
            let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
            let rec_file = rec_dir.join(format!("{}_{}.mp4", serial.replace([':', '.', '/'], "_"), timestamp));
            cmd.arg(format!("--record={}", rec_file.to_string_lossy()));
        }

        cmd.stdout(Stdio::null());
        cmd.stderr(Stdio::null());

        #[cfg(target_os = "windows")]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

        cmd.spawn().map_err(|e| format!("Failed to spawn scrcpy process: {}", e))
    }
}
