<?php
$type = isset($_GET['type']) ? $_GET['type'] : 'js';
$delay = isset($_GET['delay']) ? $_GET['delay'] : 5;
$contentType = array(
    'js' => 'application/x-javascript',
    'css' => 'text/css',
);

sleep($delay);
header('Content-Type: ' . $contentType[$type] . '; charset=utf-8');
if ($type === 'js') {
    echo 'console.log("aha!");';
} else {
    echo '.aha { color:red; }';
}
