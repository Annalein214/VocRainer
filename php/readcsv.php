<?php

/*
USAGE: delete old tables
set csv name, tablename, table dir

table dir in extra folder with 
$ chown _www folder

csv: komma separated list, there are issues when there is a comma inside a value!
*/

$filename = '/Users/obertacke/Sites/db/WokabolaryImp.csv';

// The nested array to hold all the arrays
$the_big_array = []; 

// Open the file for reading
if (($h = fopen("{$filename}", "r")) !== FALSE) 
{
  // Each line in the file is converted into an individual array that we call $data
  // The items of the array are comma separated
  while (($data = fgetcsv($h, 1000, ",")) !== FALSE) 
  {
    // Each individual array is being pushed into the nested array
    $the_big_array[] = $data;		
  }

  // Close the file
  fclose($h);
}

// ##########################################################

$tablename='/Users/obertacke/Sites/db/vocabulary.sqlite';
$db = new SQLite3($tablename);
// WAL mode has better control over concurrency.
// Source: https://www.sqlite.org/wal.html
$db->exec('PRAGMA journal_mode = wal;');
$db->busyTimeout(1000);
$lastaccess=time();

$db->exec("CREATE TABLE vocabulary(id INTEGER PRIMARY KEY, fforeign TEXT, nnative TEXT, comment TEXT,level INT,lastaccess INT, lecture TEXT,tags TEXT, idb INT)");

foreach ($the_big_array as &$row) {
	var_dump($row);	echo "<br />";
	$db->exec("INSERT INTO vocabulary(fforeign, nnative, comment, level, lastaccess, lecture, tags, idb) VALUES('$row[0]', '$row[1]', '$row[2]', 0, $lastaccess, '$row[3]', '', 0)");
	}

  $db->close();
  unset($db);

?>