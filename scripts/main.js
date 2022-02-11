var loadpage_home = function(){
    /*
    re-load main landing page
    */
    $('div[data-role="header"] h1').text("VocRainer");
    $('div[role="main"]').append("<p>The Home with good News.</p>");
    
}

// ----------------------------------------------------------------------------


var loadpage_statistics = function(){
    $('div[data-role="header"] h1').text("Statistics");
    $('div[role="main"]').append("<p>Lectures:</p>");
    $('div[role="main"]').append("<p>Words:</p>");
    $('div[role="main"]').append("<p>Learned over time: Percentage of words with full level compared to all words</p>");
    
}

// ----------------------------------------------------------------------------


var loadpage_settings = function(){
    $('div[data-role="header"] h1').text("Settings");
    
    $('div[role="main"]').append('<a id="exportsync" href="#" class="ui-btn ui-corner-all ui-btn-inline">Sync Database</a><br /><br /><br />');
    $('div[role="main"]').append('Only for developers:<br />');
    $('div[role="main"]').append('<a id="emptydb" href="#" class="ui-btn ui-corner-all ui-btn-inline">Delete DB</a><br />');
    $('div[role="main"]').append('<a id="quizemptytable" href="#" class="ui-btn ui-corner-all ui-btn-inline">Empty Quiz Tbl</a><br />');
    
    $('#emptydb').click(function(event){            
        //db_cleardb(); 
        db_deleteDB();       
    });
    $('#exportsync').click(function(event){            
        sy_master();        
    });
    $('#quizemptytable').click(function(event){            
        db_emptyQuizTable();        
    }); 
}



var loadpage_words = function(lecture){
    $('div[data-role="header"] h1').text("Lecture "+lecture);
    $('div[data-role="header"] a[name="left"]').text("Back").show().unbind( "click" ).click(function(event){            
        loadpage("vocabulary");
    });
    $('div[data-role="header"] a[name="right"]').text("Add").show().unbind( "click" ).click(function(event){            
        loadpage("newword", [lecture, null]);
    });

    $('div[role="main"]').append('<ul data-role="listview" data-filter="true" data-filter-placeholder="Search ..." data-filter-reveal="true"  data-inset="true"></ul>');

    // let the list show up:
    $('div[role="main"] ul').listview().listview("refresh"); 

    var inline = function(res){
        /*
        process the data retrieved from database, here: unique lecture names
        */
        for (var i in res){
            $('div[role="main"] ul').append("<li><a href='#' name="+res[i].id+">"+res[i].foreign+"</a></li>");
        }
        // let the list show up:
        $('div[role="main"] ul').listview().listview("refresh"); 
        $('div[role="main"] ul li a').unbind( "click" ).click(function(event){            
            loadpage("newword",[lecture, event.target.name]);
        });
    };

    db_getWordsOfLecture(lecture, inline);

}

// ----------------------------------------------------------------------------


var loadpage_voc=function(){
    /*
    load the landing page to look up all vocabulary entries
    TODO: add tab, to sort tags instead of lectures
    */
    $('div[data-role="header"] h1').text("Lectures");

    $('div[data-role="header"] a[name="right"]').text("Add").show().unbind( "click" ).click(function(event){            
        loadpage("newword", ["", null]);
    });

    $('div[role="main"]').append('<ul data-role="listview" data-filter="true" data-filter-placeholder="Search ..." data-filter-reveal="true"  data-inset="true"></ul>');

    var inline = function(res){
        /*
        process the data retrieved from database, here: unique lecture names
        */
        for (var i in res){
            $('div[role="main"] ul').append("<li><a href='#' name="+res[i]+">"+res[i]+"</a></li>");
        }
        // let the list show up:
        $('div[role="main"] ul').listview().listview("refresh"); //$('div[role="main"]').trigger("create"); //$('div[role="main"]').enhanceWithin();// TODO search function
        // add events
        $('div[role="main"] ul li a').unbind( "click" ).click(function(event){            
            loadpage("words",event.target.name);
        });
    };

    db_getAllLectures(inline);
}

// ----------------------------------------------------------------------------


var loadpage_newword = function(data){
    /*
    data = [lecture, id] = ["", null]
    if applicable load data from one word with "id", otherwise produce empty strings
    display form (incl. data)
    save data or cancel and show previous page (currently lectures) again
    */

    // ----- adjust header ------------------------------
    $('div[data-role="header"] a[name="left"]').text("Cancel").show().unbind( "click" ).click(function(event){  
            if (lecture=="") loadpage("vocabulary");
            else loadpage("words",lecture);
    });
    
    // the following does not need to be in success function, only executed when clicked.
    var inline_afterSaveWord = function(){
        if (id == null) loadpage("newword", [lecture, null]);
        else {
            if (lecture=="") loadpage("vocabulary");
            else loadpage("words",lecture);
        }
    }
    $('div[data-role="header"] a[name="right"]').text("Save").show().unbind( "click" ).click(function(event){            
            //save
            // need to readout values which the user adjusted, other variables are ok, eg. id&sqlid
            foreign=$('#addword textarea[name="foreign"]').val();
            native=$('#addword textarea[name="native"]').val();
            comment=$('#addword textarea[name="comment"]').val();
            lecture=$('#addword select[name="lecture"]').val();
            if (lecture=="add_new_lecture"){
                lecture=$('#newlecture input').val();
            }
            tags=[];
            $(':checkbox').each(function() {
                if (this.checked){
                    console.log("THIS", this.name);
                    tags.push(this.name);
                }
            });
            var extratags=$('#addword input[name="newtag"]').val();

            if (extratags!="") {
                var ext = extratags.split(',');
                console.log("EXT", ext);
                for (var k in ext){
                    tags.push(ext[k]);
                }
            }
            console.log("THETAGS", tags);
            console.log("MAIN: NEWWORD: Save "+foreign+" "+native+" "+lecture+" "+tags+" "+comment);
            var row = {foreign:foreign, native:native, comment:comment, lecture:lecture, tags:tags, id:id, sqlid:sqlid};
            db_saveNewWord(inline_afterSaveWord,row);
            
    });

    // ----- build basic form ------------------------------
    theform='<form id="addword">';
    theform+='<label for="foreign">Foreign word:</label><textarea name="foreign" lang="ja" rows="4" cols="16"></textarea>';
    theform+='<label for="native">Native translation:</label><textarea name="native" lang="de" rows="4" cols="20"></textarea>';
    theform+='<label for="comment">Comment:</label><textarea name="comment" rows="4" cols="20"></textarea>';
    theform+='<label for="lecture">Lecture:</label><select name="lecture"><option value="add_new_lecture">Add new lecture ...</option></select>';
    theform+='<div id="newlecture" style="display:none"><label for="newlecture">New Lecture Name:</label><input type="text" name="newlecture"></input></div>';
    theform+='<fieldset data-role="controlgroup" id="tags"><legend>Tags:</legend></fieldset>';
    theform+='<label for="newtag">New tags (separated by ","):</label><input type="text" name="newtag"></input></div>';
    theform+='</form>';
    $('div[role="main"]').append(theform);

    // ----- fill form with data (empty or not) ---------------
    // textareas
    var lecture = data[0];
    var id = data[1];
    var foreign = "";
    var native="";
    var comment="";
    var tags=[]; 
    var sqlid=0;
    if (id == null){
        $('div[data-role="header"] h1').text("Add new word");
        $('#addword textarea[name="foreign"]').val(foreign);
        $('#addword textarea[name="native"]').val(native);
        $('#addword textarea[name="comment"]').val(comment);
    }
    else{
        $('div[data-role="header"] h1').text("Edit word");
        var inline_getWord = function(res){
            foreign=res.foreign;
            native=res.native;
            comment=res.comment;
            tags=res.tags; 
            if (typeof tags == "string") tags = [tags]; // make sure you are working with an array
            sqlid=res.sqlid;

            $('#addword textarea[name="foreign"]').val(foreign);
            $('#addword textarea[name="native"]').val(native);
            $('#addword textarea[name="comment"]').val(comment);
        }
        db_getWord(inline_getWord, id);
    }
    
    // lectures
    var inline_fillLecture = function(res){
        // fill entries with lecture names
        for (var i in res){
            $('#addword select[name="lecture"]').append('<option value="'+res[i]+'">'+res[i]+'</option>');
        }
        // if possible preselect lecture
        if (lecture!="") $('#addword select[name="lecture"]').val(lecture).change();
        // add text field for new lecture names if needed
        $('#addword select[name="lecture"]').on('change',function(event){
            if (this.value=="add_new_lecture"){
                $('#newlecture').show();
            };
        });

    };
    db_getAllLectures(inline_fillLecture);

    // tags
    var inline_fillTags = function(res){
        console.log("TAGS", tags);
        for (var i in res){
            if (res[i]!="")
                $('#tags').append('<input type="checkbox" name="'+res[i]+'"><label for="'+res[i]+'">'+res[i]+'</label>');
        }
        if (tags!=null){
            for (var i in tags){
                $('#tags input[name="'+tags[i]+'"]').prop('checked', true);
            }

        }
    }
    db_getAllTags(inline_fillTags);
}

// ----------------------------------------------------------------------------

var loadpage = function(name, data=null){
    /*
    Handler to load full pages
    the unique name defines which page is to be loaded
    mainly used by the navbar in footer
    TODO: slider for voc->words
    */

    console.log("MAIN: Loadpage: Name:"+name+" Data:",data);

    // first empty the page
    $('div[role="main"]').empty();
    // header cannot be removed+added, only manipulated
    $('div[data-role="header"] a[name="left"]').hide();
    $('div[data-role="header"] a[name="right"]').hide();

    // load new page
    switch (name){
        case "quiz":
            loadpage_quizstart();
            break;
        case "quizword":
            loadpage_quizword();
            break;
        case "quizsummary":
            loadpage_quizsummary();
            break
        case "vocabulary":
            loadpage_voc();
            break;
        case "words":
            loadpage_words(data);
            break;
        case "newword":
            loadpage_newword(data);
            break;
        case "settings":
            loadpage_settings();
            break
        case "statistics":
            loadpage_statistics();
            break
        case "home":
        default:
            loadpage_home();
            break;
    }
}


// ############################################################################

// require that all content is loaded
$( window ).on( "load", function() {
    console.log( "MAIN: Window loaded" ); 
    
    // require that database is loaded
    requestDB.onsuccess = function () {
        console.log("MAIN: Database opened successfully");
        theDB = requestDB.result;

        // ---------------------------
        // here comes the real code
        
        //db_test()



        // footer
        $('div[data-role="footer"] a').click(function(event){            
            loadpage(event.target.name);
        });

        loadpage();
        
        
        
        


        // ---------------------------
        // the end, clean up
        //theDB.close(); // close db not here!! TODO where?
    }
}); // window loaded