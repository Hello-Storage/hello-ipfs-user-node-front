export function getOS() {
    // detect and return "windows", "mac", "linux"  or "unknown"

    const userAgent = navigator.userAgent;

    if (userAgent.indexOf('Win') !== -1) {
        return 'windows';
    } else if (userAgent.indexOf('Mac') !== -1) {
        return 'macos';
    } else if (userAgent.indexOf('Linux') !== -1) {
        return 'linux';
    } else {
        return null;
    }
}