// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod system_utils;

use lazy_static::lazy_static;
use tauri::Window;
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri_plugin_autostart::MacosLauncher;
use system_utils::executor::run_command_with_logging;

// create a mutex to store the main window
lazy_static! {
    static ref MAIN_WINDOW: std::sync::Mutex<Option<Window>> = std::sync::Mutex::new(None);
}

fn logger(message: String, js_function: String) {
    if let Ok(window) = MAIN_WINDOW.lock() {
        if let Some(win) = &*window {
            let js_code = format!("{}('{}');", js_function, message);
            win.eval(&js_code).unwrap();
        }
    }
}
#[allow(non_snake_case)]
#[tauri::command]
fn executeEcho(){
    match run_command_with_logging("echo", &["hello"], logger) {
        Ok(_) => println!("Command executed successfully"),
        Err(e) => println!("Failed to execute command: {}", e),
    }
}


fn main() {
    // creating a menu for the system tray, with a quit option (add more options later if needed)
    let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("Cmd+Q");

    let system_tray_menu = SystemTrayMenu::new().add_item(quit);
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            *MAIN_WINDOW.lock().unwrap() = Some(main_window);
            Ok(())
        })
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                // toggle application window
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![executeEcho])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
