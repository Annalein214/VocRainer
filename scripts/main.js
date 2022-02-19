var CURRENTPAGE="home";

// ############################################################################
// Main code to start the app

// require that all content is loaded
$( window ).on( "load", function() {
    console.log( "MAIN: Window loaded" ); 
    // -------------- 
    // load the page

    // footer
    $('div[data-role="footer"] a').click(function(event){            
        loadpage(event.target.name);
    });

    loadpage();



    
}); // window loaded

// ############################################################################


var loadpage = function(name, data=null){
    /*
    Handler to load full pages
    the unique name defines which page is to be loaded
    mainly used by the navbar in footer
    TODO: slider for voc->words
    */

    console.log("MAIN: Loadpage: Name:"+name+" Data:",data);
    var previousPage=CURRENTPAGE;
    CURRENTPAGE=name;

    // make sure time does not run forever
    if (previousPage && previousPage.includes('quiz') && !CURRENTPAGE.includes('quiz')){
        var endQuizTime= new Date();
        QUIZDURATION+=(endQuizTime-STARTTIMEQUIZ)/1000; // ms -> sec       
    }

    // automatic sync after 1 hour
    const date=Math.floor(new Date().getTime() / 1000)
    console.log("MAIN: Loadpage:", date, localStorage.getItem("lastsync"), date-parseInt(localStorage.getItem("lastsync")));
    if (date-parseInt(localStorage.getItem("lastsync")) >= 3600){
        // do not interrupt a quiz
        if (previousPage && !previousPage.includes('quizword') && CURRENTPAGE && !CURRENTPAGE.includes('quizword')){
            sy_master();
        }
    }

    // first empty the page
    $('div[role="main"]').empty();
    // header cannot be removed+added, only manipulated
    $('div[data-role="header"] a[name="left"]').hide();
    $('div[data-role="header"] a[name="right"]').hide();

    // load new page
    switch (name){
        case "quiz":
            // if quiz still running, go back
            if (QUIZ.length!=0) loadpage_quizword();
            else loadpage_quizstart();
            break;
        case "quizword":
            loadpage_quizword();
            break;
        case "quizsummary":
            loadpage_quizsummary();
            break
        case "vocabulary":
            loadpage_voc(data);
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
        case "search":
            loadpage_search(data);
            break
        case "statistics":
        default:
            loadpage_statistics();
            break;
    }
}


// ----------------------------------------------------------------------------



var loadpage_home = function(){
    /*
    re-load main landing page
    */
    $('div[data-role="header"] h1').text("VocRainer");
    $('div[role="main"]').append("<p>The Home with good News.</p>");
    
}

// ----------------------------------------------------------------------------

var loadpage_search = function(data){
    var searchstring="";
    if (data && data.length) searchstring=data[0];
    $('div[data-role="header"] h1').text("Search");
    $('div[data-role="header"] a[name="left"]').text("Cancel").show().unbind( "click" ).click(function(event){            
        loadpage("vocabulary");
    });


    var theform='<form id="searchword">';
    theform+='<input type="text" name="search" type="search" placeholder="Native/Foreign/Comment"></input>'+
             '<a id="search-btn" href="#" class="ui-btn ui-corner-all ui-btn-inline">Search</a>'
    theform+='</form>';
    $('div[role="main"]').append(theform);

    var il_fillRows = function (res){
        console.log("DEBUG: fillrows", res);
        $('div[role="main"] ul').append('<li><a href="#" name="'+res.id+'--'+res.lecture+'">'+
                                                //'<p style="float:right">'+res[i][1]+'</p>'+
                                                '<p class="truncate" style="float:left">'+res.foreign+'</p>'+
                                                '<p class="truncate">'+res.native+'</p>'+
                                            '</a></li>');
    }

    var il_finish = function(res){
        console.log("DEBUG: il_finish", res);
        if (res){
            $('div[role="main"] ul').listview().listview("refresh");
            $('div[role="main"] ul li a').unbind( "click" ).click(function(event){    
                var id=$(this).attr('name').split('--')[1]; 
                var lecture=$(this).attr('name').split('--')[1];        
                loadpage("newword",[lecture, id, false, "", searchstring]); //[lecture, id, quiz, tag, search]
            });
        }
        else {
            $('#listOfFound').remove();
            $('div[role="main"]').append("<p>No match found!</p>")
        }
        $("#busy").hide();
    }

    var il_search=function(){
        $("#busy").show();
        searchstring = $('#searchword input[name="search"]').val();
        $('div[role="main"]').append('<ul id="listOfFound" data-role="listview" data-filter="true" data-inset="true"></ul>');
        console.log("MAIN: search string",searchstring);
        if (searchstring.replace(/\s+/g, '')!="") db_searchWord(searchstring, il_fillRows, il_finish);
        else {
            $("#busy").hide();
        }
    }

    if (searchstring!=""){
        $('#searchword input[name="search"]').val(searchstring);
        il_search();
    }



    $('#search-btn').click(il_search);

}

// ----------------------------------------------------------------------------



var loadpage_statistics = function(){
    $('div[data-role="header"] h1').text("Statistics");
    $('div[role="main"]').append('<p id="stat_words"></p>');
    $('div[role="main"]').append('<p id="stat_lect"></p>');

    var il_lec = function(res){
        console.log("DEBUG15:", res)
        
        var nWords=0;
        for (var i in res){
            nWords+=parseInt(res[1]);
        }
        $('#stat_words').text("Words:"+nWords);
        $('#stat_lect').text("Lectures:"+i);
    }

    db_getAllLectures(il_lec, true);
    
}

// ----------------------------------------------------------------------------

if (localStorage.getItem("readaloud") === null) {
  localStorage.setItem('readaloud',1); // default on
}

var loadpage_settings = function(){
    $('div[data-role="header"] h1').text("Settings");

    var selected=''; 
    if (localStorage.getItem("readaloud")) selected=' selected=""';
    $('div[role="main"]').append('<div class="ui-field-contain">'+
                                    '<label for="readaloud">Read words aloud in quiz:</label>'+
                                        '<select name="readaloud" id="readaloud" data-role="flipswitch">'+
                                            '<option value="off">Off</option>'+
                                            '<option value="on" '+selected+'>On</option>'+
                                        '</select></div>');
    $("#readaloud").on("change", function(e){
        
        if (this.value=="off") localStorage.setItem('readaloud',0);
        else localStorage.setItem('readaloud',1);
        //console.log("T", this.value, localStorage.getItem("readaloud"));
    });
    
    $('div[role="main"]').append('<a id="exportsync" href="#" class="ui-btn ui-corner-all ui-btn-inline icon_btn_wide">Sync Database</a><br /><br /><br />');
    $('div[role="main"]').append('Only for developers:<br />');
    $('div[role="main"]').append('<a id="emptydb" href="#" class="ui-btn ui-corner-all ui-btn-inline icon_btn_wide">Delete DB</a><br />');
    //$('div[role="main"]').append('<a id="quizemptytable" href="#" class="ui-btn ui-corner-all ui-btn-inline icon_btn_wide">Empty Quiz Tbl</a><br />');
    
    $('#emptydb').click(function(event){            
        //db_cleardb(); 
        db_deleteDB();       
    });
    $('#exportsync').click(function(event){            
        sy_master();        
    });
    /*$('#quizemptytable').click(function(event){            
        db_emptyQuizTable();        
    }); */
}

// ----------------------------------------------------------------------------

