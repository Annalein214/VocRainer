<?php
  if(isset($_POST['id'])) {
    $json = $_POST;

    
    echo $_POST['id']; echo " ";
    echo $_POST["foreign"];echo " ";
    echo $_POST["native"];echo " ";
    echo $_POST["comment"];echo " ";
    echo intval($_POST["level"]);echo " ";
    echo $lastaccess;echo " ";
    echo $_POST["lecture"];echo " ";
    echo $_POST["tags"];echo " ";
    echo ".".intval($_POST['id']).".";
    

    $sid=intval($_POST['sqlid']);
    echo ".".$sid.".";
    $fo=$_POST["foreign"];
    $na=$_POST["native"];
    $co= $_POST["comment"];
    $le= intval($_POST["level"]);
    $lc= $_POST["lecture"];
    $ta= $_POST["tags"];
    $id= intval($_POST['id']);

    $tablename='/Users/obertacke/Sites/db/vocabulary.sqlite';
    $db = new SQLite3($tablename);
    // WAL mode has better control over concurrency.
    // Source: https://www.sqlite.org/wal.html
    $db->exec('PRAGMA journal_mode = wal;');
    $db->busyTimeout(1000);
    $lastaccess=time();

    // fforeign TEXT, nnative TEXT, comment TEXT,level INT,lastaccess INT, lecture TEXT,tags TEXT, idb INT
    $db->exec("INSERT OR REPLACE INTO vocabulary(id, fforeign, nnative, comment, level, lastaccess, lecture, tags, idb) VALUES($sid, '$fo', '$na', '$co', $le, $lastaccess, '$lc', '$ta', $id)");

    $db->close();
    unset($db);

    echo "WRITESQLITE: Success";

  } else {
    echo "WRITESQLITE: ERROR: no data received";
  }
?>
