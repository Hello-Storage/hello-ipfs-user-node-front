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
fn executeCommand(command: String, args: Vec<String>) {
    // convert from Vec<String> to Vec<&str> (required by run_command_with_logging)
    let parsed_args: Vec<&str> = args.iter().map(|s| s.as_str()).collect();
    match run_command_with_logging(command.as_str(), parsed_args.as_slice(), logger) {
        Ok(_) => println!("Command executed successfully"),
        Err(e) => println!("Failed to execute command: {}", e),
    }
}


fn main() {
    // creating a menu for the system tray, with a quit option (add more options later if needed)
    let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("Cmd+Q");

    // creating the system tray menu with the quit option
    let system_tray_menu = SystemTrayMenu::new().add_item(quit);

    // title of the system tray
    let tray_title = "Hello Node";

    // creating the tauri application
    tauri::Builder::default()
        .setup(|app| {
            //saving the main window in a mutex to use it later globally
            let main_window = app.get_window("main").unwrap();
            *MAIN_WINDOW.lock().unwrap() = Some(main_window);
            Ok(())
        })
        // setting the system tray menu plugin
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        // hide to tray when the main window is closed
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        // setting the system tray
        .system_tray(SystemTray::new().with_tooltip(tray_title).with_menu(system_tray_menu))
        // opening the main window when the system tray is clicked
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
            // handling the quit option
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        // tauri commands (to use in the frontend)
        .invoke_handler(tauri::generate_handler![executeCommand])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
