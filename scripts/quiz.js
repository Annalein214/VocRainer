
var QUIZ=[]; // the quiz is stored here and persistent in extra DB table
var INDICES=[]; // this randomizes the quiz, integers with length of QUIZ
var IND=0;
var TRAININGROUNDS=3;
var SUMLEVELS=4; // levels are initiated with 0, so human readable SUMLEVELS is SUMLEVELS+1
var DEFAULTNWORDS=15;
var QUIZDURATION=0;
var STARTTIMEQUIZ=new Date();
// ----------------------------------------------------------------------------

var loadpage_quizstart = function(){
    /*
    Show the choices: currently you can choose 1 lecture and the number of words therein
    */

    // empty quiz if still there:
    emptyQuiz();
    
    // choice
    var lectures=[]; // entries: name
    var tags=[];// entries: name
    var availWords=DEFAULTNWORDS; // sum of available words
    var nWords=DEFAULTNWORDS; // number of words chosen for quiz
    $('div[data-role="header"] h1').text("Quiz");

    $('div[data-role="header"] a[name="right"]').text("Start").show().unbind( "click" ).click(function(event){            
        chooseVariables(lectures, tags, nWords);
    });

    $('div[role="main"]').append('<div>Choose settings for quiz:</div><br />');
    theform='<form id="quizstart">';
    theform+='<label for="nwords"  style="text-align: right; margin-top: -5px; margin-right: 10px; float: left;">Quantity:</label>';
    theform+='<input type="range" name="nwords" value="'+DEFAULTNWORDS+'" min="0" max="100" data-highlight="true" />';
    theform+='<span id="nwords" style="text-align: left;padding-left:5px; margin-top: -10px;">'+DEFAULTNWORDS+'</span><br /><br />';

    //theform+='<label for="lecture" style="text-align: right; margin-top: 3px; margin-right: 10px; float: left;">Lecture:</label><select name="lecture"></select><br /><br />';
    theform+='<label for="lecture_coll" style="text-align: right; float: left;margin-right: 10px; ">Lecture:</label>'+
                '<div id="lecture_coll"></div><br /><br /><br /><br />';

    theform+='<label for="tag_coll" style="text-align: right; float: left;margin-right: 10px; ">Tags:</label>'+
                '<div id="tag_coll"></div>';
    theform+='</form>';
    $('div[role="main"]').append(theform);


    // --------- number of words
    // initialisation is done with the first lecture

    // todo update available words

    var il_updateSlider=function(){
        // update slider and text
        
        $('#quizstart input[name="nwords"]').attr("max",availWords);
        $('#quizstart input[name="nwords"]').val(Math.min(availWords, DEFAULTNWORDS));
        $('#quizstart input[name="nwords"]').focus();
        $('#quizstart input[name="nwords"]').blur();

        $('#nwords').text(Math.min(availWords, DEFAULTNWORDS));
    }

    // update slider text by user
    var inline_updateSliderText=function(event){
        nWords = $('#quizstart input[name="nwords"]').val();
        $('#nwords').text(nWords);
        //console.log(val);
    }
    $('#quizstart input[name="nwords"]').on('input', inline_updateSliderText);

    // ----- lectures
    var inline_fillLecture = function(res){
        // res = [lecture_name, words_in_lecture]


        for (var i in res){
            if (res[i][0]=="") continue;
            var theclass = 'class="bubble"';
            // initialise sldier
            if (parseInt(i)==0){
                theclass = 'class="bubble cs_highl_btn"';
                availWords=res[i][1];
                il_updateSlider(availWords);
                lectures.push(res[i][0]);
            }
            $('#lecture_coll').append('<div '+theclass+' name="'+
                                        res[i][0]+'--'+res[i][1]+'">'+
                                        res[i][0]
                                        +'&nbsp;&nbsp;<span>('+res[i][1]+')</span></div>');   
        }
        $('#lecture_coll div').click(function(event){
                var name=$(this).attr('name').split("--")[0];
                var nWordsInLec=parseInt($(this).attr('name').split("--")[1]);
                //console.log("DEBUG: Lecs:", name, nWordsInLec, availWords, lectures);
                // todo update slider total and slider current value
                if (!$(this).hasClass('cs_highl_btn')) { 
                    $(this).addClass('cs_highl_btn');
                    if (!lectures.includes(name)) lectures.push(name);
                    availWords+=nWordsInLec;
                }
                else{
                    $(this).removeClass('cs_highl_btn');
                    if (lectures.includes(name)) {
                        const index = lectures.indexOf(name);
                        if (index > -1) lectures.splice(index, 1); // 2nd parameter means remove one item only
                        
                    }
                    availWords-=nWordsInLec;
                }
                //console.log("DEBUG2: Lecs:", name, nWordsInLec, availWords, lectures);
                il_updateSlider(availWords);

                
        })
        /* // res = [lecture_name, words_in_lecture]
        // fill with lectures
        lecture=res[0][0]; // set to first element which is shown at start
        for (var i in res){

            $('#quizstart select[name="lecture"]').append('<option value="'+res[i][0]+';'+res[i][1]+'"><span>'+res[i][0]+'</span> <span>&nbsp;&nbsp;&nbsp;('+res[i][1]+')</span></option>');
        }

        // initialise slider with default lecture
        il_updateSlider(res[0][1]);

        // update slider with choice
        $('#quizstart select[name="lecture"]').on('change',function(event){
            lecture=this.value.split(";")[0];
            // adjust slider for new lecture
            var nWordsInLec=this.value.split(";")[1];
            il_updateSlider(nWordsInLec);
        });
        */
    };
    db_getAllLectures(inline_fillLecture, true);

    // ----- tags
    var inline_fillTags = function(res){
        // res = [tag_name, words_in_tag]
        for (var i in res){
            if (res[i][0]=="") continue;
            $('#tag_coll').append('<div class="bubble" name="'+
                                        res[i][0]+'--'+res[i][1]+'">'+
                                        res[i][0]
                                        +'&nbsp;&nbsp;<span>('+res[i][1]+')</span></div>');

            
        }
        $('#tag_coll div').click(function(event){
                var name=$(this).attr('name').split("--")[0];
                var nWordsInTag=parseInt($(this).attr('name').split("--")[1]);
                // todo update slider total and slider current value
                //console.log("DEBUG: Tags:", name, nWordsInTag, availWords, tags);
                if (!$(this).hasClass('cs_highl_btn')) { 
                    $(this).addClass('cs_highl_btn');
                    if (!tags.includes(name)) tags.push(name);
                    availWords+=nWordsInTag;
                }
                else{
                    $(this).removeClass('cs_highl_btn');
                    if (tags.includes(name)) {
                        const index = tags.indexOf(name);
                        if (index > -1) tags.splice(index, 1); // 2nd parameter means remove one item only
                        
                    }
                    availWords-=nWordsInTag;
                }
                //console.log("DEBUG2: Tags:", name, nWordsInTag, availWords, tags);
                il_updateSlider(availWords);
                
        })
    };
    db_getAllTags(inline_fillTags, true);

    
}

// ----------------------------------------------------------------------------

var chooseVariables = function(lectures, tags, nWords){
    /*
    choose variables by oldest access
    save them into a new table
    */

    // once finished with this function: start quiz
    il_loadpage = function (){
        loadpage("quizword");
    }

    var il_chooseVar = function (rows){
        var nRows=rows.length;
        for (var i in rows){
            if (parseInt(i)<parseInt(nWords)) {
                var fct=null;
                // only load next page, when finished
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
    // gives the words with the oldest access
    //if (lecture!=undefined) db_getWordsOfLecture(lecture, il_chooseVar, sortby="lastaccess");
    //else console.log("ERROR: QUIZ: Lecture undefined")

    db_getWordsOfLecAndTag(lectures, tags, nWords, il_chooseVar, sortby="lastaccess");
}

// ----------------------------------------------------------------------------

var emptyQuiz = function(){
        db_emptyQuizTable();
        QUIZ=[];
        QUIZDURATION=0;
    }

var shuffleQuiz = function(){
    
    for (INDICES=[],i=0;i<QUIZ.length;++i) INDICES[i]=i;
    INDICES=shuffle(INDICES);
    IND=0;
    //console.log("QUIZ: Shuffle ",QUIZ.length, INDICES);
}

var updateQuiz = function(row){
    console.log("UPDATE QUIZ", row);
    for (var i in QUIZ){
        if (parseInt(QUIZ[i].id) == parseInt(row.id)){
            QUIZ[i].foreign=row.foreign;
            QUIZ[i].native=row.native;
            QUIZ[i].comment=row.comment;
            QUIZ[i].lecture=row.lecture;
            QUIZ[i].tags=row.tags;
            break;
        }
    }
}

var calcProgress = function(){
        // gives progress in percentage
        var sumSubLevels=0;
        var details={l0:0, // schwarz
                     l1:0, // rot
                     l2:0, // gelb
                     l3:0, // grün
                     l23:0,
                     l123:0, 
                 };
        for (var i in QUIZ){
            var sl=parseInt(QUIZ[i].sublevel)
            sumSubLevels+=sl;
            switch(sl){
                case 0:
                    details.l0+=1;
                    break
                case 1:
                    details.l1+=1;
                    break
                case 2:
                    details.l2+=1;
                    break;
                case 3: 
                    details.l3+=1;
                    break;
            }
        }
        // make percentage
        details.l0=details.l0/QUIZ.length*100;
        details.l1=details.l1/QUIZ.length*100;
        details.l2=details.l2/QUIZ.length*100;
        details.l3=details.l3/QUIZ.length*100;
        // cumulative
        details.l23=details.l2+details.l3;
        details.l123=details.l23+details.l1;
        // round
        details.l3=details.l3.toFixed(0);
        details.l23=details.l23.toFixed(0);
        details.l123=details.l123.toFixed(0);

        //console.log("Showprogress:", sumSubLevels, QUIZ.length, sumSubLevels/QUIZ.length*100/TRAININGROUNDS);
        return [sumSubLevels/QUIZ.length*100/TRAININGROUNDS, details]
}


var deleteWord = function(id){
    // after deletion of word, ensure that it is also deleted in JS variables
    // IND is automatically one step further by this, only have to handle if it runs out of QUIZ.length
    //console.log("BEFORE delete:", QUIZ.length, INDICES.length, IND);
    var newQuiz=[];
    for (var i in QUIZ){
        if (QUIZ[i].id!=id){
            newQuiz.push(QUIZ[i]);
        }
    }
    QUIZ = newQuiz.slice();
    sshuffleQuiz();
    //console.log("AFTER delete:", QUIZ.length, INDICES.length, IND);
}

var loadpage_quizword = function(){
    STARTTIMEQUIZ = new Date();

    // ensure that a varible which was learned sufficiently, is not shown another time
    var i=0;
    console.log("CONTROL1: ", QUIZ[INDICES[IND]], IND, INDICES[IND], INDICES);
    while (parseInt(QUIZ[INDICES[IND]].sublevel)==TRAININGROUNDS){
        console.log("QUIZ: skipWord: ", parseInt(QUIZ[INDICES[IND]].sublevel), TRAININGROUNDS-1, QUIZ.length, IND);
        IND+=1;
        if (IND==QUIZ.length) shuffleQuiz();
        i+=1;
        // emergency break of while
        if (i>TRAININGROUNDS*10*QUIZ.length) { console.log("QUIZ: break shuffle"); break;}
        console.log("CONTROL: ", QUIZ[INDICES[IND]], IND, INDICES[IND], INDICES);
    }
    

    // fill the header
    $('div[data-role="header"] h1').text("Quiz");
    $('div[data-role="header"] a[name="left"]').text("Cancel").show();
    $('div[data-role="header"] a[name="left"]').unbind( "click" ).click(function(event){  
            loadpage("quizsummary"); 
    });
    $('div[data-role="header"] a[name="right"]').text("Edit word").show().unbind( "click" ).click(function(event){  
        var endQuizTime= new Date();
        QUIZDURATION+=(endQuizTime-STARTTIMEQUIZ)/1000; // ms -> sec          
        loadpage("newword",[QUIZ[INDICES[IND]].lecture, QUIZ[INDICES[IND]].id,true]);
    });

    // fill the page with elements
    theContent='<div id="quiz">'
    theContent+='<div id="progress"></div><br />';
    theContent+='<div name="level" class="quizlevel"></div><br /><br />';

    theContent+='<div name="native" class="textblue textcenter"></div><br />';
    theContent+='<div name="foreign" class="textcenter" style="display:none"></div><br />';
    
    theContent+='<div name="comment" class="textcenter textgray" style="display:none"></div><br />';

    //theContent+='<a name="showsolution" href="#" class="ui-btn ui-corner-all ui-btn-inline">Show Solution</a>';
    theContent+='<div class="ui-nodisc-icon textcenter">';
    theContent+='<a name="showsolution" href="#" class="ui-btn ui-shadow ui-corner-all ui-icon-eye ui-btn-icon-notext ui-btn-b ui-btn-inline icon_btn_custom">Check</a>';
    theContent+='<a name="correct" href="#" class="ui-btn ui-shadow ui-corner-all ui-icon-check ui-btn-icon-notext ui-btn-b ui-btn-inline icon_btn_custom bkg_green" style="display:none;">Check</a>';
    theContent+='<a name="wrong" href="#" class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-b ui-btn-inline icon_btn_custom bkg_red" style="display:none;">Delete</a>';
    theContent+='</div>'; // ui-nodisc-icon
    theContent+='</div>'; // quiz

    // fill page with data
    $('div[role="main"]').append(theContent);
    $('#quiz div[name="foreign"]').text(QUIZ[INDICES[IND]].foreign);
    $('#quiz div[name="native"]').text(QUIZ[INDICES[IND]].native);
    $('#quiz div[name="comment"]').text(QUIZ[INDICES[IND]].comment);
    
    var strlevel=QUIZ[INDICES[IND]].level; 
    if (isNaN(strlevel)) strlevel=0;
    $('#quiz div[name="level"]').text('Sublevel: '+QUIZ[INDICES[IND]].sublevel+', Level:'+strlevel);
    var progress = calcProgress()[0];
    $('div[data-role="header"] h1').text('Quiz '+parseFloat(progress).toFixed(0)+'%');
    var pd = calcProgress()[1];
    $('#progress').css("background-size", pd.l3+'% 100%,'+pd.l23+'% 100%,'+pd.l123+'% 100%, 100% 100%');    

    // add functionality
    var il_next = function(){
        var progress=calcProgress()[0];
        IND+=1;
        //console.log("QUIZ:",progress, IND,);
        if (progress<100){
            if (IND == QUIZ.length) shuffleQuiz();
            loadpage("quizword");
        }
        else loadpage("quizsummary");
    }
    var il_save= function(correctAnswer){
        var endQuizTime= new Date();
        QUIZDURATION+=(endQuizTime-STARTTIMEQUIZ)/1000; // ms -> sec
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

    var endQuizTime= new Date();
    QUIZDURATION+=(endQuizTime-STARTTIMEQUIZ)/1000; // ms -> sec

    $('div[data-role="header"] h1').text("Quiz Summary");
    $('div[data-role="header"] a[name="left"]').text("New Quiz").show();
    $('div[data-role="header"] a[name="left"]').unbind( "click" ).click(function(event){  
            loadpage("quiz");
    });


    var text = '<span>Quiz completed by  '+parseFloat(calcProgress()[0]).toFixed(2)+' %</span><br />';
    var learned = 0;
    var partiallyLearned = 0;
    for (var i in QUIZ){

        if (parseInt(QUIZ[i].sublevel)==parseInt(TRAININGROUNDS))learned+=1;
        else if (parseInt(QUIZ[i].sublevel)!=0) partiallyLearned+=1;
        //console.log("QUIZ LEARNED:", parseInt(QUIZ[i].sublevel), parseInt(TRAININGROUNDS), learned, partiallyLearned)
    }

    var learnedAnything=true;
    if (learned == 0){
        // assume nothing was learned, quiz was skipped early
        learnedAnything=false;
    }

    text += '<span>Words learned: '+learned+' out of '+QUIZ.length+'</span><br />';
    text += '<span>Words partially learned: '+partiallyLearned+' out of '+QUIZ.length+'</span><br />';
    text += '<span>Time used: '+timeHumanReadable(QUIZDURATION)+'</span><br />'; // TODO
    text += '<span></span><br />';

    $('div[role="main"]').append(text);

    QUIZDURATION=0;

    if (learnedAnything){
        // save level back to main db table
        var nQuiz=QUIZ.length;
        for (var i in QUIZ){
            var level=parseInt(QUIZ[i].level);
            if (isNaN(level)) level=0;
            //console.log("BEFORE: level", level, QUIZ[i].level, parseInt(QUIZ[i].sublevel));
            switch (parseInt(QUIZ[i].sublevel)){
                case 0:
                    level-=1; 
                    if (level<0) level=0;
                    break;
                // cases 1: do not change main level
                case 2:
                case 3:
                    level+=1;
                    if (level>SUMLEVELS) level=SUMLEVELS;
            }
            QUIZ[i].level=level;
            //console.log("AFTER: level", level, QUIZ[i].level, parseInt(QUIZ[i].sublevel));
            // todo execute when saved....
            var fct=null;
            if (parseInt(i)+1==nQuiz) fct = emptyQuiz;
            db_saveNewWord(fct, QUIZ[i]);
        }
    }
    else{
        $('div[role="main"]').append('<span style="color:red;">Nothing learned. Assume you skipped the quiz early. Do not save results.</span>');
        emptyQuiz();
    }
}



