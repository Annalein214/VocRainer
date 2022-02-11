<?php
/*
http://annalein.local/~obertacke/php/readsqlite.php?lastsync=1644268406&lastexport=1644268506

wraps all data not lately synced into a json string and displays that
*/

$lastsync=$_GET['lastsync'];
$lastexport=$_GET['lastexport']; // avoid import of data which was just exported!

$the_big_array = []; 

$tablename='/Users/obertacke/Sites/db/vocabulary.sqlite';

$db = new SQLite3($tablename);
// WAL mode has better control over concurrency.
// Source: https://www.sqlite.org/wal.html
$db->exec('PRAGMA journal_mode = wal;');
$db->busyTimeout(1000);

$res = $db->query('SELECT * FROM vocabulary'); // todo  LIMIT 10

while ($row = $res->fetchArray()) {
    if ($row["lastaccess"]>$lastsync && $row["lastaccess"]<$lastexport){
      $the_big_array[] = $row;
      //$js=json_encode($row, JSON_UNESCAPED_UNICODE);
      //echo "{$js}";
    }
}

$js=json_encode($the_big_array, JSON_UNESCAPED_UNICODE); // keep kana original
echo "{$js}";

$db->close();
unset($db);

?>