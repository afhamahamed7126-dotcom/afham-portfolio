<?php
/**
 * Mail Configuration & Environment Loader
 * Afham Ahamed Portfolio Backend
 */

// Prevent direct script access if required
if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(__DIR__, 2));
}

/**
 * Simple .env file parser (zero-dependency)
 */
function loadEnv($envPath) {
    if (!file_exists($envPath)) {
        return;
    }
    
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            // Remove surrounding quotes if present
            if ((str_starts_with($val, '"') && str_ends_with($val, '"')) ||
                (str_starts_with($val, "'") && str_ends_with($val, "'"))) {
                $val = substr($val, 1, -1);
            }
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $val;
                putenv("$key=$val");
            }
        }
    }
}

// Load .env from root if available
$envFile = APP_ROOT . DIRECTORY_SEPARATOR . '.env';
loadEnv($envFile);

function getEnvVar($key, $default = '') {
    $val = getenv($key);
    if ($val !== false && $val !== '') {
        return $val;
    }
    return $_ENV[$key] ?? $default;
}

return [
    'smtp_host'     => getEnvVar('SMTP_HOST', ''),
    'smtp_port'     => (int) getEnvVar('SMTP_PORT', 587),
    'smtp_user'     => getEnvVar('SMTP_USERNAME', ''),
    'smtp_pass'     => getEnvVar('SMTP_PASSWORD', ''),
    'mail_from'     => getEnvVar('MAIL_FROM', 'no-reply@afhamahamed.com'),
    'mail_to'       => getEnvVar('MAIL_TO', 'afhamahamed7126@gmail.com'),
    'mail_from_name'=> getEnvVar('MAIL_FROM_NAME', 'Afham Portfolio Contact Form'),
];
