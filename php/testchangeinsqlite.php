<?php
// http://annalein.local/~obertacke/php/testchangeinsqlite.php

    $tablename='/Users/obertacke/Sites/db/vocabulary.sqlite';
    $db = new SQLite3($tablename);
    // WAL mode has better control over concurrency.
    // Source: https://www.sqlite.org/wal.html
    $db->exec('PRAGMA journal_mode = wal;');
    $db->busyTimeout(1000);
    $lastaccess=time();

    // fforeign TEXT, nnative TEXT, comment TEXT,level INT,lastaccess INT, lecture TEXT,tags TEXT, idb INT
    $db->exec("UPDATE vocabulary SET nnative='testchangesqlite', lastaccess=$lastaccess WHERE id=1");

    $db->close();
    unset($db);

    echo "TESTCANGESQLITE: Success";
?>
