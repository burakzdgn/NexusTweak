use std::path::{Path, PathBuf};
use std::time::Instant;
use tokio::process::Command;
use crate::models::AdbExecutionResult;

#[derive(Debug, Clone)]
pub struct AdbClient {
    custom_adb_path: Option<String>,
}

impl AdbClient {
    pub fn new(custom_path: Option<String>) -> Self {
        Self {
            custom_adb_path: custom_path,
        }
    }

    pub fn set_custom_path(&mut self, path: Option<String>) {
        self.custom_adb_path = path;
    }

    /// Resolves the ADB binary path:
    /// 1. User custom path if provided
    /// 2. Embedded bundled binary in application dir `binaries/adb` (or `adb.exe`)
    /// 3. Environment variable `ANDROID_HOME` or `ANDROID_SDK_ROOT`
    /// 4. Default system `adb` in PATH
    pub fn get_adb_path(&self) -> String {
        if let Some(ref path) = self.custom_adb_path {
            if Path::new(path).exists() {
                return path.clone();
            }
        }

        let is_windows = cfg!(target_os = "windows");
        let bin_name = if is_windows { "adb.exe" } else { "adb" };

        // Check local embedded directory
        let local_bin = PathBuf::from("binaries").join(bin_name);
        if local_bin.exists() {
            return local_bin.to_string_lossy().to_string();
        }

        // Check ANDROID_HOME / ANDROID_SDK_ROOT
        if let Ok(android_home) = std::env::var("ANDROID_HOME") {
            let p = PathBuf::from(android_home).join("platform-tools").join(bin_name);
            if p.exists() {
                return p.to_string_lossy().to_string();
            }
        }

        if let Ok(sdk_root) = std::env::var("ANDROID_SDK_ROOT") {
            let p = PathBuf::from(sdk_root).join("platform-tools").join(bin_name);
            if p.exists() {
                return p.to_string_lossy().to_string();
            }
        }

        // Default to PATH adb
        "adb".to_string()
    }

    /// Execute an ADB command for a specific device serial or globally
    pub async fn execute(&self, serial: Option<&str>, args: &[&str]) -> Result<AdbExecutionResult, String> {
        let start = Instant::now();
        let adb_bin = self.get_adb_path();

        let mut cmd = Command::new(&adb_bin);
        
        // Disable Windows console window popups if on Windows
        #[cfg(target_os = "windows")]
        {
            // CREATE_NO_WINDOW flag
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

        if let Some(s) = serial {
            cmd.arg("-s").arg(s);
        }

        for arg in args {
            cmd.arg(arg);
        }

        let full_command = format!("{} {}", adb_bin, args.join(" "));

        match tokio::time::timeout(std::time::Duration::from_secs(15), cmd.output()).await {
            Ok(output_res) => match output_res {
                Ok(output) => {
                    let duration = start.elapsed().as_millis() as u64;
                    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
                    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
                    let exit_code = output.status.code().unwrap_or(-1);

                    Ok(AdbExecutionResult {
                        success: output.status.success(),
                        command: full_command,
                        stdout,
                        stderr,
                        exit_code,
                        execution_time_ms: duration,
                    })
                }
                Err(e) => Err(format!("Failed to execute adb: {}. Please ensure ADB is installed and in PATH or configure in Settings.", e)),
            },
            Err(_) => Err("ADB command timed out after 15 seconds".to_string()),
        }
    }

    /// Execute a shell command directly on the device
    pub async fn shell(&self, serial: &str, shell_cmd: &str) -> Result<AdbExecutionResult, String> {
        self.execute(Some(serial), &["shell", shell_cmd]).await
    }

    /// Connect to wireless ADB device (IP:PORT)
    pub async fn connect_wifi(&self, ip_port: &str) -> Result<AdbExecutionResult, String> {
        self.execute(None, &["connect", ip_port]).await
    }

    /// Disconnect wireless device
    pub async fn disconnect_wifi(&self, ip_port: &str) -> Result<AdbExecutionResult, String> {
        self.execute(None, &["disconnect", ip_port]).await
    }
}
