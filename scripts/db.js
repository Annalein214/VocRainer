// ############################################################################
// boot

var theDB;
var DBNAME="Vocabulary"; // indexedDB.deleteDatabase('Vocabulary');
var VOCNAME="Vocabulary";
var QUIZNAME="Quiz"

// search db in different browsers
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

if (!indexedDB) {
  console.log("DB: IndexedDB could not be found in this browser.");
}

// workaround safari bug to sometimes not open db without complaints
// https://bugs.webkit.org/show_bug.cgi?id=226547
// if does not work try to comment out the second line
indexedDB.deleteDatabase('dummy-database');


var requestDB;

// workaround: put open in to a function with 1sec delay. But issue is that now I cannot require db to be loaded before the page is loaded
var db_open = function (argument) {
  // open database, version needs to be updated if scheme of db is changed
  requestDB= indexedDB.open(DBNAME, 6);
  // db does not need to be closed explicitly anywhere

  // require that database is loaded
    requestDB.onsuccess = function () {
        console.log("MAIN: Database opened successfully");
        theDB = requestDB.result;


    }

    // event handlers
  requestDB.onerror = function (event) {
    console.error("DB: An error occurred with IndexedDB:" + event.target.errorCode);
    console.error(event);
  };

  requestDB.onblocked = function(event){
    console.log("DB: blocked", event);
  }

  requestDB.onversionchange = function(event){
    // https://www.nerd.vision/post/how-we-solved-a-case-where-indexeddb-did-not-connect
    // solving bug that sometimes db does not open without giving an error
    console.log("DB: onversionchange", event);
    db.close();
  }

  requestDB.onupgradeneeded = function () {
    // result of request is db itself
    theDB = requestDB.result;

    // ---- main table of vocabulary
    // db works with object stores, these are tables in SQL, keypath is identifier field (unique number)
    const store = theDB.createObjectStore(VOCNAME, { keyPath: "id", autoIncrement: true});
    // simplyfies search, then not only by keypath
    store.createIndex("foreign_word", ["foreign"], { unique: false });
    store.createIndex("native_word", ["native"], { unique: false });
    store.createIndex("comment", ["comment"], { unique: false });
    store.createIndex("level", ["level"], { unique: false });
    store.createIndex("lastaccess", ["lastaccess"], { unique: false });
    store.createIndex("lecture", ["lecture"], { unique: false });
    store.createIndex("sqlid", ["sqlid"], { unique: true });
    store.createIndex("tags", "tags", {multiEntry: true}); // https://stackoverflow.com/questions/9351695/documents-with-tags-model-in-indexeddb
    // compoung indices
    //store.createIndex("colour_and_make", ["colour", "make"], {unique: false,}); 

    // ---- table used for quiz
    const store_quiz = theDB.createObjectStore(QUIZNAME, { keyPath: "id"}); // copy of id from main table
    store_quiz.createIndex("foreign_word", ["foreign"], { unique: false });
    store_quiz.createIndex("native_word", ["native"], { unique: false });
    store_quiz.createIndex("comment", ["comment"], { unique: false });
    store_quiz.createIndex("sublevel", ["sublevel"], { unique: false }); // not identical with main table
    store_quiz.createIndex("sublastaccess", ["sublastaccess"], { unique: false }); // not identical with main table
    // do not need: lecture, sqlid, tags, main level, main accessdate
  };
}
setTimeout(db_open, 1000);






// ############################################################################
// functions

// ----------------------------------------------------------------------------


var db_getAllLectures = function(fct, returnNWords){
  console.log("DB: db_getAllLectures");
  var result = [];
  var resultnWords = [];
  var i_success = 0;

  var inline_getNWords = function(lecture, nEntries){
    const transaction = theDB.transaction([VOCNAME], "readonly");
    const store = transaction.objectStore(VOCNAME);
    var request = store.index('lecture');
    const query = request.getAll(lecture);

    query.onerror = function(event) {
       console.err("DB: GETALLLECTURES: GETNWORDS: error fetching data");
    };

    query.onsuccess = function() {
      i_success+=1;
      //console.log([lecture, query.result.length], i_success);
      resultnWords.push([lecture, query.result.length]);
      if (i_success==nEntries) {if (fct) fct(resultnWords);}
    }
  }

  const transaction = theDB.transaction([VOCNAME], "readonly");
  const store = transaction.objectStore(VOCNAME);
  var request = store.index('lecture').openCursor(null,"nextunique");

  request.onerror = function(event) {
     console.log("DB: GETALLLECTURES: Error fetching data, might be empty.");
  };

  // collect data // TODO change if long list expected
  request.onsuccess = function(event) {
     let cursor = event.target.result;
     if (cursor) {
         //let key = cursor.primaryKey;
         let value = cursor.value;
         result.push(value.lecture);
         cursor.continue();
     }
     else {
         // no more results 
         // return to function
         if (!returnNWords) {if (fct) fct(result);}
         else {
           // get nWords too
           
           var nresults=result.length;
           for (var i in result){
            inline_getNWords(result[i],nresults);
           }
         }
     }
  };
}

// ----------------------------------------------------------------------------


var db_getAllTags = function(fct, returnNWords){
  console.log("DB: GetAllTags");
  var result = [];
  var resultnWords = [];
  var i_success = 0;

  var inline_getNWords = function(tag, nEntries){
    const transaction = theDB.transaction([VOCNAME], "readonly");
    const store = transaction.objectStore(VOCNAME);
    var request = store.index('tags');
    const query = request.getAll(tag);

    query.onerror = function(event) {
       console.err("DB: GETALLLECTURES: GETNWORDS: error fetching data");
    };

    query.onsuccess = function() {
      i_success+=1;
      //console.log([tag, query.result.length], i_success);
      resultnWords.push([tag, query.result.length]);
      if (i_success==nEntries) {if (fct) fct(resultnWords);}
    }
  }

  const transaction = theDB.transaction([VOCNAME], "readonly");
  const store = transaction.objectStore(VOCNAME);
  var request = store.index('tags').openCursor(null,"nextunique");

  request.onerror = function(event) {
     console.err("error fetching data");
  };

  // collect data // TODO change if long list expected
  request.onsuccess = function(event) {
     let cursor = event.target.result;
     if (cursor) {
         //let key = cursor.primaryKey;
         let value = cursor.value;
         result.push(value.tags);
         cursor.continue();
     }
     else {
         // no more results
         // make unique, even if array
         var unique = [];
         for (var i in result){
            var type=typeof result[i];
            if (type == "string") {
              if (!unique.includes(result[i])){
                    unique.push(result[i]);
              }
            }
            else { // type = object
                for (var j in result[i]){
                  if (!unique.includes(result[i][j])){
                    unique.push(result[i][j]);
                  }
                }
            }

            
         }
         if (!returnNWords){
          if (fct) fct(unique.sort());
        }
        else {
           // get nWords too
           
           var nresults=unique.length;
           for (var i in unique){
            inline_getNWords(unique[i],nresults);
           }
         }
     }
  };
}

// ----------------------------------------------------------------------------


var db_getWord = function(fct, id){
  //console.log("DB: db_getWord: id:",id);

  const transaction = theDB.transaction([VOCNAME], "readonly");
  const store = transaction.objectStore(VOCNAME);
  const query = store.get(parseInt(id));

  query.onerror = function(event) {
     console.err("error fetching data");
  };

  // collect data // TODO change if long list expected
  query.onsuccess = function() {
    //console.log("DB: db_getWord:",query.result);
    if (fct) fct(query.result);
  }
}

// ----------------------------------------------------------------------------

var db_deleteWord = function(fct, id){
  console.log("DB: db_deleteWord: id:",id);

  const transaction = theDB.transaction([VOCNAME], "readwrite");
  const store = transaction.objectStore(VOCNAME);
  const query = store.delete(parseInt(id));

  query.onerror = function(event) {
     console.err("error fetching data");
  };

  // collect data // TODO change if long list expected
  query.onsuccess = function() {
    console.log("DB: db_deleteWord:",query.result);
    if (fct) fct(query.result);
  }
}



// ----------------------------------------------------------------------------

var db_getWordsOfLecAndTag = function(lectures, tags,nWords,fct, sortby=null){
  console.log("Mache nix");
  // maybe use nWords??

  const transaction = theDB.transaction([VOCNAME], "readonly");
  const store = transaction.objectStore(VOCNAME);
  var request = store.index('lastaccess').openCursor();
  
  var result = [];
  var countWords=0;
  //store.openCursor(keyRangeValue).onsuccess = function(event) {
  request.onsuccess = function(event) {
    var cursor = event.target.result;

    
    if(cursor) {
      let value = cursor.value;
      if (lectures.includes(value.lecture)) {
        result.push(value);
        countWords+=1;
      }
      else {
        // go through tags of word
        for (var i in value.tags){
          if (tags.includes(value.tags[i])) {
            result.push(value);
            countWords+=1;
            continue;
          }
        }
      }
      if (countWords==nWords){
        console.log("DB: db_getAllVoc", result);
        if (fct) fct(result);
        // do not continue with cursor
      }
      else cursor.continue();
    } else {
      // if you are here, fewer words than requested were found
      console.log("DB: db_getAllVoc", result);
      if (fct) fct(result);
    }
  };


}
var db_getWordsOfLecture = function(lecture,fct, sortby=null){

  const transaction = theDB.transaction([VOCNAME], "readonly");
  const store = transaction.objectStore(VOCNAME);
  const index = store.index("lecture"); // you cannot use "id" here
  const query = index.getAll(lecture);

  query.onerror = function(event) {
     console.err("error fetching data");
  };

  // collect data // TODO change if long list expected
  query.onsuccess = function() {
    //console.log(query.result);
    
    if (!sortby) { if (fct) fct(query.result);}
    else{
      var ret=[];
      for (var i in query.result){
        //if (sortby=="lastaccess") 
        ret.push([query.result[i].lastaccess,query.result[i]])
      }
      // sort by first column (for second use 1 instead of 0 as index)
      ret = ret.sort(function(a,b){
        return a[0]-b[0];
      });
      // return only second column, i.e. the full rows of the table in order
      if (fct) fct(ret.map(function(value, index){return value[1]}));
    } // else sortby
  } // query.onsuccess
}

// ----------------------------------------------------------------------------


var db_getWordsOfTag = function(tag,fct, sortby=null){
  console.log("DB: db_getWordsOfTag");

  const transaction = theDB.transaction([VOCNAME], "readonly");
  const store = transaction.objectStore(VOCNAME);
  const index = store.index("tags"); // you cannot use "id" here
  const query = index.getAll(tag);

  query.onerror = function(event) {
     console.err("error fetching data");
  };

  // collect data // TODO change if long list expected
  query.onsuccess = function() {
    //console.log(query.result);
    
    if (!sortby) { if (fct) fct(query.result);}
    else{
      var ret=[];
      for (var i in query.result){
        //if (sortby=="lastaccess") 
        ret.push([query.result[i].lastaccess,query.result[i]])
      }
      // sort by first column (for second use 1 instead of 0 as index)
      ret = ret.sort(function(a,b){
        return a[0]-b[0];
      });
      // return only second column, i.e. the full rows of the table in order
      if (fct) fct(ret.map(function(value, index){return value[1]}));
    } // else sortby
  } // query.onsuccess
}
// ----------------------------------------------------------------------------


var db_getAllVoc = function(fct, lowerbound){
  console.log("DB: DB_GEGTALLVOC: Find elements younger than", lowerbound);

  var keyRangeValue = IDBKeyRange.lowerBound(lowerbound);

  const transaction = theDB.transaction([VOCNAME], "readonly");
  const store = transaction.objectStore(VOCNAME);
  var request = store.index('lastaccess').openCursor(keyRangeValue);
  
  var result = [];
  //store.openCursor(keyRangeValue).onsuccess = function(event) {
  request.onsuccess = function(event) {
    var cursor = event.target.result;

    
    if(cursor) {
      let value = cursor.value;
      result.push(value);
      cursor.continue();
    } else {
      console.log("DB: db_getAllVoc", result);
      if (fct) fct(result);
    }
  };
}

// ----------------------------------------------------------------------------

var db_saveNewWord = function(fct,row){
  // row must contain: foreign, native, comment, lecture, tags, id=null, sqlid=null

  // operations are called transactions, they either all succeed or all fail
  const transaction = theDB.transaction([VOCNAME], "readwrite");
  // reference to object store
  const store = transaction.objectStore(VOCNAME);
  const date=Math.floor(new Date().getTime() / 1000); // different date: '2012.08.10'
  if (row.sqlid==null) sqlid=0;
  // add data or update
  if (row.id==null){
    store.put({foreign: row.foreign, native: row.native, tags:row.tags, 
               lecture:row.lecture,level:row.level,lastaccess:date, comment:row.comment,sqlid:parseInt(row.sqlid)});
  }
  else{
    store.put({foreign: row.foreign, native: row.native, tags:row.tags, 
               lecture:row.lecture,level:row.level,lastaccess:date,comment:row.comment,id:parseInt(row.id), sqlid:parseInt(row.sqlid)});
  }
  // close connection
  transaction.oncomplete = function () {

    console.log("DB: Stored new data");
    if (fct) {fct();};
  };
  transaction.onerror = function (event) {
    console.error("DB: db_saveNewWord: An error occurred with transaction:" + event.target.errorCode);
    console.error(event);
  };
}

// ----------------------------------------------------------------------------
// Quiz stuff
// ----------------------------------------------------------------------------



var db_saveQuizWord = function(fct,row, level=0){
  // id is identical with main table

  const transaction = theDB.transaction([QUIZNAME], "readwrite");
  const store = transaction.objectStore(QUIZNAME);
  const date=Math.floor(new Date().getTime() / 1000); // different date: '2012.08.10'

  store.put({id:row.id,foreign: row.foreign, native: row.native, comment:row.comment,
            sublevel:level,sublastaccess:date});

  transaction.oncomplete = function () {
    console.log("DB: QUIZ: Stored new data");
    if (fct) {fct();};
  };
  transaction.onerror = function (event) {
    console.error("DB: db_saveQuizWord: An error occurred with transaction:" + event.target.errorCode);
    console.error(event);
  };
}

var db_emptyQuizTable = function (fct){
  const transaction = theDB.transaction([QUIZNAME], "readwrite");
  const store = transaction.objectStore(QUIZNAME);
  var request = store.clear();
  request.onsuccess = function(event){
    console.log("DB: QUIZ: Table emptied")
    if (fct) fct();
  }
}

var db_deleteQuizWord = function(fct, id){
  console.log("DB: db_deleteQuizWord: id:",id);

  const transaction = theDB.transaction([QUIZNAME], "readwrite");
  const store = transaction.objectStore(QUIZNAME);
  const query = store.delete(parseInt(id));

  query.onerror = function(event) {
     console.err("error fetching data");
  };

  // collect data // TODO change if long list expected
  query.onsuccess = function() {
    //console.log("DB: db_getWord:",query.result);
    if (fct) fct(query.result);
  }
}

