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
    if (previousPage =="quiz"){
        if (!CURRENTPAGE.includes('quiz')){
            var endQuizTime= new Date();
            QUIZDURATION+=(endQuizTime-STARTTIMEQUIZ)/1000; // ms -> sec       
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
        case "statistics":
            loadpage_statistics();
            break
        case "home":
        default:
            loadpage_home();
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


var loadpage_statistics = function(){
    $('div[data-role="header"] h1').text("Statistics");
    $('div[role="main"]').append("<p>Lectures:</p>");
    $('div[role="main"]').append("<p>Words:</p>");
    $('div[role="main"]').append("<p>Learned over time: Percentage of words with full level compared to all words</p>");
    
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
    $('div[role="main"]').append('<a id="quizemptytable" href="#" class="ui-btn ui-corner-all ui-btn-inline icon_btn_wide">Empty Quiz Tbl</a><br />');
    
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

// ----------------------------------------------------------------------------

