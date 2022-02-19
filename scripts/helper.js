function shuffle(array) {
  // randomize order in array

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function timeHumanReadable(seconds){
  // only sec resolution
  seconds=parseInt(seconds);
  // calc hours to seconds
  var hours = seconds / (60*60);
  hours = parseInt(hours);
  var minutes = seconds - (hours*60*60);
  minutes /= 60;
  minutes = parseInt(minutes)
  var secs = seconds - (hours*60*60) - (minutes*60); 
  // create string
  var string="";
  if (hours) string += hours+" h ";
  if (minutes) string += minutes+" min ";
  if (secs) string += secs+" sec";
  return string;
}