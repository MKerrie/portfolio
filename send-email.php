<?php
// CORS - alleen mkerrie.com mag dit aanroepen
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://www.mkerrie.com', 'https://mkerrie.com'];
if (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    http_response_code(403);
    exit;
}
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Input
$data    = json_decode(file_get_contents('php://input'), true) ?? [];
$name    = htmlspecialchars(trim($data['name']    ?? ''), ENT_QUOTES, 'UTF-8');
$email   = filter_var(trim($data['email']   ?? ''), FILTER_VALIDATE_EMAIL);
$message = htmlspecialchars(trim($data['message'] ?? ''), ENT_QUOTES, 'UTF-8');

if (!$name || !$email || strlen($name) < 2 || strlen($message) < 10) {
    http_response_code(400);
    echo json_encode(['error' => 'Ongeldige invoer']);
    exit;
}

// HTML e-mail
$timestamp = (new DateTime())->setTimezone(new DateTimeZone('Europe/Amsterdam'))->format('d-m-Y H:i');
$msgHtml = nl2br($message);
$html = <<<HTML
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:8px">
  <h2 style="color:#047857;border-bottom:2px solid #047857;padding-bottom:12px;margin-top:0">Nieuw bericht via mkerrie.com</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:8px 0;color:#6b7280;width:100px"><strong>Naam:</strong></td><td style="padding:8px 0;color:#111827">$name</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280"><strong>E-mail:</strong></td><td style="padding:8px 0"><a href="mailto:$email" style="color:#047857">$email</a></td></tr>
    <tr><td style="padding:8px 0;color:#6b7280"><strong>Datum:</strong></td><td style="padding:8px 0;color:#111827">$timestamp</td></tr>
  </table>
  <h3 style="color:#047857;margin-top:20px">Bericht:</h3>
  <div style="background:#fff;border-left:4px solid #047857;padding:16px;border-radius:4px;color:#374151;line-height:1.6">$msgHtml</div>
  <p style="margin-top:20px;color:#9ca3af;font-size:12px;text-align:center">
    Verzonden via <a href="https://www.mkerrie.com" style="color:#047857">mkerrie.com</a>
  </p>
</div>
HTML;

// SMTP via Brevo
$smtpHost = 'smtp-relay.brevo.com';
$smtpPort = 587;
$smtpUser = 'a530a6001@smtp-brevo.com';
$smtpPass = 'FbYHqrmwM0sk4cfD';
$toEmail  = 'mkorgu@gmail.com';
$toName   = 'Mevlüt Kerim Örgü';
$subject  = "Nieuw bericht van $name via mkerrie.com";

function smtpRead($sock) {
    $out = '';
    while (($line = fgets($sock, 512)) !== false) {
        $out .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') break;
    }
    return $out;
}

function smtpCmd($sock, $cmd) {
    fwrite($sock, $cmd . "\r\n");
    return smtpRead($sock);
}

try {
    $sock = @stream_socket_client("tcp://$smtpHost:$smtpPort", $errno, $errstr, 15);
    if (!$sock) throw new Exception("Kan geen verbinding maken: $errstr");

    stream_set_timeout($sock, 15);
    smtpRead($sock); // 220 greeting

    smtpCmd($sock, 'EHLO mkerrie.com');
    smtpCmd($sock, 'STARTTLS');

    if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new Exception('TLS mislukt');
    }

    smtpCmd($sock, 'EHLO mkerrie.com');
    smtpCmd($sock, 'AUTH LOGIN');
    smtpCmd($sock, base64_encode($smtpUser));
    $authResp = smtpCmd($sock, base64_encode($smtpPass));

    if (strpos($authResp, '235') === false) throw new Exception('Auth mislukt');

    smtpCmd($sock, "MAIL FROM:<$smtpUser>");
    smtpCmd($sock, "RCPT TO:<$toEmail>");
    smtpCmd($sock, 'DATA');

    $headers  = "From: Portfolio Contact <$smtpUser>\r\n";
    $headers .= "To: $toName <$toEmail>\r\n";
    $headers .= "Reply-To: $name <$email>\r\n";
    $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: base64\r\n";

    fwrite($sock, $headers . "\r\n" . chunk_split(base64_encode($html)) . "\r\n.\r\n");
    $dataResp = smtpRead($sock);

    smtpCmd($sock, 'QUIT');
    fclose($sock);

    if (strpos($dataResp, '250') === false) throw new Exception('Verzenden mislukt');

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
