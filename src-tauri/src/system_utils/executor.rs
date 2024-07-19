use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use std::sync::mpsc::{self};
use std::thread;

pub type Logger = fn(String, String);

// run a command and log the output
pub fn run_command_with_logging(
    command: &str,
    args: &[&str],
    logger: Logger,
) -> std::io::Result<()> {
    println!("executing {} {}", command, args.join(" "));

    let shell = if cfg!(windows) { "cmd" } else { "sh" };

    let command_to_execute = format!("{} {}", command, args.join(" "));

    let arg = if cfg!(windows) {
        &["/C", command_to_execute.as_str()]
    } else {
        &["-c", command_to_execute.as_str()]
    };

    let mut cmd = Command::new(shell)
        .args(arg)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()?;

    let stdout = cmd.stdout.take().expect("Failed to open stdout");
    let stderr = cmd.stderr.take().expect("Failed to open stderr");

    let (tx, rx) = mpsc::channel();

    let tx_clone = tx.clone();
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                tx_clone.send(line).unwrap();
            }
        }
    });

    thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                tx.send(line).unwrap();
            }
        }
    });

    for line in rx {
        println!("{}", line);
        logger(line, "FunctionOutputLogger".to_string());
    }

    cmd.wait()?;
    Ok(())
}
