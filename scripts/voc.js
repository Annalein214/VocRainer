var loadpage_voc=function(data){
    /*
    data=[showTags]=[false]
    load the landing page to look up all vocabulary entries
    */

    var showTags=null;
    if (data) showTags=data[0];
    $('div[data-role="header"] h1').text("Vocabulary");

    $('div[data-role="header"] a[name="left"]').text("Search").show().unbind( "click" ).click(function(event){            
        loadpage("search");
    });
    $('div[data-role="header"] a[name="right"]').text("Add").show().unbind( "click" ).click(function(event){            
        loadpage("newword", ["", null, false, ""]);
    });


    // the tabbar, adjust so that if you come back from tabs, the tab button is highlighted
    var tabbar="";
    //
    tabbar+='<a id="showTags" href="#" style="float:right; margin-right:0px" class="ui-btn ui-corner-all ui-btn-inline icon_btn_half ';
    if (showTags) tabbar+='cs_highl_btn';
    tabbar+='">Tags</a>';
    //
    tabbar+='<a id="showLectures" href="#" class="ui-btn ui-corner-all ui-btn-inline icon_btn_half '; // space at the end is important!
    if (!showTags) tabbar+='cs_highl_btn';
    tabbar+='">Lectures</a>';
    //
    $('div[role="main"]').append(tabbar);

    

    // --- Lectures  

    var il_populateLect = function(res){
        // process the data retrieved from database, here: unique lecture names
        for (var i in res){
            // res = [name, nWords, avgLevel]
            $('div[role="main"] ul').append('<li><a href="#" name="'+res[i][0]+'">'+
                                                '<p style="float:right">'+res[i][1]+'</p>'+
                                                '<p class="truncate_wide" style="float:left">'+res[i][0]+'</p>'+
                                                '<p>⦰ '+res[i][2].toFixed(1)+'</p>'+
                                            '</a></li>');
        }
        // let the list show up:
        $('div[role="main"] ul').listview().listview("refresh"); //$('div[role="main"]').trigger("create"); //$('div[role="main"]').enhanceWithin();// TODO search function
        // add events
        $('div[role="main"] ul li a').unbind( "click" ).click(function(event){            
            loadpage("words",[$(this).attr('name'), null]);
        });
    };

    var il_showLectures = function() {
        $('div[role="main"]').append('<ul id="listOfLectures" data-role="listview" data-filter="true" data-filter-placeholder="Search ..." data-filter-reveal="true"  data-inset="true"></ul>');
        db_getAllLectures(il_populateLect, true, true); // fct, return_nWords, return_AvgLevel
    }

    $('#showLectures').click(function(event) {
        console.log("MAIN: voc: show tags");
        if (!$('#showLectures').hasClass()) { // was not activated before
            $('#showLectures').addClass('cs_highl_btn');
            $('#showTags').removeClass('cs_highl_btn');
            $('#listOfTags').remove();
            il_showLectures();
        };
    });

    

    // --- Tags  

    var il_populateTag = function(res){
        // process the data retrieved from database, here: unique lecture names
        for (var i in res){
            if (res[i][0]!="") {
                // res = [name, nWords, avgLevel]
                $('div[role="main"] ul').append('<li><a href="#" name="'+res[i][0]+'">'+
                                                '<p style="float:right">'+res[i][1]+'</p>'+
                                                '<p class="truncate_wide" style="float:left">'+res[i][0]+'</p>'+
                                                '<p>⦰ '+res[i][2].toFixed(1)+'</p>'+
                                            '</a></li>');
            }
        }
        // let the list show up:
        $('div[role="main"] ul').listview().listview("refresh"); //$('div[role="main"]').trigger("create"); //$('div[role="main"]').enhanceWithin();// TODO search function
        // add events
        $('div[role="main"] ul li a').unbind( "click" ).click(function(event){            
            loadpage("words",[null, $(this).attr('name')]);
        });
    };

    var il_showTags = function() {
        $('div[role="main"]').append('<ul id="listOfTags" data-role="listview" data-filter="true" data-filter-placeholder="Search ..." data-filter-reveal="true"  data-inset="true"></ul>');
        db_getAllTags(il_populateTag, true, true); // fct, return_nWords, return_AvgLevel
    }


    $('#showTags').click(function(event) {
        console.log("MAIN: voc: show tags");
        if (!$('#showTags').hasClass()) { // was not activated before
            $('#showTags').addClass('cs_highl_btn');
            $('#listOfLectures').remove();
            $('#showLectures').removeClass('cs_highl_btn');

            il_showTags();
        };
    });

    // -------------

    // default
    if (!showTags) il_showLectures();
    else il_showTags();
    
}

// ----------------------------------------------------------------------------


var loadpage_words = function(data){
    // data = [lecture, tag] => [null, null]
    var lecture=data[0];
    var tag=data[1];

    var header;
    if (lecture) header="Lecture: "+lecture;
    else header="Tag: "+tag;
    $('div[data-role="header"] h1').text(header);
    $('div[data-role="header"] a[name="left"]').text("Back").show().unbind( "click" ).click(function(event){            
        loadpage("vocabulary", tag); // todo tags oder lecture
    });
    $('div[data-role="header"] a[name="right"]').text("Add").show().unbind( "click" ).click(function(event){            
        loadpage("newword", [lecture, null, false, tag]); // lecture, id
    });

    $('div[role="main"]').append('<ul data-role="listview" data-filter="true" data-filter-placeholder="Search ..." data-filter-reveal="true"  data-inset="true"></ul>');

    // let the list show up:
    $('div[role="main"] ul').listview().listview("refresh"); 

    var inline = function(res){
        /*
        process the data retrieved from database, here: unique lecture names
        */
        var strlevel;
        var levelclass="textwhite";
        for (var i in res){
            
            strlevel=res[i].level; 
            if (isNaN(strlevel)) strlevel=0;
            switch(strlevel){
                case 1:
                    levelclass="textred";
                    break
                case 2:
                    levelclass="textorange";
                    break
                case 3:
                    levelclass="textyellow";
                    break
                case 4:
                    levelclass="textgreen";
                    break
                default:
                    levelclass="textwhite";
                    break
            }
            $('div[role="main"] ul').append('<li><a href="#"" name='+res[i].id+'>'+
                                                '<p class="'+levelclass+'" style="float:right">'+strlevel+'</p>'+
                                                '<p class="truncate" style="float:left">'+res[i].foreign+'</p>'+
                                                '<p class="truncate">'+res[i].native+'</p>'+
                                            '</a></li>');
        }
        // let the list show up:
        $('div[role="main"] ul').listview().listview("refresh"); 
        $('div[role="main"] ul li a').unbind( "click" ).click(function(event){ 
            console.log("DEBUG: Click:", $(this).attr('name'))           
            loadpage("newword",[lecture, $(this).attr('name'), false, tag]);
        });
    };

    if (lecture) db_getWordsOfLecture(lecture, inline);
    else db_getWordsOfTag(tag, inline);

}

// ----------------------------------------------------------------------------


var loadpage_newword = function(data){
    /*
    data = [lecture, id, quiz, tag, search(string)] = ["", null, false, "", ""]
    if applicable load data from one word with "id", otherwise produce empty strings
    display form (incl. data)
    save data or cancel and show previous page (currently lectures) again
    */

    // which page to load next:
    // the following does not need to be in success function, only executed when clicked.
    var inline_afterSaveWord = function(cancel){
        //console.log("inline_afterSaveWord", lecture, tag, quiz, id, cancel);
        // also used after deleting word
        switch (true){
            case id == null && !cancel: // not true for delete
                loadpage("newword", [lecture, null, false, tag]);
                break;
            case search!=null && search!="":
                loadpage("search", [search]);
                break;
            case quiz: 
                loadpage("quizword"); // ####### todo check not executes wrong stuff
                break;
            case lecture!="" && lecture !=null: // id != null
                loadpage("words",[lecture, null]);
                break;
            case tag!="" && tag !=null:
                    console.log("HERE");
                    loadpage("words",[null, tag]);
                    break;
            default: // id != null
                loadpage("vocabulary");
                break;
            
        }
    }

    // ----- adjust header ------------------------------
    $('div[data-role="header"] a[name="left"]').text("Cancel").show().unbind( "click" ).click(function(event){  
            inline_afterSaveWord(true);
    });
    
    
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
            if (lecture=="") {
                alert("Lecture may not be empty. Please choose a lecture.");
                return;
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
                    var string=ext[k];
                    string=string.replace(/\s+/g, ''); // solve bug with extra spaces in tags
                    tags.push(string);
                }
            }
            //console.log("MAIN: NEWWORD: Save "+foreign+" "+native+" "+lecture+" "+tags+" "+comment);
            var row = {foreign:foreign, native:native, comment:comment, lecture:lecture, level:level, tags:tags, id:id, sqlid:sqlid};
            if (quiz) {
                updateQuiz(row);
                db_saveNewWord(null,row, false, "");
                inline_afterSaveWord();
                //db_saveQuizWord(inline_afterSaveWord, row);
            }
            else db_saveNewWord(inline_afterSaveWord,row);
            
    });

    // ----- build basic form ------------------------------
    var theform='<form id="addword">';
    theform+='<label for="foreign">Foreign word:</label><textarea name="foreign" lang="ja" rows="4" cols="16"></textarea><br /><br />';
    theform+='<label for="native">Native translation:</label><textarea name="native" lang="de" rows="4" cols="20"></textarea><br /><br />';
    theform+='<label for="comment">Comment:</label><textarea name="comment" rows="4" cols="20"></textarea><br /><br />';
    theform+='<label for="lecture">Lecture:</label><select name="lecture"><option value="add_new_lecture">Add new lecture ...</option></select>';
    theform+='<div id="newlecture" style="display:none"><label for="newlecture">New Lecture Name:</label><input type="text" name="newlecture"></input></div>';
    theform+='<br /><br /><fieldset data-role="controlgroup" id="tags"><legend>Tags:</legend></fieldset>';
    theform+='<label for="newtag">New tags (separated by ","):</label><input type="text" name="newtag"></input>';
    theform+='</form>';
    $('div[role="main"]').append(theform);

    // ----- fill form with data (empty or not) ---------------
    // textareas
    var lecture = data[0];
    var id = data[1];
    var quiz = data[2];
    var search = data[4];
    var level=0;
    var foreign = "";
    var native="";
    var comment="";
    var tags=data[3]; 
    var tag=tags;
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
            level=res.level;
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
                $('#tags').append('<input type="checkbox" name="'+res[i]+'" id="tags_'+res[i]+'"><label for="tags_'+res[i]+'">'+res[i]+'</label>');
        }
        if (tags!=null){
            for (var i in tags){
                $('#tags input[name="'+tags[i]+'"]').prop('checked', true);
            }

        }
    }
    db_getAllTags(inline_fillTags);

    // -------- enable delete of word

    if (id != null){

        var il_deleteWord=function (){
            if (quiz) {
                deleteWord(id);
                //db_deleteQuizWord(null, id); 
            }
            db_deleteWord (inline_afterSaveWord, id); 
            

        }

        $('div[role="main"]').append('<br /><br /><a id="delete_flashcard" href="#" class="ui-btn ui-corner-all ui-btn-inline icon_btn_wide bkg_red">Delete flashcard</a><br /><br /><br />');
        $('#delete_flashcard').click(function(event){ 
            var answer = window.confirm("Are you sure to delete flashcard?");
            if (answer) {
                console.log("MAIN: Delete card");
                il_deleteWord();
            }
        });
    }
}

