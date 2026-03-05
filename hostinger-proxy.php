<?php
/**
 * Plane Mini App - Hostinger Proxy
 * This file should be uploaded to Hostinger hosting as index.php
 * It proxies requests to the actual Mini App server running on the VPS
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-API-Key");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// VPS Mini App Server
$targetHost = '168.231.69.92';
$targetPort = 3000;

$path = $_SERVER['REQUEST_URI'];
$query = $_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : '';
$url = "http://{$targetHost}:{$targetPort}{$path}{$query}";

// Build headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    if (strtolower($name) !== 'host') {
        $headers[] = "{$name}: {$value}";
    }
}
$headers[] = "Host: {$targetHost}:{$targetPort}";

// Handle request body for POST/PUT/PATCH
$body = null;
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    $body = file_get_contents('php://input');
}

// Make the proxied request
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

if ($body !== null) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(502);
    echo "Error: " . curl_error($ch);
    curl_close($ch);
    exit();
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

// Forward relevant headers
foreach (explode("\r\n", $responseHeaders) as $header) {
    if (preg_match('/^(HTTP\/|Content-Type:|Content-Length:|Cache-Control:|ETag:|Last-Modified:)/i', $header)) {
        header($header);
    }
}

// Set content type if not set
if ($contentType) {
    header("Content-Type: {$contentType}");
}

http_response_code($httpCode);
echo $responseBody;
