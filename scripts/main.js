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
            if (localStorage.getItem("lastsyncattempt") >= 3600) {// do not try all the time when offline
                //sy_master();
            }
        }
    }

    if (!theDB) {
        //setTimeout(loadpage(name, data), 1000);
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
    $('div[role="main"]').append('<h2>Numbers</h2>');
    $('div[role="main"]').append('<p id="stat_words"></p>');
    $('div[role="main"]').append('<p id="stat_lect"></p>');
    $('div[role="main"]').append('<p id="stat_tags"></p>');
    $('div[role="main"]').append('<h2>Graphs</h2>');
    $('div[role="main"]').append('<div><canvas id="levelPerDay"></canvas></div>');
    $('div[role="main"]').append('<div><canvas id="wordsPerDay"></canvas></div>');
    $('div[role="main"]').append('<div><canvas id="timePerDay"></canvas></div>');

    //----
    var il_fillWordsGraph = function(res){

        var labels=[];
        var values=[];
        for (var i in res){
            labels.push(res[i].thedate);
            values.push(res[i].nWords);
        }

        const data = {
            labels: labels,
            datasets: [{
              label: 'Words learned per day',
              backgroundColor: 'rgb(0, 206, 0)',
              borderColor: 'rgb(0, 206, 0)',
              data: values,
            }]
          };

          const config = {
            type: 'line',
            data: data,
            options: {}
          };

        const myChart = new Chart(
            document.getElementById('wordsPerDay'),
            config
          );
    }
    db_getStatDates(il_fillWordsGraph);


    //----
    var il_fillTimeGraph = function(res){

        var labels=[];
        var values=[];
        for (var i in res){
            labels.push(res[i].thedate);
            values.push(res[i].thetime/60); // -> min
        }

        const data = {
            labels: labels,
            datasets: [{
              label: 'Time leanred per day',
              backgroundColor: 'rgb(0, 162, 199)',
              borderColor: 'rgb(0, 162, 199)',
              data: values,
            }]
          };

          const config = {
            type: 'line',
            data: data,
            options: {}
          };

        const myChart = new Chart(
            document.getElementById('timePerDay'),
            config
          );
    }
    db_getStatTimeDates(il_fillTimeGraph);
    
    

    // ----
    var il_tag = function(res){
        $('#stat_tags').text("Tags: "+res.length);
    }
    db_getAllTags(il_tag, true);

    // ----
    var il_lec = function(res){
        //console.log("DEBUG15:", res)
        
        var nWords=0;
        for (var i in res){
            nWords+=parseInt(res[i][1]);
        }
        $('#stat_words').text("Words: "+nWords);
        $('#stat_lect').text("Lectures: "+i);
    }
    db_getAllLectures(il_lec, true);

    //----
    // check words for today and update them
    var il_levelUpdate = function(res){
        var levelArr=[0,0,0,0,0];
        var nWords=0;
        for (var i in res){
            levelArr[0]+=parseInt(res[i][3][0]);
            levelArr[1]+=parseInt(res[i][3][1]);
            levelArr[2]+=parseInt(res[i][3][2]);
            levelArr[3]+=parseInt(res[i][3][3]);
            levelArr[4]+=parseInt(res[i][3][4]);
            nWords+=parseInt(res[i][1]);
        }
        //console.log("DEBUG:", nWords, levelArr);
        //levelArr=[0,0,0,0,0];
        db_updateStatLevels(null,levelArr);
    }
    db_getAllLectures(il_levelUpdate, true, true);

    var il_level = function(res){
        var labels=[];
        var values0=[];
        var values1=[];
        var values2=[];
        var values3=[];
        var values4=[];
        for (var i in res){
            labels.push(res[i].thedate);
            var levelArr=res[i].thelevels.split(",");
            values0.push(levelArr[0]);
            values1.push(levelArr[1]);
            values2.push(levelArr[2]);
            values3.push(levelArr[3]);
            values4.push(levelArr[4]);
        }

        const data = {
            labels: labels,
            datasets: [
                {
                  label: 'Level 1',
                  backgroundColor: 'rgb(255, 0, 0)',
                  borderColor: 'rgb(255, 0, 0)', // red
                  data: values0,
                  yAxisID:'y1',
                  borderDash: [5, 5],
                },
                {
                  label: 'Level 2',
                  backgroundColor: 'rgb(255, 135, 0)',
                  borderColor: 'rgb(255, 135, 0)', // orange
                  data: values1,
                  yAxisID:'y',
                },
                {
                  label: 'Level 3',
                  backgroundColor: 'rgb(245, 232, 0)',
                  borderColor: 'rgb(245, 232, 0)', // yellow
                  data: values2,
                  yAxisID:'y',
                },
                {
                  label: 'Level 4',
                  backgroundColor: 'rgb(0, 206, 0)',
                  borderColor: 'rgb(0, 206, 0)', // green
                  data: values3,
                  yAxisID:'y',
                },
                {
                  label: 'Level 5',
                  backgroundColor: 'rgb(0, 162, 199)',
                  borderColor: 'rgb(0, 162, 199)', // blue
                  data: values4,
                  yAxisID:'y',
                },
            ]
          };

          const config = {
            type: 'line',
            data: data,
            options: { 
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Words per Level'
                  }
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',

                    // grid line settings
                    grid: {
                      drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                  } // y1
                }, // scales
             }, // options
          };

        const myChart = new Chart(
            document.getElementById('levelPerDay'),
            config
          );
    }
    db_getStatLevels(il_level, true, true);
    
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
                                    '<label for="readaloud" style="float:left;width: 70% !important;">Read words aloud in quiz:</label>'+
                                        '<select name="readaloud" id="readaloud" data-role="flipswitch">'+
                                            '<option value="off">Off</option>'+
                                            '<option value="on" '+selected+'>On</option>'+
                                        '</select></div>');
    $("#readaloud").on("change", function(e){
        
        if (this.value=="off") localStorage.setItem('readaloud',0);
        else localStorage.setItem('readaloud',1);
        //console.log("T", this.value, localStorage.getItem("readaloud"));
    });

    // ------------
    
    $('div[role="main"]').append('<a id="exportsync" href="#" class="ui-btn ui-corner-all ui-btn-inline icon_btn_wide">Sync Database</a><br />');
    var unix = localStorage.getItem("lastsync");
    var date = new Date(unix*1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var formattedTime = hours + ':' + minutes.substr(-2);
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var formattedDate = day + '.' + month + '.' + year;
    $('div[role="main"]').append('Last sync: '+formattedDate+' '+formattedTime+' <br /><br /><br />');

    // ------------

    $('div[role="main"]').append('Only for developers:<br />');
    $('div[role="main"]').append('<a id="emptydb" href="#" class="ui-btn ui-corner-all ui-btn-inline icon_btn_wide">Delete DB</a><br />');
    //$('div[role="main"]').append('<a id="quizemptytable" href="#" class="ui-btn ui-corner-all ui-btn-inline icon_btn_wide">Empty Quiz Tbl</a><br />');
    
    $('#emptydb').click(function(event){            
        db_cleardb(); 
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

