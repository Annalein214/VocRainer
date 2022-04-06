if (localStorage.getItem("lastsync") === null) {
  localStorage.setItem('lastsync',0); // unix time in sec
}

if (localStorage.getItem("lastsyncattempt") === null) {
  localStorage.setItem('lastsyncattempt',0); // unix time in sec
}

// set global timeout for get/post/ajax
$.ajaxSetup({
    timeout: 1000,
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        if (textStatus == 'timeout') {
            console.log("SYNC: Timeout", textStatus, errorThrown);
        } else {
            console.log("SYNC: Some error appeared:", errorThrown);
        }
    }
});

var sy_master = function(){
  // first export, so that data on phone is always dominating in case of a conflict, then import
  // case that 1 entry is edited by server and client not handled
  // delete of word is not handeled
  $("#busy").show(); // terminated at the end of import fct
  /*setTimeout(function(){
    $("#busy").hide();
  }, 1000);*/
  const date=Math.floor(new Date().getTime() / 1000);
  localStorage.setItem('lastsyncattempt',date);
  console.log("SYNC MASTER");
  sy_exportData(sy_importData);
}


var sy_importData = function(lastexport){
  console.log("SYNC: IMPORT");
  let lastsync = localStorage.getItem('lastsync'); 
  // access server database and get all entries after last sync and before last export (few sec ago)
  $.get( "https://annalein.local/~obertacke/php/readsqlite.php?lastsync="+lastsync+"&lastexport="+lastexport, function( data ) {
    // exec when import done or no import needed
    var inline = function(){
      const date=Math.floor(new Date().getTime() / 1000)+1;// plus 1 sec to avoid sync of same data 
      localStorage.setItem('lastsync',date);
      $("#busy").hide();
      alert("Synchronisation complete!");
    } //inline
    // parse input and insert into DB
    const obj = JSON.parse(data);
    var nEntries=obj.length;
    for (var i = 0; i < nEntries; i++) {    
      console.log("SYNC: import",obj[i].fforeign, obj[i].nnative, obj[i].comment, obj[i].lecture, obj[i].tags, obj[i].idb, obj[i].id,obj[i].level);
      if (obj[i].idb==0) var idb = null;
      else var idb = parseInt(obj[i].idb)
      // trigger function execution only for last item which is to store (the rest of the command should be identical)
      var fct=null;
      if (nEntries==i+1) {
        fct=inline;   
      }
      // use regex to prevent a bug with lecture names with space at the end
      // also convert tags string back to array
      var row = {foreign:obj[i].fforeign, 
                 native:obj[i].nnative, 
                 comment:obj[i].comment, 
                 lecture:obj[i].lecture.replace(/\s*$/,''), 
                 tags:obj[i].tags.split(","), 
                 id:idb, 
                 sqlid:obj[i].id, 
                 level:obj[i].level
               };
      db_saveNewWord(fct,row);    
    }
    if (nEntries==0){
      alert("SYNC: Import of data finished. No data found for import.");
      inline();
    }
  }); // get
}

var sy_exportData = function(fct){
  console.log("SYNC EXPORT");
  const lastexport=Math.floor(new Date().getTime() / 1000)-1; // minus 1 sec to avoid sync of same data
  // count successes, required because some exports require several trials
  var i_succeeded = 0;
  // -------------
  // sync data after preparation
  var inline_prepdata = function(res){
    console.log("inline_prepdata");
    // ----
    // main function to send data
    var inline_save = function(row, nEntries, trials){
      console.log("SYNC: EXPORT: sending:", row);
      $.ajax({
        url:"https://annalein.local/~obertacke/php/writesqlite.php",
        type:"POST",
        data:row,
        success: function(data){
          inline_everytime(data, nEntries, trials, row);
        },
        error: function(xhr, status, error) {
          var err = xhr.responseText;
          alert(err, status, error);
          console.log(err, status, error);
          $("#busy").hide();
        }
      })
    } // inline_save
    // ----
    // on success of sending data check real success and maybe re-try
    var inline_everytime = function(data, nEntries, trials, row){
      console.log("EXPORT:", data, nEntries, trials, row);
      trials=trials+1;
      if (data.includes("database is locked")){
        if (trials < 10){
          console.log("SYNC: EXPORT: Try again", trials);
          inline_save(row, nEntries, trials);
        }
        else{
          $("#busy").hide();
          // do not o to import here
          alert("Export did not work. Please try again.");
        }
      }
      else if (data.includes("Warning") || data.includes("Error") || data.includes("fail")){ // stop export if not successfull
          $("#busy").hide();
          // do not o to import here
          alert("Export did not work. Please try again.");
          console.log("EXPORT: ERR:", data, nEntries, trials, row);
      }

      else{
        i_succeeded+=1;
        // check if finished exporting
        if (nEntries == i_succeeded){
          alert("SYNC: Export of data finished.", data);
          //alert("Export of data finished.");
          if (fct) fct(lastexport);
        }
      }
    } // inline_everytime
    // ----
    // go through the entries to sync
    var nEntries=res.length;
    for (var i in res){
      var trials = 0;
      // ajax post does not handle tags well -> convert to string
      var res2={foreign: res[i].foreign, 
              native: res[i].native, 
              tags:res[i].tags.join(","), // --> this is the important change
              lecture:res[i].lecture,
              level:res[i].level,
              lastaccess:res[i].lastaccess,
              comment:res[i].comment,
              id:parseInt(res[i].id), 
              sqlid:parseInt(res[i].sqlid),
            };
      inline_save(res2, nEntries, trials); // to whatever reason i is a string -> make it int
    }
    // nothing to export, then directly go into success function
    if (nEntries==0){
      alert("SYNC: Export of data finished. No data found for export.");
      if (fct) fct(lastexport);
    }

  } // inline_prepdata
  // -------------
  // prepare and choose data
  let lastsync = localStorage.getItem('lastsync');
  db_getAllVoc(inline_prepdata,parseInt(lastsync)+1);
}



// ############################################################################
// import export / import db


var db_cleardb = function(fct=null){
  function clearDatabase(idbDatabase, cb) {
    const objectStoreNamesSet = new Set(idbDatabase.objectStoreNames);
    const size = objectStoreNamesSet.size;
    if (size === 0) {
      cb(null);
    } else {
      const objectStoreNames = Array.from(objectStoreNamesSet);
      const transaction = idbDatabase.transaction(
          objectStoreNames,
          'readwrite'
      );
      transaction.onerror = (event) => cb(event);

      let count = 0;
      objectStoreNames.forEach(function(storeName) {
        transaction.objectStore(storeName).clear().onsuccess = () => {
          count++;
          if (count === size) {
            // cleared all object stores
            cb(null);
          }
        };
      });
    }
  }

  clearDatabase(theDB, function(err) {
    if (!err){
      console.log("DB: Database emptied.")
      localStorage.setItem('lastsync',0); // triggers full sync next time
      alert("Database emptied.")
      if (fct) {fct();};
    };
  });

}

var db_deleteDB = function(){
  window.indexedDB.databases().then((r) => {
    for (var i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
  }).then(() => {
      localStorage.setItem('lastsync',0); // triggers full sync next time
      alert('All data cleared.');
  });
}

// ----------------------------------------------------------------------------

var db_fillExamples = function(){
  console.log("Fill database");
  // fct,foreign, 
  // native, comment, 
  // lecture, tags
  db_saveNewWord(null,{foreign:"tomodachi", native:"Freund", comment:"beide Geschlechter", lecture:"1", tags:"Personen", id:null, sqlid:null});
  db_saveNewWord(null,{foreign:"kyoo", native:"heute", comment:"-", lecture:"5", tags:"Zeitangabe", id:null, sqlid:null});
  db_saveNewWord(null,{foreign:"Sayonara", native:"Auf Wiedersehen!", comment:"-", lecture:"1", tags:['Test2', 'Test3'], id:null, sqlid:null});
  console.log("Filled database");
}



