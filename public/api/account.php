<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Use POST.', 'code' => 'invalid']);
    exit;
}

const MAX_BODY = 524288;
const TOKEN_TTL = 90 * 24 * 60 * 60;
const SCOREBOARD_MAX = 40;

$raw = file_get_contents('php://input') ?: '';
if (strlen($raw) > MAX_BODY) {
    http_response_code(413);
    echo json_encode(['ok' => false, 'error' => 'Request too large.', 'code' => 'invalid']);
    exit;
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Use JSON.', 'code' => 'invalid']);
    exit;
}

$action = isset($data['action']) && is_string($data['action']) ? $data['action'] : '';
$username = isset($data['username']) && is_string($data['username'])
    ? strtolower(trim($data['username']))
    : '';
$password = isset($data['password']) && is_string($data['password']) ? $data['password'] : '';
$token = isset($data['token']) && is_string($data['token']) ? $data['token'] : '';
$progressIn = $data['progress'] ?? null;
$handle = null;

function release_lock(): void
{
    global $handle;
    if ($handle) {
        flock($handle, LOCK_UN);
        fclose($handle);
        $handle = null;
    }
}

function fail(int $status, string $error, string $code): void
{
    release_lock();
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $error, 'code' => $code]);
    exit;
}

function valid_username(string $username): bool
{
    return strlen($username) >= 3 && strlen($username) <= 24 && (bool) preg_match('/^[a-z0-9_]+$/', $username);
}

function sanitize_setup($value): ?array
{
    if (!is_array($value)) {
        return null;
    }
    $modeId = isset($value['modeId']) && is_string($value['modeId']) ? $value['modeId'] : '';
    $elementSet = isset($value['elementSet']) && is_string($value['elementSet']) ? $value['elementSet'] : '';
    if ($modeId === '' || $elementSet === '' || !array_key_exists('timed', $value) || !is_bool($value['timed'])) {
        return null;
    }
    return ['modeId' => $modeId, 'elementSet' => $elementSet, 'timed' => $value['timed']];
}

function sanitize_scoreboard($value): array
{
    if (!is_array($value)) {
        return [];
    }
    $out = [];
    foreach ($value as $row) {
        if (!is_array($row)) {
            continue;
        }
        if (
            !isset($row['id'], $row['at'], $row['modeId'], $row['elementSet'], $row['timed'], $row['accuracy'], $row['elapsedMs'], $row['correct'], $row['total'])
            || !is_string($row['id'])
            || !is_numeric($row['at'])
            || !is_string($row['modeId'])
            || !is_string($row['elementSet'])
            || !is_bool($row['timed'])
            || !is_numeric($row['accuracy'])
            || !is_numeric($row['elapsedMs'])
            || !is_numeric($row['correct'])
            || !is_numeric($row['total'])
        ) {
            continue;
        }
        $score = isset($row['score']) && is_numeric($row['score'])
            ? (float) $row['score']
            : (float) $row['accuracy'] / 100 * (float) $row['total'] * 3;
        $out[] = [
            'id' => $row['id'],
            'at' => (float) $row['at'],
            'modeId' => $row['modeId'],
            'elementSet' => $row['elementSet'],
            'timed' => $row['timed'],
            'accuracy' => (float) $row['accuracy'],
            'elapsedMs' => (float) $row['elapsedMs'],
            'correct' => (float) $row['correct'],
            'total' => (float) $row['total'],
            'score' => $score,
            'incomplete' => isset($row['incomplete']) && $row['incomplete'] === true,
        ];
        if (count($out) >= 80) {
            break;
        }
    }
    return $out;
}

function sanitize_stats($value): array
{
    if (!is_array($value)) {
        return [];
    }
    $out = [];
    foreach ($value as $key => $row) {
        if (!is_array($row) || !isset($row['first']) || !is_numeric($row['first'])) {
            continue;
        }
        $n = is_int($key) || (is_string($key) && ctype_digit($key)) ? (int) $key : -1;
        if ($n < 1) {
            continue;
        }
        $out[(string) $n] = [
            'first' => (int) $row['first'],
            'second' => isset($row['second']) && is_numeric($row['second']) ? (int) $row['second'] : 0,
            'third' => isset($row['third']) && is_numeric($row['third']) ? (int) $row['third'] : 0,
            'miss' => isset($row['miss']) && is_numeric($row['miss']) ? (int) $row['miss'] : 0,
        ];
    }
    return $out;
}

function sanitize_progress($value): array
{
    $rec = is_array($value) ? $value : [];
    return [
        'scoreboard' => sanitize_scoreboard($rec['scoreboard'] ?? null),
        'elementStats' => sanitize_stats($rec['elementStats'] ?? null),
        'setup' => sanitize_setup($rec['setup'] ?? null),
    ];
}

function merge_scoreboards(array $a, array $b): array
{
    $byId = [];
    foreach (array_merge($a, $b) as $row) {
        $id = $row['id'];
        if (!isset($byId[$id])) {
            $byId[$id] = $row;
        }
    }
    $rows = array_values($byId);
    usort($rows, static function ($left, $right) {
        return $right['at'] <=> $left['at'];
    });
    return array_slice($rows, 0, SCOREBOARD_MAX);
}

function merge_stats(array $a, array $b): array
{
    $keys = array_unique(array_merge(array_keys($a), array_keys($b)));
    $out = [];
    foreach ($keys as $key) {
        $left = $a[$key] ?? ['first' => 0, 'second' => 0, 'third' => 0, 'miss' => 0];
        $right = $b[$key] ?? ['first' => 0, 'second' => 0, 'third' => 0, 'miss' => 0];
        $row = [
            'first' => max((int) $left['first'], (int) $right['first']),
            'second' => max((int) $left['second'], (int) $right['second']),
            'third' => max((int) $left['third'], (int) $right['third']),
            'miss' => max((int) $left['miss'], (int) $right['miss']),
        ];
        if ($row['first'] === 0 && $row['second'] === 0 && $row['third'] === 0 && $row['miss'] === 0) {
            continue;
        }
        $out[$key] = $row;
    }
    return $out;
}

function merge_progress(array $incoming, array $stored): array
{
    return [
        'scoreboard' => merge_scoreboards($incoming['scoreboard'], $stored['scoreboard']),
        'elementStats' => merge_stats($incoming['elementStats'], $stored['elementStats']),
        'setup' => $incoming['setup'] ?? $stored['setup'],
    ];
}

function empty_progress(): array
{
    return ['scoreboard' => [], 'elementStats' => [], 'setup' => null];
}

function load_usernames(string $file): array
{
    if (!is_file($file)) {
        return [];
    }
    $parsed = json_decode((string) file_get_contents($file), true);
    return is_array($parsed) ? $parsed : [];
}

function add_username(string $file, string $username): void
{
    $namesHandle = fopen($file, 'c+');
    if ($namesHandle === false) {
        return;
    }
    if (!flock($namesHandle, LOCK_EX)) {
        fclose($namesHandle);
        return;
    }
    $contents = stream_get_contents($namesHandle);
    $names = [];
    if (is_string($contents) && $contents !== '') {
        $parsed = json_decode($contents, true);
        if (is_array($parsed)) {
            $names = $parsed;
        }
    }
    if (!in_array($username, $names, true)) {
        $names[] = $username;
        rewind($namesHandle);
        ftruncate($namesHandle, 0);
        fwrite($namesHandle, json_encode(array_values($names)));
        fflush($namesHandle);
    }
    flock($namesHandle, LOCK_UN);
    fclose($namesHandle);
}

function default_state(): array
{
    return ['users' => [], 'tokens' => []];
}

function issue_token(array &$state, string $username): string
{
    $now = time();
    foreach ($state['tokens'] as $existing => $row) {
        if (!is_array($row) || ($row['exp'] ?? 0) < $now) {
            unset($state['tokens'][$existing]);
        }
    }
    $owned = [];
    foreach ($state['tokens'] as $existing => $row) {
        if (($row['user'] ?? '') === $username) {
            $owned[] = $existing;
        }
    }
    if (count($owned) >= 20) {
        unset($state['tokens'][$owned[0]]);
    }
    $token = bin2hex(random_bytes(32));
    $state['tokens'][$token] = ['user' => $username, 'exp' => $now + TOKEN_TTL];
    return $token;
}

function ok(string $token, array $progress): void
{
    echo json_encode(['ok' => true, 'token' => $token, 'progress' => $progress]);
    exit;
}

$accountsFile = dirname(__DIR__, 2) . '/elementra-accounts.json';
$usernamesFile = dirname(__DIR__, 2) . '/elementra-usernames.json';

$handle = fopen($accountsFile, 'c+');
if ($handle === false) {
    fail(503, "Couldn't reach the account server. Try again.", 'network');
}

if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    $handle = null;
    fail(503, "Couldn't reach the account server. Try again.", 'network');
}

$contents = stream_get_contents($handle);
$state = default_state();
if (is_string($contents) && $contents !== '') {
    $parsed = json_decode($contents, true);
    if (is_array($parsed)) {
        $state['users'] = isset($parsed['users']) && is_array($parsed['users']) ? $parsed['users'] : [];
        $state['tokens'] = isset($parsed['tokens']) && is_array($parsed['tokens']) ? $parsed['tokens'] : [];
    }
}

$reserved = load_usernames($usernamesFile);

function user_row(array $state, string $username): ?array
{
    $row = $state['users'][$username] ?? null;
    return is_array($row) ? $row : null;
}

function has_password(?array $row): bool
{
    return is_array($row) && isset($row['hash']) && is_string($row['hash']) && $row['hash'] !== '';
}

function stored_progress(?array $row): array
{
    if (!is_array($row)) {
        return empty_progress();
    }
    return sanitize_progress($row['progress'] ?? null);
}

function save_state($fileHandle, array $state): void
{
    rewind($fileHandle);
    ftruncate($fileHandle, 0);
    fwrite($fileHandle, json_encode($state));
    fflush($fileHandle);
}

try {
    if ($action === 'register') {
        if (!valid_username($username)) {
            fail(400, 'Use 3–24 letters, numbers, or underscores.', 'invalid');
        }
        if (strlen($password) < 6 || strlen($password) > 128) {
            fail(400, 'Password must be at least 6 characters.', 'invalid');
        }
        $row = user_row($state, $username);
        if (has_password($row) || in_array($username, $reserved, true) || $row !== null) {
            fail(409, 'That username is taken.', 'taken');
        }
        $incoming = sanitize_progress($progressIn);
        $state['users'][$username] = [
            'hash' => password_hash($password, PASSWORD_DEFAULT),
            'progress' => $incoming,
        ];
        $issued = issue_token($state, $username);
        save_state($handle, $state);
        add_username($usernamesFile, $username);
        release_lock();
        ok($issued, $incoming);
    }

    if ($action === 'login') {
        if (!valid_username($username) || $password === '') {
            fail(400, 'No account with that name.', 'missing');
        }
        $row = user_row($state, $username);
        if (!has_password($row)) {
            if ($row !== null || in_array($username, $reserved, true)) {
                fail(409, 'Log in on the device you registered first, then you can use other devices.', 'unbound');
            }
            fail(404, 'No account with that name.', 'missing');
        }
        if (!password_verify($password, $row['hash'])) {
            fail(401, 'Wrong password.', 'wrong');
        }
        $issued = issue_token($state, $username);
        $progress = stored_progress($row);
        save_state($handle, $state);
        release_lock();
        ok($issued, $progress);
    }

    if ($action === 'bind') {
        if (!valid_username($username)) {
            fail(400, 'Use 3–24 letters, numbers, or underscores.', 'invalid');
        }
        if (strlen($password) < 6 || strlen($password) > 128) {
            fail(400, 'Password must be at least 6 characters.', 'invalid');
        }
        $row = user_row($state, $username);
        if (has_password($row)) {
            fail(409, 'That username is taken.', 'taken');
        }
        $reservedName = in_array($username, $reserved, true) || $row !== null;
        if (!$reservedName) {
            fail(404, 'No account with that name.', 'missing');
        }
        $incoming = sanitize_progress($progressIn);
        $merged = merge_progress($incoming, stored_progress($row));
        $state['users'][$username] = [
            'hash' => password_hash($password, PASSWORD_DEFAULT),
            'progress' => $merged,
        ];
        $issued = issue_token($state, $username);
        save_state($handle, $state);
        add_username($usernamesFile, $username);
        release_lock();
        ok($issued, $merged);
    }

    if ($action === 'sync') {
        if ($token === '' || !isset($state['tokens'][$token]) || !is_array($state['tokens'][$token])) {
            fail(401, 'Sign in again.', 'auth');
        }
        $row = $state['tokens'][$token];
        if (($row['exp'] ?? 0) < time() || !isset($row['user']) || !is_string($row['user'])) {
            unset($state['tokens'][$token]);
            save_state($handle, $state);
            fail(401, 'Sign in again.', 'auth');
        }
        $who = $row['user'];
        $user = user_row($state, $who);
        if (!has_password($user)) {
            fail(401, 'Sign in again.', 'auth');
        }
        $incoming = sanitize_progress($progressIn);
        $merged = merge_progress($incoming, stored_progress($user));
        $state['users'][$who]['progress'] = $merged;
        $state['tokens'][$token]['exp'] = time() + TOKEN_TTL;
        save_state($handle, $state);
        release_lock();
        ok($token, $merged);
    }

    fail(400, 'Unknown action.', 'invalid');
} catch (Throwable $e) {
    fail(503, "Couldn't reach the account server. Try again.", 'network');
}
