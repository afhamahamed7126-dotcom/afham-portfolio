<?php
/**
 * Contact Form API Handler
 * Afham Ahamed Portfolio Backend
 */

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Allow same-origin or explicit CORS for development if needed
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

define('APP_ROOT', dirname(__DIR__));
$config = require __DIR__ . '/config/mail.php';

// Parse POST body (supports both JSON and regular form data)
$input = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (str_contains($contentType, 'application/json')) {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?? [];
} else {
    $input = $_POST;
}

// Honeypot spam check
if (!empty($input['website_hp']) || !empty($input['company_fax'])) {
    // Silent success for bots
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Thank you! Your message has been sent successfully.']);
    exit;
}

// Simple IP-based Rate Limiting (1 message per 15 seconds per IP)
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rateLimitFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'afham_rl_' . md5($clientIp);
$currentTime = time();

if (file_exists($rateLimitFile)) {
    $lastTime = (int) file_get_contents($rateLimitFile);
    if (($currentTime - $lastTime) < 15) {
        http_response_code(429);
        echo json_encode([
            'success' => false, 
            'message' => 'Too many requests. Please wait a few seconds before sending another message.'
        ]);
        exit;
    }
}
@file_put_contents($rateLimitFile, (string)$currentTime);

// Extract & Sanitize fields
$name    = trim($input['name'] ?? '');
$email   = trim($input['email'] ?? '');
$phone   = trim($input['phone'] ?? '');
$subject = trim($input['subject'] ?? '');
$message = trim($input['message'] ?? '');

// Validation
$errors = [];

if (empty($name) || mb_strlen($name) < 2 || mb_strlen($name) > 100) {
    $errors[] = 'Please provide a valid full name (2 - 100 characters).';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 120) {
    $errors[] = 'Please provide a valid email address.';
}

if (!empty($phone) && mb_strlen($phone) > 30) {
    $errors[] = 'Phone number is too long.';
}

if (empty($subject) || mb_strlen($subject) < 3 || mb_strlen($subject) > 150) {
    $errors[] = 'Please provide a valid subject (3 - 150 characters).';
}

if (empty($message) || mb_strlen($message) < 10 || mb_strlen($message) > 3000) {
    $errors[] = 'Message must be between 10 and 3,000 characters.';
}

// Anti-Header Injection
$name    = str_replace(["\r", "\n", "%0a", "%0d"], '', $name);
$email   = str_replace(["\r", "\n", "%0a", "%0d"], '', $email);
$subject = str_replace(["\r", "\n", "%0a", "%0d"], '', $subject);

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => implode(' ', $errors),
        'errors'  => $errors
    ]);
    exit;
}

$recipientEmail = $config['mail_to'] ?: 'afhamahamed7126@gmail.com';
$dateFormatted = date('Y-m-d H:i:s T');

$emailBody = "New Contact Inquiry via Afham Ahamed Portfolio\n";
$emailBody .= "====================================================\n\n";
$emailBody .= "Sender Name  : " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "\n";
$emailBody .= "Sender Email : " . $email . "\n";
$emailBody .= "Phone/WhatsApp: " . ($phone !== '' ? htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') : 'Not provided') . "\n";
$emailBody .= "Subject      : " . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . "\n";
$emailBody .= "Date & Time  : " . $dateFormatted . "\n";
$emailBody .= "Client IP    : " . $clientIp . "\n\n";
$emailBody .= "Message:\n----------------------------------------------------\n";
$emailBody .= $message . "\n";
$emailBody .= "====================================================\n";

$headers  = "From: " . $config['mail_from'] . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$mailSent = false;
$mailError = '';

// Check if custom SMTP is configured
if (!empty($config['smtp_host']) && !empty($config['smtp_user'])) {
    // SMTP connection helper
    $mailSent = sendViaSmtp($config, $recipientEmail, "Portfolio Contact: " . $subject, $emailBody, $email, $name, $mailError);
} else {
    // Standard PHP mail() fallback
    // In local development environment without configured sendmail, we log safely and simulate success
    $isLocalhost = in_array($clientIp, ['127.0.0.1', '::1', 'localhost']) || (isset($_SERVER['SERVER_NAME']) && $_SERVER['SERVER_NAME'] === 'localhost');
    
    // Attempt standard mail()
    $prevErr = error_reporting(0);
    $mailSent = @mail($recipientEmail, "Portfolio Contact: " . $subject, $emailBody, $headers);
    error_reporting($prevErr);

    // If local dev environment without mail server, accept submission gracefully and save to local log
    if (!$mailSent && $isLocalhost) {
        $logDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'afham_inquiries';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0777, true);
        }
        $logFile = $logDir . DIRECTORY_SEPARATOR . 'inquiry_' . time() . '.txt';
        @file_put_contents($logFile, $emailBody);
        $mailSent = true; // Mark as handled for local developer testing
    }
}

if ($mailSent) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your message has been sent successfully.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to send message. Please try again or reach out directly via WhatsApp or email.'
    ]);
}

/**
 * Socket-based SMTP Dispatcher with TLS / SSL support
 */
function sendViaSmtp($cfg, $to, $subject, $body, $replyTo, $replyName, &$errOut) {
    $host = $cfg['smtp_host'];
    $port = $cfg['smtp_port'];
    $user = $cfg['smtp_user'];
    $pass = $cfg['smtp_pass'];
    $from = $cfg['mail_from'];
    
    $timeout = 10;
    $socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
    if (!$socket) {
        $errOut = "Could not connect to SMTP server: $errstr ($errno)";
        return false;
    }
    
    $read = function() use ($socket) {
        $res = "";
        while ($line = fgets($socket, 515)) {
            $res .= $line;
            if (substr($line, 3, 1) === " ") break;
        }
        return $res;
    };
    
    $send = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };
    
    $read();
    $send("EHLO " . gethostname());
    $read();
    
    // STARTTLS if port 587
    if ($port === 587) {
        $send("STARTTLS");
        $read();
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        $send("EHLO " . gethostname());
        $read();
    }
    
    $send("AUTH LOGIN");
    $read();
    $send(base64_encode($user));
    $read();
    $send(base64_encode($pass));
    $authRes = $read();
    if (!str_starts_with($authRes, '235')) {
        fclose($socket);
        $errOut = "SMTP Authentication failed";
        return false;
    }
    
    $send("MAIL FROM:<$from>");
    $read();
    $send("RCPT TO:<$to>");
    $read();
    $send("DATA");
    $read();
    
    $headers  = "From: {$cfg['mail_from_name']} <$from>\r\n";
    $headers .= "Reply-To: $replyName <$replyTo>\r\n";
    $headers .= "To: <$to>\r\n";
    $headers .= "Subject: $subject\r\n";
    $headers .= "Date: " . date(DATE_RFC2822) . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    $send($headers . "\r\n" . $body . "\r\n.");
    $read();
    $send("QUIT");
    $read();
    fclose($socket);
    return true;
}
