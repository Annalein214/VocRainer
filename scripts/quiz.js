
var QUIZ=[]; // the quiz is stored here and persistent in extra DB table
var INDICES=[]; // this randomizes the quiz, integers with length of QUIZ
var IND=0;
var TRAININGROUNDS=3;
var SUMLEVELS=4; // levels are initiated with 0, so human readable SUMLEVELS is SUMLEVELS+1
var DEFAULTNWORDS=15;
// ----------------------------------------------------------------------------

var loadpage_quizstart = function(){
    /*
    Show the choices: currently you can choose 1 lecture and the number of words therein
    */
    
    var lecture;
    var nWords=DEFAULTNWORDS;
    $('div[data-role="header"] h1').text("Choose settings for Quiz:");

    $('div[data-role="header"] a[name="right"]').text("Start").show().unbind( "click" ).click(function(event){            
        chooseVariables(lecture, nWords);
    });

    theform='<form id="quizstart">';
    theform+='<label for="lecture">Lecture:</label><select name="lecture"></select>';
    theform+='<label for="nwords">Number of words: <span id="nwords">'+DEFAULTNWORDS+'</span></label><input type="range" name="nwords" value="'+DEFAULTNWORDS+'" min="0" max="100">';
    theform+='</form>';
    $('div[role="main"]').append(theform);


    // lectures
    var inline_fillLecture = function(res){
        // fill with lectures
        lecture=res[0][0];
        for (var i in res){

            $('#quizstart select[name="lecture"]').append('<option value="'+res[i][0]+';'+res[i][1]+'">'+res[i][0]+' ('+res[i][1]+')</option>');
        }
        $('#quizstart input[name="nwords"]').val(Math.min(res[0][1], DEFAULTNWORDS));
        $('#nwords').text(Math.min(res[0][1], DEFAULTNWORDS));
        $('#quizstart input[name="nwords"]').attr("max",res[0][1]);
        $('#quizstart input[name="nwords"]').focus();
        $('#quizstart input[name="nwords"]').blur();

        $('#quizstart select[name="lecture"]').on('change',function(event){
            lecture=this.value.split(";")[0];
            // adjust slider for new lecture
            var nWordsInLec=this.value.split(";")[1];
            $('#quizstart input[name="nwords"]').val(Math.min(nWordsInLec, DEFAULTNWORDS));
            $('#nwords').text(Math.min(nWordsInLec, DEFAULTNWORDS));
            $('#quizstart input[name="nwords"]').attr("max",nWordsInLec);
            $('#quizstart input[name="nwords"]').focus();
            $('#quizstart input[name="nwords"]').blur();
        });
    };
    db_getAllLectures(inline_fillLecture, true);

    // number of words
    var inline_updateSlider=function(event){
        nWords = $('#quizstart input[name="nwords"]').val();
        $('#nwords').text(nWords);
        //console.log(val);
    }
    $('#quizstart input[name="nwords"]').on('input', inline_updateSlider);
}

// ----------------------------------------------------------------------------

var chooseVariables = function(lecture, nWords){
    /*
    choose variables by oldest access
    save them into a new table
    */

    console.log("QUIZ: Choice: Lecture:",lecture, "Words:",nWords);

    il_loadpage = function (){
        loadpage("quizword");
    }

    var il_chooseVar = function (rows){
        var nRows=rows.length;
        for (var i in rows){
            if (parseInt(i)<parseInt(nWords)) {
                var fct=null;
                if (parseInt(i)+1==Math.min(nRows,nWords)) fct=il_loadpage;
                rows[i].sublevel=0;
                QUIZ.push(rows[i]);
                db_saveQuizWord(fct, rows[i]);
                
            }
        }
        // randomize the quiz
        //console.log("QUIZ: nWords",nWords, nRows, Math.min(nRows,nWords), QUIZ.length);
        shuffleQuiz();
    }
    if (lecture!=undefined) db_getWordsOfLecture(lecture, il_chooseVar, sortby="lastaccess");
    else console.log("ERROR: QUIZ: Lecture undefined")
    
}

// ----------------------------------------------------------------------------

var shuffleQuiz = function(){
    
    for (INDICES=[],i=0;i<QUIZ.length;++i) INDICES[i]=i;
    INDICES=shuffle(INDICES);
    IND=0;
    //console.log("QUIZ: Shuffle ",QUIZ.length, INDICES);
}

var calcProgress = function(){
        var sumSubLevels=0;
        for (var i in QUIZ){
            sumSubLevels+=parseInt(QUIZ[i].sublevel);
        }
        //console.log("Showprogress:", sumSubLevels, QUIZ.length, sumSubLevels/QUIZ.length*100/TRAININGROUNDS);
        return sumSubLevels/QUIZ.length*100/TRAININGROUNDS;
}

var loadpage_quizword = function(){
    $('div[data-role="header"] h1').text("Quiz");
    $('div[data-role="header"] a[name="left"]').text("Cancel").show();
    $('div[data-role="header"] a[name="left"]').unbind( "click" ).click(function(event){  
            loadpage("quizsummary"); 
    });

    

    theContent='<div id="quiz">'
    theContent+='<div name="progress"></div><br /><br />';
    theContent+='<div name="level"></div><br /><br /><br /><br />';

    theContent+='<div name="native"></div><br />';
    theContent+='<div name="foreign" style="display:none"></div><br />';
    
    theContent+='<div name="comment" style="display:none"></div><br />';

    //theContent+='<a name="showsolution" href="#" class="ui-btn ui-corner-all ui-btn-inline">Show Solution</a>';
    theContent+='<div class="ui-nodisc-icon">';
    theContent+='<a name="showsolution" href="#" class="ui-btn ui-shadow ui-corner-all ui-icon-eye ui-btn-icon-notext ui-btn-b ui-btn-inline">Check</a>';
    theContent+='<a name="correct" href="#" class="ui-btn ui-shadow ui-corner-all ui-icon-check ui-btn-icon-notext ui-btn-b ui-btn-inline" style="background:green;display:none;">Check</a>';
    theContent+='<a name="wrong" href="#" class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-b ui-btn-inline" style="background:red;display:none;">Delete</a>';
    theContent+='</div>'; // ui-nodisc-icon
    theContent+='</div>'; // quiz

    // ensure that a varible which was learned sufficiently, is not shown another time
    var i=0;
    while (parseInt(QUIZ[INDICES[IND]].sublevel)==TRAININGROUNDS){
        console.log("QUIZ: search variable: ", parseInt(QUIZ[INDICES[IND]].sublevel), TRAININGROUNDS-1, QUIZ.length, IND);
        IND+=1;
        if (IND==QUIZ.length) shuffleQuiz();
        i+=1;
        if (i>TRAININGROUNDS*10*QUIZ.length) { console.log("QUIZ: break shuffle"); break;}
    }

    $('div[role="main"]').append(theContent);
    $('#quiz div[name="foreign"]').text(QUIZ[INDICES[IND]].foreign);
    $('#quiz div[name="native"]').text(QUIZ[INDICES[IND]].native);
    $('#quiz div[name="comment"]').text(QUIZ[INDICES[IND]].comment);
    $('#quiz div[name="level"]').text('Sublevel/Level: '+QUIZ[INDICES[IND]].sublevel+'/'+QUIZ[INDICES[IND]].level);
    $('#quiz div[name="level"]').text('Progress: '+parseFloat(calcProgress()).toFixed(1)+'%');
    

    var il_next = function(){
        var progress=calcProgress();
        IND+=1;
        //console.log("QUIZ:",progress, IND,);
        if (progress<100){
            if (IND == QUIZ.length) shuffleQuiz();
            loadpage("quizword");
        }
        else loadpage("quizsummary");
    }
    var il_save= function(correctAnswer){
        // save if word was known, load new page
        var level=parseInt(QUIZ[INDICES[IND]].sublevel);
        if (correctAnswer) level+=1;
        else if (level>0) level-=1; 
        QUIZ[INDICES[IND]].sublevel=level;
        db_saveQuizWord(il_next, QUIZ[INDICES[IND]], level);        
    }

    $('#quiz div a[name="correct"]').click(function(event){ 
        // save that word was known, load new page
        il_save(true);
    });
    $('#quiz div a[name="wrong"]').click(function(event){ 
        // save that word was not known, load new page
        il_save(false);
    });

    $('#quiz a[name="showsolution"]').click(function(event){            
        $('#quiz div[name="foreign"]').show();
        $('#quiz div[name="comment"]').show();
        $('#quiz div a[name="wrong"]').show();
        $('#quiz div a[name="correct"]').show();
        $('#quiz div a[name="showsolution"]').hide();
        
    });

}

var loadpage_quizsummary = function(){
    // save progress
    // empty table

    $('div[data-role="header"] h1').text("Quiz Summary");
    $('div[data-role="header"] a[name="left"]').text("New Quiz").show();
    $('div[data-role="header"] a[name="left"]').unbind( "click" ).click(function(event){  
            loadpage("quiz");
    });


    var text = '<span>Progress: '+parseFloat(calcProgress()).toFixed(2)+' %</span><br />';
    var learned = 0;
    var partiallyLearned = 0;
    for (var i in QUIZ){

        if (parseInt(QUIZ[i].sublevel)==parseInt(TRAININGROUNDS))learned+=1;
        else if (parseInt(QUIZ[i].sublevel)!=0) partiallyLearned+=1;
        console.log("QUIZ LEARNED:", parseInt(QUIZ[i].sublevel), parseInt(TRAININGROUNDS), learned, partiallyLearned)
    }

    TRAININGROUNDS
    text += '<span>Words learned: '+learned+' out of '+QUIZ.length+'</span><br />';
    text += '<span>Words partially learned: '+partiallyLearned+' out of '+QUIZ.length+'</span><br />';
    text += '<span>Time used: (TBD)</span><br />'; // TODO
    text += '<span>Total in this lecture / tag: (TBD)</span><br />';
    text += '<span>Total of all vocabulary: (TBD)</span><br />';
    text += '<span></span><br />';

    $('div[role="main"]').append(text);

    var il_empty = function(){
        db_emptyQuizTable();
        QUIZ=[];
    }

    // save level back to main db table
    var nQuiz=QUIZ.length;
    for (var i in QUIZ){
        var level=parseInt(QUIZ[i].level);
        switch (parseInt(QUIZ[i].sublevel)){
            case 0:
                level-=1; 
                if (level<0) level=0;
                break;
            // case 1: do not change main level
            case 2:
                level+=1;
                if (level>SUMLEVELS) level=SUMLEVELS;
        }
        QUIZ[i].level=level;
        // todo execute when saved....
        var fct=null;
        if (parseInt(i)+1==nQuiz) fct = il_empty;
        db_saveNewWord(fct, QUIZ[i]);
    }
}



