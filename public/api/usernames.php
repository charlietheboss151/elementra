<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Use POST.']);
    exit;
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
$username = is_array($data) && isset($data['username']) && is_string($data['username'])
    ? strtolower(trim($data['username']))
    : '';

if (strlen($username) < 3 || strlen($username) > 24 || !preg_match('/^[a-z0-9_]+$/', $username)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Use 3–24 letters, numbers, or underscores.']);
    exit;
}

$file = dirname(__DIR__, 2) . '/elementra-usernames.json';
$handle = fopen($file, 'c+');
if ($handle === false) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => "Couldn't check that username. Try again."]);
    exit;
}

if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    http_response_code(503);
    echo json_encode(['ok' => false, 'error' => "Couldn't check that username. Try again."]);
    exit;
}

$contents = stream_get_contents($handle);
$names = [];
if (is_string($contents) && $contents !== '') {
    $parsed = json_decode($contents, true);
    if (is_array($parsed)) {
        $names = $parsed;
    }
}

if (in_array($username, $names, true)) {
    flock($handle, LOCK_UN);
    fclose($handle);
    http_response_code(409);
    echo json_encode(['ok' => false, 'error' => 'That username is taken.']);
    exit;
}

$names[] = $username;
rewind($handle);
ftruncate($handle, 0);
fwrite($handle, json_encode(array_values($names)));
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);

echo json_encode(['ok' => true]);
